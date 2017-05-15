import EventEmitter from '/app/events.js';
import article from '/app/article.js';
import * as log from '/app/log.js';
import * as env from '/app/env.js';
import * as u from '/app/utility.js';
import dom from '/app/dom.js';

import ArticleView from './views/article';

let instance;
export {instance as default};

let callbacks = {
  // set           : 'set',

  change        : 'change',
  add           : 'add',
  remove        : 'remove',

  // used in Editor's preview functionality
  setScroll     : 'setScroll',
  setStyle      : 'setStyle',
};

let articleViewEvents = {
  assetMissing : 'assetMissing',
};

// Globals are handy for development and in console. Do not use in your code
window.cp = {article, dom, env};

export class ClientRenderer extends EventEmitter() {

  constructor() {
    super();

    // singleton
    if (instance)
      return instance;
    instance = this;

    this.fetchedAssets = [];
    this.bind(callbacks);
    this.bind({message: 'message'}, window);
  }


  message(e) {
    if (e.data.event)
      this.trigger(e.data.event, e.data.args);
  }


  set(data) {
    data.javascript = true;
    data.client = true;
    data.content_origin = location.origin;
    data.inline_assets = [];

    this.attrs = data;
    this.articleView = new ArticleView(data);
    this.bind(articleViewEvents, this.articleView);

    dom(document.documentElement).data({url: this.attrs.url});

    return this.attachAssets()
    .then(() => dom.body().prepend(this.articleView.html()));
  }


  attachAssets() {

    let tags = article.attrs.assets.reduce((tags, base_path) => {
      // these are already present
      if (['app','render'].includes(base_path))
        return tags;
      article.attrs.asset_data.forEach(data => {
        if (data.asset_path === base_path + '.js')
          tags.push(makeScriptTag(data.digest_path));
        else if (data.asset_path === base_path + '.css')
          tags.push(makeStylesheetTag(data.digest_path));
      });
      return tags;
    }, []);

    // article style
    if (article.attrs.style)
      dom('head').append(`<style>${article.attrs.style}</style>`);
    else if (article.attrs.compressed_style) {
      // let url = env.contentOrigin + '/' + article.attrs.compressed_style;
      // tags.push(makeStylesheetTag(url));
    }

    return Promise.all(tags.map(el => {
      dom.append(document.head, el);
      return new Promise((resolve, reject) => {
        el.onload = resolve;
        setTimeout(resolve, 3000);
      })
    }));

  }



  // The problem is Handlebars doesn't say which partial was missing. We must
  // check if they've all loaded. Load them if not. Or error if they've all
  // been loaded since any number of things could go wrong.
  assetMissing(view, error) {

    let builtIn = 'br date play audio share fullscreen email reddit twitter facebook play_icon audio_icon fullscreen_icon share_icon email_icon reddit_icon twitter_icon facebook_icon'.split(/ /);

    // There could be any number of errors for this. The partials cannot be
    // nested so if we've downloaded all of the partials, log the error.
    let toFetch = view.partials().filter(name =>
      !builtIn.includes(name) &&
      !this.fetchedAssets.includes(name) &&
      !this.fetchedAssets.includes(name + '.hbs')
    );

    Promise.all(toFetch.map(path => {

      if (!/\.(svg|hbs|js|es6)/.test(path))
        path += '.hbs';

      this.fetchedAssets.push(path);

      let url;
      let repo = path.match(RegExp('(.*?)([./]|$)'))[1];

      // if (devServer.fileList[repo]) {
        url = 'http://localhost:8000/' + path;
        log.info(`fetching from development: ${path}`);
      // }
      // else
      //   url = env.contentOrigin + '/' + path;

      // return fetch(url)
      // .then(response => {
      //   if (response.ok)
      //     return response.text();
      //   else {
          let data = {
            type: 'Not Found',
            message: 'Could not load asset',
            assetPath: path,
            viewId: view.attrs.id,
          };
          article.send('assetError', data);
          let message = 'Failed to load ' + path;
          //console.error(message);
          setTimeout(() => this.replaceGrafText(view.attrs.id, message));
          return message;
        // }
      // })
      // .then(text => this.articleView.addPartialFromAsset(path, text))
      // .then(() => this.reRenderViewsWithPartial(path))
    }))
    .catch(err => console.error(err));

  }



  // events from devServer
  updateAsset(path) {

    let altPath;
    if (path.slice(-4) === '.hbs')
      altPath = path.slice(0, -4);

    // inline asset
    if (this.articleView.handlebars.partials[path] ||
        this.articleView.handlebars.partials[altPath]) {

      delete this.articleView.handlebars.partials[altPath]
      delete this.articleView.handlebars.partials[path]

      // Remove from fetchedAssets so it will fetch again even if it errored 
      // last time.
      this.fetchedAssets = this.fetchedAssets.filter(a =>
        a !== path && a !== altPath
      );

      this.reRenderViewsWithPartial(path);

    }
  }


  reRenderViewsWithPartial(path) {

    let altPath;
    if (path.slice(-4) === '.hbs')
      altPath = path.slice(0, -4);

    this.articleView.views.forEach(view => {
      if (view.attrs.type === 'Graf' &&
          view.partials().some(p => p === path || p === altPath)) {
        article.replace(view)
      }
    });

  }


  // LIVE PREVIEW

  change(data) {
    // console.log('change',data);
    let view = this.articleView.update(data);
    article.replace(view);
  }


  add(data) {
    // console.log('add', data);
    let view = this.articleView.add(data, data.index);
    article.add(view, data.index);
  }


  remove(data) {
    // console.log('remove',data);
    let view = this.articleView.remove(data.id);
    article.remove(view);
  }


  // used to show asset status/errors in a Graf
  replaceGrafText(id, text) {
    if (dom.first(`[x-cp-id="${id}"]`))
      dom.first(`[x-cp-id="${id}"]`).textContent = text;
  }



  // EDITOR SCROLL SYNC

  setScroll(pct) {
    article.scroll(article.scrollMax() * pct);
  }


  setStyle(style) {
    dom.first(document, 'head style').innerHTML = style;
    article.resize();
  }

}

new ClientRenderer();


function makeScriptTag(url) {
  let el = document.createElement('script');
  // not necessary obviously but just to help people understand
  el.async = true;
  // crossorigin attribute allows better error events
  el.setAttribute('crossorigin','');
  el.src = url;
  return el;
}


function makeStylesheetTag(url) {
  return dom.create(`<link crossorigin rel=stylesheet href="${url}">`);
}


