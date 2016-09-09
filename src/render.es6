import EventEmitter from 'events';
import article from 'article';
import * as log from 'log';
import ArticleView from './views/article';

let instance;
export {instance as default};

let callbacks = {
  set              : 'set',

  change           : 'change',
  add              : 'add',
  remove           : 'remove',

  // used in Editor's preview functionality
  setScroll        : 'setScroll',
  setStyle         : 'setStyle',

  // used for developmentServer
  developmentRepos : 'developmentRepos',
  updateAsset      : 'updateAsset',

}

let articleViewEvents = {
  assetMissing : 'fetchAsset',
};

let developmentRepos = [];

let resolve;
export let ready = new Promise(r => resolve = r);

export class Render extends EventEmitter() {


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

    dom().prepend(this.articleView.html());

    return this.attachAssets().then(() => resolve(this));
  }


  fetchAsset(view, assetPaths) {
    Promise.all(assetPaths.map(path => {
      let found = article.attrs.inline_assets.find(a => a.asset_path == path);
      if (found)
         return Promise.resolve();

      return fetch('/' + path + '.json')
      .then(response => {
        if (response.ok)
          return response.json();
        else {
          console.error('Failed to load asset');
          let data = {
            type: 'Not Found',
            filename: path,
            message: 'Could not load asset'
          };
          article.send('assetError', data);
          view.el.textContent = 'failed to load ' + path;
        }
      })
      .then(data => this.articleView.addPartial(data));
    }))
    .then(() => this.replaceViewHTML(view))
    .catch(err => console.error(err));

  }


  attachAssets() {

    let js = article.attrs.scripts.map(s =>  {
      let el = document.createElement('script');
      // not necessary obviously but just to help people understand
      el.async = true;
      // crossorigin attribute allows better error events
      el.setAttribute('crossorigin','');
      let repo = s.match(/^(.*?)[-./]/)[1];
      if (developmentRepos.includes(repo)) {
        let base = s.match(/(.*?)(-[a-f0-9]{32})?\.js$/)[1];
        log.info('serving from development: ', base + '.js');
        el.src = `https://localhost:8000/${base}.js`;
      }
      else
        el.src = env.contentOrigin + '/' + s;
      return el;
    });

    let css = article.attrs.stylesheets.map(s => {
      let repo = s.match(/^(.*?)[-./]/)[1];
      if (developmentRepos.includes(repo)) {
        let base = s.match(/(.*?)(-[a-f0-9]{32})?\.css$/)[1];
        log.info('serving from development: ', base + '.css');
        s = `https://localhost:8000/${base}.css`;
      }
      else
        s = env.contentOrigin + '/' + s;
      return dom.create(`<link rel=stylesheet href="${s}">`)
    });

    // Editor-side article preview sends style as well
    if (article.attrs.style)
      dom('head').append(`<style>${article.attrs.style}</style>`);

    return Promise.all(js.concat(css).map(el => {
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
    dom.find(document, 'head style').innerHTML = style;
  }


  // DEVELOPMENT SERVER

  developmentRepos(repos) {
    developmentRepos = repos;

    // swap CSS
    let repoRegex = RegExp('^/(.*?)(\/|\.js|\.css|-[0-9a-f]{32})')
    let baseRegex = RegExp('^/(.*?)(-[0-9a-f]{32})?\.(js|css)')
    dom('link').map(tag => {
      let url = new URL(tag.href);
      let repo = url.pathname.match(repoRegex)[1];
      if (repo === 'app') return;
      let basePath = url.pathname.match(baseRegex)[1];
      if (repos.includes(repo)) {
        log.info('serving from development: ', basePath + '.css');
        tag.href = 'https://localhost:8000/' + basePath + '.css';
      }
    });

    // swap JS
    dom('script').map(tag => {
      if (!tag.src) return;
      let url = new URL(tag.src);
      let repo = url.pathname.match(repoRegex)[1];
      if (repo === 'app') return;
      let basePath = url.pathname.match(baseRegex)[1];
      if (repos.includes(repo)) {
        log.info('serving from development: ', basePath + '.js');
        tag.src = 'https://localhost:8000/' + basePath + '.js';
      }
    });
  }


  updateAsset(path) {

    // JS update checks if it's in this frame then reloads
    if (path.match(/js$/)) { 
      let selector = `script[src^="https://localhost:8000/${path}"]`;
      if (dom.find(document, selector))
        location.reload();
    }
    // CSS update does a hot reload
    else if (path.match(/css$/)) {
      let selector = `link[href^="https://localhost:8000/${path}"]`;
      let tag = dom.find(document, selector)

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

new Render();

