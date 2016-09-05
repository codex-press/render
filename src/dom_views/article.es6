import log          from 'log';
import dom          from 'dom';

import app          from '../app';
import * as env     from '../env';

import DomView      from './base';
import ArticleView  from '../views/article';

import Graf         from './graf';
import Image        from './image';
import Audio        from './audio';
import Block        from './block';
import Video        from './video';
import HTMLBlock    from './html_block';
import ArticleEmbed from './article_embed';
import Index        from './index';

// singleton
let instance;
export {instance as default};

// onscreen is in the viewport, close is somewhat close to it (used for lazy
// loading video etc)
let onscreen = [];
let close = [];
let lastScroll;
let middleContent;
let middleContentPos;

let appEvents = {
  tick   : 'checkScroll',
  resize : 'resize',
  focus  : 'focusChange',
};

class Article extends DomView(ArticleView) {

  constructor() {
    super();

    if (instance)
      return instance;
    instance = this;

    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }


  ready() {
    return this._promise;
  }


  // overrides Views with DomViews which is higer up the inheritance trails
  // XXX this is fucked. better would be composition? Each DomView owns a 
  makeViews(content) {
    return content.map(c => {
      switch (c.type) {
        case 'Graf':         return new Graf(c);
        case 'Image':        return new Image(c);
        case 'Video':        return new Video(c);
        case 'Audio':        return new Audio(c);
        case 'Block':        return new Block(c);
        case 'Index':        return new Index(c);
        case 'HTMLBlock':    return new HTMLBlock(c);
        case 'ArticleEmbed': return new ArticleEmbed(c);
      }
    });
  }


  attach() {
    this.bind(appEvents, app);

    this.el = dom.find(document.body, `#cp-${this.attrs.id}`);
    this.children.map(c => c.attach());

    // it's a map with DOM Elements as keys
    let plugins = new Map();
    app.registeredPlugins.forEach((Plugin, selector) => {
      return dom(selector).forEach(el => {
        if (!plugins.has(el))
          plugins.set(el, []);
        let list = plugins.get(el);
// XXX could lookup by ID here instead? so DomView doesn't need to
// exist with it's .el?
        let view = this.views.find(v => v.el === el);
        list.push(new Plugin({el, attrs: view ? view.attrs : {}}));
      });
    });

    this.plugins = plugins;

    this.trigger('ready');
    this._resolve();
  }


  resize() {
    this.views.map(v => v.trigger('resize'));

    // maintain scroll position despite resized content
    // if (middleContent)
    //   app.scrollBy(middleContent.rect().top - middleContentPos);

  }


  focusChange() {
    this.update();
  }


  checkScroll() {
    // if the scroll has changed, do some stuff
    if (lastScroll !== app.scroll()) {
      lastScroll = app.scroll();
      this.update();
    }
  }


  update() {
    for (let [el, pluginList] of this.plugins) {
      let rect = dom.rect(el);
      pluginList.map(p => p.update(rect));
    }

    // let middle = this.findMiddleContent();
    // if (middle) {
    //   middleContent = middle;
    //   middleContentPos = middle.rect().top;
    //   middle.trigger('centered');
    // }
  } 



  updateViews() {

    // finding content 'close' to the viewport
    let newClose = this.views.filter(c => (
      c.el &&
      !close.includes(c) &&
      c.rect().top < 3 * window.innerHeight &&
      c.rect().bottom > -3 * window.innerHeight
    ));

    // log('newClose', newClose);

    let nolongerClose = close.filter(c => (
      c.rect().top > 3 * window.innerHeight ||
      c.rect().bottom < -3 * window.innerHeight
    ));

    close = close.filter(c => !nolongerClose.includes(c)).concat(newClose);

    // log('closeContent', closeContent);

    // finding onscreen content
    let newOnscreen = this.views.filter(c => (
      c.el &&
      !onscreen.includes(c) &&
      c.rect().top <= window.innerHeight &&
      c.rect().bottom >= 0
    ));

    // log('currentOnscreen', onscreen);
    // log('newOnsreen', newOnscreen);

    let offscreen = onscreen.filter(c => (
      c.rect().top > window.innerHeight ||
      c.rect().bottom < 0
    ));

    // actually if the frame is not focused, nothing is onscreen
    if (!app.hasState('focus')) {
      newOnscreen = [];
      offscreen = onscreen.slice();
    }

    // log('offscreen', offscreen)

    onscreen = onscreen
      .filter(c => !offscreen.includes(c))
      .concat(newOnscreen);

    let middle = this.findMiddleContent();
    if (middle) {
      middleContent = middle;
      middleContentPos = middle.rect().top;
      middle.trigger('centered');
    }

    newClose.map(c => c.trigger('close'));
    newOnscreen.map(c => c.trigger('onscreen'));
    offscreen.map(c => c.trigger('offscreen'));
    onscreen.map(c => c.trigger('scroll'));

  }


  findMiddleContent() {
    return this.views.find(v =>
      v.rect().bottom > window.innerWidth / 2
    );
  }

}

dom.mixin(Article.prototype);

new Article();

