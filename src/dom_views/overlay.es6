import dom     from 'dom';

const factory = superClass => class Overlay extends superClass {


  reset() {
    var willPosition = (
      this.attrs.is_positioned || this.css('position') === 'absolute'
    );

    // the 'reset' position is inside the frame, although it may move out
    // again if is_positioned and is overflowing
    if (willPosition)
      this.moveIntoFrame();
  }


  position() {

    if (this.css('position') !== 'absolute')
      return this.moveOutOfFrame();

    if (!this.attrs.is_positioned)
      return;

    // reset previous styling
    this.resetCSS();

    // this is how things start with the blocks after the image. this moves
    // it into the frame. later when we check for overflow, it will have to
    // move back.
    // n.b. this must be done before getPos because that does getCSS for
    // margin and that will change according to position in DOM
    this.moveIntoFrame();

    let pos = this.getPos();

    if (!pos || pos.width < 0 || pos.height < 0)
      this.moveOutOfFrame();
    else
      this.css(pos);

    if (this.isOverflowing()) {
      this.moveOutOfFrame();
      // TODO there's a bug here where if there's still something positioned
      // on the frame before this it will not reposition according to the new
      // dimesions of the image. oh well
      this.parent.setSize();
    }

    return this;
  }


  moveIntoFrame() {
    this.css({position: 'absolute'});
    let frame = this.parent.select('.frame');
    if (!frame.is(this.el.parentNode))
      frame.append(this.el);
  }


  moveOutOfFrame() {
    if (this.parent.el == this.el.parentNode)
      return;
    this.resetCSS();
    this.parent.append(this.el);
    this.css({position: 'static'});
    return this;
  }


  isOverflowing() {

    // need to use Range API b/c if there are straight text nodes inside
    // we won't be able to get their 
    var range = document.createRange();
    range.selectNodeContents(this.el);
    var contentRect = range.getBoundingClientRect();
    var thisRect = this.rect();

    return (
      contentRect.height > thisRect.height ||
      contentRect.width > thisRect.width
    );
  }


  // so the position for this is set based on the image, however here in
  // css we're positioning based on the .frame
  getPos() {

    let parentLeft = this.parent.offset.left;
    let parentTop = this.parent.offset.top;
    let parentWidth = this.parent.source.width * this.parent.scale;
    let parentHeight = this.parent.source.height * this.parent.scale

    let frameWidth = this.parent.find('.frame').clientWidth;
    let frameHeight = this.parent.find('.frame').clientHeight;

    let left = (parentWidth * this.attrs.position.left) + parentLeft;
    let width = parentWidth * this.attrs.position.width;

    // here it's positioned off the screen and we bring it on screen
    // using margin to place away from the edge of the crop
    if (left < this.css('margin-left')) {
      width -= this.css('margin-left') + left;
      left = this.css('margin-left');
    }

    // overflowing off the right, constrain to edge of crop (using margin)
    if (width + left + this.css('margin-right') > frameWidth)
      width = frameWidth - left - this.css('margin-right');

    // this accounts for the fact that margin is significant in CSS 
    // positioning but we're not using it like that. yeah, weird
    left -= this.css('margin-left');

    // same as above for Y axis
    let top = (parentHeight * this.attrs.position.top) + parentTop
    let height = parentHeight * this.attrs.position.height;

    if (top < this.css('margin-top')) {
      height -= this.css('margin-top') - top;
      top = this.css('margin-top');
    }

    if (height + top > frameHeight)
      height = Math.max(0, frameHeight - top - this.css('margin-bottom'));

    // the margin is not used for positioning-- just making sure it's not
    // hitting the edge of the screen
    top -= this.css('margin-top');

    return {position: 'absolute', left, top, width, height};
  }

};

export {factory as default};

