import log        from 'log';
import dom        from 'dom';

import * as env   from '../env';

import DomView    from './base';
import FigureView from '../views/figure';


var events = {
  resize: 'resize',
  close:  'load',
};


export default class Figure extends DomView(FigureView) {

  constructor(args) {
    super(args);
    this.bind(events);
  }


  attach() {
    super.attach();
    this.resize();
  }


  resize() {
    this.children.map(c => c.reset());
    this.setSize();
    this.children.map(c => c.position());
  }


  load() {

    if (this.loaded)
      return;

    this.loaded = true;

    let img;
    if (this.attrs.type === 'Video') {
      img = this.find('img.poster');
      img.src = env.contentOrigin + this.source.poster;
    }
    else {
      img = this.find('img.full');
      img.src = env.contentOrigin + this.source.url;
    }

    let thumb = this.find('img.thumb');

    let removeLoading = () => {
      thumb.addEventListener('transitionend', e => dom(thumb).remove());
      this.removeClass('loading');
    }

    setTimeout(() => {
      if (img.complete)
        removeLoading();
      else
        img.onload = () => {
          removeLoading();
          img.onload = undefined
        };
    },0);

  }


  setSize(reset = true) {

    if (reset) {
      this.resetCSS();
      this.select('.frame, .crop').resetCSS();
    }

    // where we foolishly attempt to find what the height should be
    let targetHeight;

    dom(this.el.children).css({position: 'absolute'});
    let targetWidth = this.el.clientWidth || this.source.width;
    let naturalHeight = Math.round(targetWidth * this.aspectRatio);
    naturalHeight = Math.min(1.2 * this.attrs.media.original_height, naturalHeight);
    let currentHeight = this.el.clientHeight;
    dom(this.el.children).css({position: ''});

    let maxHeight = this.getCSS('max-height')
    maxHeight = (
      typeof maxHeight == 'number' ? Math.round(maxHeight) : undefined
    );
    let minHeight = this.getCSS('min-height');
    minHeight = (
      typeof minHeight == 'number' ? Math.round(minHeight) : undefined
    );

    // big problems result when the overlay has margin-bottom/top: auto.
    // everything breaks! the margin just takes up all the space and this
    // reads at the same height. perhaps there's a way to fix??
    let heightOutside = Array.from(this.el.children).reduce((sum, el) => {
      let child = dom(el);
      if (!child.is('.frame') && child.getCSS('position') !== 'absolute')
        sum += child.outerHeight();
      return sum;
    }, 0);
    heightOutside = Math.round(heightOutside);

    let maxApplies = (
      typeof maxHeight === 'number' &&
      currentHeight - heightOutside <= 0 &&
      (naturalHeight + heightOutside) > maxHeight
    );

    let minApplies = (
      currentHeight <= minHeight &&
      typeof minHeight === 'number' && (
        naturalHeight + heightOutside < minHeight ||
        // in CSS, min-height takes precedence over max-height
        (maxApplies && maxHeight < minHeight)
      )
    );

    if (maxApplies)
      targetHeight = maxHeight - heightOutside;
    else if (minApplies)
      targetHeight = minHeight - heightOutside;
    // this is straight up height set in CSS
    else if (currentHeight - heightOutside > 0 &&
             currentHeight !== minHeight)
      targetHeight = currentHeight - heightOutside;
    // let it all be natural
    else
      targetHeight = naturalHeight;

    let comment = Array.from(this.find('.frame').childNodes).find(n => {
      return n.nodeType === document.COMMENT_NODE;
    });

    comment.textContent = (` 
      The .frame size is calculated based on the width and height of the 
      figure set in CSS and any cropping that is applied.

      name:           ${this.attrs.media.name}
      targetWidth:    ${targetWidth}px

      naturalHeight:  ${naturalHeight}px
      currentHeight:  ${currentHeight}px
      heightOutside:  ${heightOutside}px

      minHeight:      ${minHeight ? minHeight + 'px' : 'none'}
      minApplies:     ${minApplies}
      maxHeight:      ${maxHeight ? maxHeight + 'px' : 'none'}
      maxApplies:     ${maxApplies}

      targetHeight:   ${targetHeight}px
    `);

    this.setScale(
      this.findScale({
        targetWidth,
        targetHeight,
        cropType: 'responsive',
        cropBox: this.attrs.crop,
        sourceWidth: this.source.width,
        sourceHeight: this.source.height,
      })
    );

    targetHeight = Math.round(Math.min(
      this.scale * this.source.height,
      targetHeight
    ));
    
    targetWidth = Math.round(Math.min(
      this.scale * this.source.width,
      targetWidth
    ));

    this.css({width: targetWidth});
    this.select('.frame').css({height: targetHeight});

    this.offset = {left: 0, top: 0};

    if (!this.attrs.crop)
      return;

    this.setOffset(
       this.findOffset({
        targetWidth,
        targetHeight,
        align: 'center',
        cropBox: this.attrs.crop,
        sourceWidth: this.source.width,
        sourceHeight: this.source.height,
      })
    );

    return this;
  }



  setScale(scale) {
    //log({scale});

    this.scale = scale;
    this.scaledWidth = Math.round(this.source.width * this.scale);
    this.scaledHeight = Math.round(this.source.height * this.scale);

    // if (this.el.clientHeight > this.scaledHeight)
    //   this.select('.crop, .frame').css({height: this.scaledHeight});
    // else
    //   this.select('.crop, .frame').css({flex: '1 0 auto'});

    this.select('img, video').css({
      position: 'absolute',
      width: this.scaledWidth,
      height: this.scaledHeight,
    });
  }


  findScale(args) {
    // log('findScale', args);

    // these are scales for the two dimensions          
    var hScale = args.targetHeight / args.sourceHeight;
    var wScale = args.targetWidth / args.sourceWidth;

    // log({hScale, wScale});

    // default is to not crop anything
    var scale = hScale < wScale ? hScale : wScale;

    if (args.cropType === 'fillscreen')
      // use the bigger one to fill all space available 
      scale = hScale > wScale ? hScale : wScale;

    if (args.cropType === 'none')
      // use the smaller one to make sure nothing's cut out
      scale = hScale < wScale ? hScale : wScale;

    // this crops using the box
    else if (args.cropBox) {

      // use max scale to fill screen (no space missing)
      scale = hScale > wScale ? hScale : wScale;

      // log('wScale = ' + args.targetWidth + ' / (' + args.cropBox.width + ' * ' + args.sourceWidth + ')');
      // log('hScale = ' + args.targetHeight + ' / (' + args.cropBox.height + ' * ' + args.sourceHeight + ')');

      // scale as if box we're fitting screen size, one for each dimension
      wScale = args.targetWidth / (args.cropBox.width * args.sourceWidth);
      hScale = args.targetHeight / (args.cropBox.height * args.sourceHeight);
      // log({hScale, wScale});
     
      // 'responsive' picks smaller scale
      // so that none of the box is cropped out
      // if these scales are smaller, we'll need to use one of them instead
      // this will mean a smaller zoom but we won't be cropping out important things
      if (args.cropType === 'responsive') {
        if (wScale < scale || hScale < scale)
          scale = hScale < wScale ? hScale : wScale;
      }
      // 'contain' picks bigger scale
      // so that the viewport is contained in the box
      else if (args.cropType === 'contain') {
        if (wScale > scale || hScale > scale)
          scale = hScale > wScale ? hScale : wScale;
      }
      // this is kinda in between the two
      // uses scale from above (fillscreen)
      // so we'll use the box for position only
      else if (args.cropType === 'fill') {
      
      }
 
    } 

    // log('returning scale ' + scale);
    return scale;
  }



  setOffset(offset) {
    //log('setting position with offset: top ' + offset.top + ', left ' + offset.left);
    this.offset = offset;

    this.select('img, video').css({
      position: 'absolute',
      left: Math.round(offset.left),
      top: Math.round(offset.top),
    })

  }

  findOffset(args) {

    var offset = {};

    var vAlign = 'center';
    if (/top/.test(args.align))
      vAlign = 'start'
    else if (/bottom/.test(args.align))
      vAlign = 'end'

    var scaledHeight = args.scale ? (args.sourceHeight * args.scale) : this.scaledHeight;

    // vertical offset
    offset.top = this.findAxisOffset({
      cropStart: args.cropBox ? args.cropBox.top * scaledHeight : 0,
      cropSize: args.cropBox ?
        args.cropBox.height * scaledHeight : scaledHeight,
      container: args.targetHeight,
      image: scaledHeight,
      align:  vAlign
    });


    var hAlign = 'center';
    if (/left/.test(args.align))
      hAlign = 'start'
    else if (/right/.test(args.align))
      hAlign = 'end'

    var scaledWidth = args.scale ? (args.sourceWidth * args.scale) : this.scaledWidth;

    // horizontal offset
    offset.left = this.findAxisOffset({
      cropStart: args.cropBox ? args.cropBox.left * scaledWidth : 0,
      cropSize: args.cropBox ? args.cropBox.width * scaledWidth : scaledWidth,
      container: args.targetWidth,
      image: scaledWidth,
      align:  hAlign
    });

    return offset;
  }



  /*
   *  Finds position of picture for one axis given size of screen, image, vars 
   */
  findAxisOffset(args) {
    //log('findAxisOffset', args);

    var offset; 

    // zero offset because image fits exactly
    if (args.container === args.image) {
      offset = 0;
    }

    // if there's no box or the image is smaller than the screen
    // this is relatively easy
    else if (typeof args.cropSize === 'undefined' ||
             args.container > args.image) {

      if (args.align === 'start')
        offset = 0;
      else if (args.align === 'end')
        offset = args.container - args.image
      else
        // default is centered
        offset = (args.container - args.image) / 2;
    }

    // if there's a crop box and the image is bigger than the container,
    // we need to move it move it up/left with a negative offset
    else if (args.image > args.container) {

      // start with the box at top/left of container 
      offset = -1 * args.cropStart;


      if (args.align === 'start')
        // that's where we're at already
        offset = offset;
      else if (args.align === 'end')
        offset = offset + args.container - args.cropSize;
      else
        // default is centered
        offset = offset + ((args.container - args.cropSize) / 2);

      // if it's off the container (too high/left), move it back on
      if ((args.image + offset) < args.container) {
        offset = -1 * (args.image - args.container); // should be zero for left ...
      }

      // if it's off the container the other way (positive offset), move it back on
      if (offset > 0)
        offset = 0;
    }


    //if (offset)
    //  offset = offset / args.container;

    //cp.l('returning offset: ' + offset);
    return offset;
  }

};


dom.mixin(Figure.prototype);

