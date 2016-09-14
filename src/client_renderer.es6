import EventEmitter from 'events';
import article from 'article';
import * as log from 'log';
import * as env from 'env';
import dom from 'dom';
import ArticleView from './views/article';

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

  // used for developmentServer
  devFileList   : 'devFileList',
  updateAsset   : 'updateAsset',
}

let articleViewEvents = {
  assetMissing : 'fetchAsset',
};

let devFileList = [];

let _resolve;
export let ready = new Promise(r => _resolve = r);

export class ClientRenderer extends EventEmitter() {

  constructor() {
   super();

    // singleton
    if (instance)
      return instance;
    instance = this;

    this.bind(callbacks);
    this.bind({message: 'message'}, window);
  }


  message(e) {
    // log.info('P:', e.data.event, e.data.args ? e.data.args : '');
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

    dom.body().prepend(this.articleView.html());

    return this.attachAssets().then(() => _resolve(this));
  }


  fetchAsset(view, assetPaths) {
    Promise.all(assetPaths.map(path => {
      let found = article.attrs.inline_assets.find(a => a.asset_path == path);
      if (found)
         return Promise.resolve();

      if (!/\.(svg|hbs|es6)/.test(path))
        path += '.hbs';

      let url;
      let repo = path.match(RegExp('(.*?)([./]|$)'))[1];

      console.log(repo, devFileList[repo]);

      if (devFileList[repo] && devFileList[repo].includes(path)) {
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
          console.error('Failed to load asset');
          let data = {
            type: 'Not Found',
            message: 'Could not load asset',
            assetPath: path,
            viewId: view.id,
          };
          article.send('assetError', data);
          let message = 'failed to load ' + path;
          view.el.textContent = message;
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
      if (devFileList[repo]) {
        let url = 'https://localhost:8000/';
        if (devFileList[repo].includes(base_path + '.js')) {
          tags.push(makeScriptTag(url+ base_path + '.js'));
          log.info(`fetching from development: ${base_path}.js`);
        }
        if (devFileList[repo].includes(base_path + '.css')) {
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
    console.log('change', data);
    let view = this.articleView.set(data);
    this.replaceViewHTML(view);
  }

  replaceViewHTML(view) {
    let target = dom.first(`[x-cp-id=${view.attrs.id}]`)
    target.outerHTML = view.html();
  }


  add(data) {
    console.log('add', data);
    let target = dom.first(`[x-cp-id=${data.parent_id}]`)
    this.articleView.add(data);
    target.outerHTML = this.articleView.replace(data);
  }


  remove(data) {
    console.log('remove', e);
  }



  // EDITOR SCROLL SYNC

  setScroll(pct) {
    article.scroll(article.scrollMax() * pct);
  }


  setStyle(style) {
    dom.first(document, 'head style').innerHTML = style;
  }


  // DEVELOPMENT SERVER

  devFileList(list) {
    devFileList = list;

    // swap CSS
    let repoRegex = RegExp('^/(.*?)(\/|\.js|\.css|-[0-9a-f]{32})')
    let baseRegex = RegExp('^/(.*?)(-[0-9a-f]{32})?\.(js|css)')
    dom('link').map(tag => {
      let url = new URL(tag.href);
      let repo = url.pathname.match(repoRegex)[1];
      if (['app','render'].includes(repo)) return;
      let basePath = url.pathname.match(baseRegex)[1];
      if (devFileList[repo]) {
        log.info(`fetching from development: ${basePath}.css`);
        tag.href = `https://localhost:8000/${basePath}.css`;
      }
    });

    // swap JS
    dom('script').map(tag => {
      if (!tag.src) return;
      let url = new URL(tag.src);
      let repo = url.pathname.match(repoRegex)[1];
      if (['app','render'].includes(repo)) return;
      let basePath = url.pathname.match(baseRegex)[1];
      if (devFileList[repo]) {
        log.info(`fetching from development: ${basePath}.js`);
        tag.src = `https://localhost:8000/${basePath}.js`;
      }
    });
  }


  updateAsset(path) {

    // inline asset
    if (this.articleView.handlebars.partials[path])
      location.reload();
    // JS update checks if it's in this frame then reloads
    else if (path.match(/js$/)) { 
      let selector = `script[src^="https://localhost:8000/${path}"]`;
      // external asset
      if (dom.first(document, selector))
        location.reload();
    }
    // CSS update does a hot reload
    else if (path.match(/css$/)) {
      let selector = `link[href^="https://localhost:8000/${path}"]`;
      let tag = dom.first(document, selector)

      if (tag) {
        log.info('update: ', path);

        // onload doesn't work the second time so must replace the tag
        tag.remove();
        let href = `https://localhost:8000/${path}?` + Date.now();
        let el = dom.create(`<link rel=stylesheet href="${href}">`)
        el.onload = () => this.resize();
        dom.append(document.head, el);
      }
    }

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
