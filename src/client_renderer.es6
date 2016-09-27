import EventEmitter from 'events';
import article from 'article';
import * as log from 'log';
import * as env from 'env';
import dom from 'dom';
import ArticleView from './views/article';
import devServer from './development_server';

let instance;
export {instance as default};

let callbacks = {
  set              : 'set',

  change        : 'change',
  add           : 'add',
  remove        : 'remove',

  // used in Editor's preview functionality
  setScroll     : 'setScroll',
  setStyle      : 'setStyle',

}

let articleViewEvents = {
  assetMissing : 'assetMissing',
};


let _resolve;
export let ready = new Promise(r => _resolve = r);

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
    this.bind({'state:dev-server' : 'changeDevServer'}, article);
  }

  // changeDevServer(value) {
  //   location.reload();
  // }


  message(e) {
    this.trigger(e.data.event, e.data.args);
  }


  set(data) {
    // console.log(data);
    data.javascript = true;
    data.client = true;
    data.content_origin = location.origin;
    data.inline_assets = [];

    this.attrs = data;
    this.articleView = new ArticleView(data);
    this.bind(articleViewEvents, this.articleView);

    dom.body().prepend(this.articleView.html());

    return (new Promise((resolve, reject) => {
      if (article.hasState('dev-server'))
        devServer.connect().then(resolve)
      else
        resolve();
    }))
    .then(() => this.attachAssets())
    .then(() => _resolve(this));
  }


  // The problem is Handlebars doesn't say which partial was missing. We must
  // check if they've all loaded. Load them if not. Or error if they've all been
  // loaded since any number of things could go wrong.
  assetMissing(view, error) {
    let builtIn = 'br date play audio share fullscreen email reddit twitter facebook play_icon audio_icon fullscreen_icon share_icon email_icon reddit_icon twitter_icon facebook_icon'.split(/ /);

    // There could be any number of errors for this. The partials cannot be
    // nested so if we've downloaded all of the partials, log the error.
    let toFetch = view.partials().filter(name =>
      !builtIn.includes(name) &&
      !this.fetchedAssets.includes(name) &&
      !this.fetchedAssets.includes(name + '.hbs')
    );

    if (toFetch.length === 0) {
      console.error(error.message);
      setTimeout(() => this.replaceGrafText(view.attrs.id, error.message));
      return;
    }

    Promise.all(toFetch.map(path => {

      if (!/\.(svg|hbs|es6)/.test(path))
        path += '.hbs';

      this.fetchedAssets.push(path);

      let url;
      let repo = path.match(RegExp('(.*?)([./]|$)'))[1];

      if (devServer.fileList[repo]) {
        url = 'https://localhost:8000/' + path;
        log.info(`fetching from development: ${path}`);
      }
      else
        url = env.contentOrigin + '/' + path;

      return fetch(url)
      .then(response => {
        if (response.ok)
          return response.text();
        else {
          let data = {
            type: 'Not Found',
            message: 'Could not load asset',
            assetPath: path,
            viewId: view.attrs.id,
          };
          article.send('assetError', data);
          let message = 'Failed to load ' + path;
          console.error(message);
          setTimeout(() => this.replaceGrafText(view.attrs.id, message));
          return message;
        }
      })
      .then(text => this.articleView.addPartialFromAsset(path, text));
    }))
    .then(() => this.replaceViewHTML(view))
    .catch(err => console.error(err));

  }


  attachAssets() {

    if (article.attrs.style)
      dom('head').append(`<style>${artcle.attrs.style}</style>`);

    let tags = article.attrs.assets.reduce((tags, base_path) => {

      // serve from development
      let repo = base_path.match(/^(.*?)([-./]|$)/)[1];
      if (devServer.fileList[repo]) {
        let url = 'https://localhost:8000/';
        // add JS and/or CSS depending on if they exist in offerings
        if (devServer.fileList[repo].includes(base_path + '.js')) {
          tags.push(makeScriptTag(url+ base_path + '.js'));
          log.info(`fetching from development: ${base_path}.js`);
        }
        if (devServer.fileList[repo].includes(base_path + '.css')) {
          tags.push(dom.create(
            `<link rel=stylesheet href="${url}${base_path}.css">`
          ));
          log.info(`fetching from development: ${base_path}.css`);
        }
        return tags;
      }

      // serve normally
      article.attrs.asset_data.map(data => {
        let url;
        if (env.development)
          url = env.contentOrigin + '/' + data.asset_path;
        else
          url = env.contentOrigin + '/' + data.digest_path;
        if (data.asset_path == base_path + '.js')
          tags.push(makeScriptTag(url));
        else if (data.asset_path == base_path + '.css')
          tags.push(dom.create(`<link rel=stylesheet href="${url}">`));
      });

      return tags;
    },[]);

    return Promise.all(tags.map(el => {
      dom.append(document.head, el);
      return new Promise((resolve, reject) => {
        el.onload = resolve;
        setTimeout(resolve, 3000);
      })
    }));

  }




  // LIVE PREVIEW

  change(data) {
    // console.log('change', data);
    let view = this.articleView.set(data);
    this.replaceViewHTML(view);
  }

  replaceViewHTML(view) {
    let target = dom.first(`[x-cp-id="${view.attrs.id}"]`)
    target.outerHTML = view.html();
  }


  add(data) {
    let target = dom.first(`[x-cp-id=${data.parent_id}]`)
    this.articleView.add(data);
    target.outerHTML = this.articleView.replace(data);
  }


  remove(data) {
    console.log('remove', e);
  }


  // used for errors, etc.
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
