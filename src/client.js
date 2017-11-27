import { dom, article } from '/app/index.js';
import { addStylesheet } from './utility.js';
import EventEmitter from './events.js';
import ArticleView from './views/article.js';


export default class ClientRenderer extends EventEmitter() {

  constructor() {
    super();
    this.fetchedAssets = [];
  }

  
  // LIVE PREVIEW

  change(data) {
    // console.log('change', data);
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


  // INITIAL SETUP
  async set(data) {
    dom(document.documentElement).addClass('javascript', 'focus');

    data.javascript = true;
    data.client = true;
    data.content_origin = data.content_origin || location.origin;

    data.development_repositories = data.development_repositories || {};

    // remove inline_assets that are in the dev repos. They will be loaded 
    // on demand like they are in live preview
    data.inline_assets = (data.inline_assets || []).filter(a => {
      const repoName = a.path.match(/\/([^/]*)/)[1];
      return !data.development_repositories[repoName];
    })

    article.set(data);
    this.attrs = data;
    this.articleView = new ArticleView(data);
    this.bind({ assetMissing : 'assetMissing' }, this.articleView);

    dom(document.documentElement).data({ url: this.attrs.url });

    await this.attachAssets()

    dom('body').append(this.articleView.html());

    // same with header and footer: remove if in the dev-server since we'll
    // load on the fly
    if (data.header_path) {
      const repoName = data.domain.header.match(/\/([^/]*)/)[1];
      if (data.development_repositories[repoName]) {
        data.header = ''
        this.replaceHeader(data.header_path);
      }
    }

    if (data.footer_path) {
      const repoName = data.domain.footer.match(/\/([^/]*)/)[1];
      if (data.development_repositories[repoName]) {
        data.footer= ''
        this.replaceFooter(data.footer_path);
      }
    }

    article.setup();
    article.tick();
  }


  resolvedAssets() {
    return this.articleView.resolvedAssets
  }


  attachAssets() {
    
    const assetsLoaded = [].concat(
      this.articleView.scripts().map(path => CodexLoader.import(path)),
      this.articleView.stylesheets().map(path => addStylesheet(path))
    );

    // article style
    if (article.attrs.style)
      dom('head').append(`<style>${ article.attrs.style }</style>`)
    else if (article.attrs.compressed_style)
      dom('head').append(`<style>${ article.attrs.compressed_style }</style>`)

    return Promise.race([
      Promise.all(assetsLoaded),
      new Promise(resolve => setTimeout(resolve, 3000))
    ])
    .catch(error => console.error(error))
  }


  // The problem is Handlebars doesn't say which partial was missing. We must
  // check if they've all loaded. Load them if not. Or error if they've all
  // been loaded since any number of things could go wrong.
  assetMissing(view, error) {

    let builtIn = 'br date play audio share fullscreen email reddit twitter facebook play_icon audio_icon fullscreen_icon share_icon email_icon reddit_icon twitter_icon facebook_icon'.split(/ /);

    // There could be any number of errors for this and we can't download
    // the same thing over and over.
    let toFetch = view.partials().filter(name => 
      !builtIn.includes(name) &&
      !this.fetchedAssets.includes(name) &&
      !this.fetchedAssets.includes(name + '.html')
    )

    return toFetch.map(path => {
      this.fetchedAssets.push(path);

      this.fetchAsset(path)
      .then(text => this.articleView.addPartialFromAsset(path, text))
      .then(() => this.reRenderViewsWithPartial(path))
    });
  }


  fetchAsset(path) {
    // console.log('fetchAsset', path);

    if (path[0] != '/')
      path = '/' + path;

    if (!/\.(svg|html|js)/.test(path))
      path += '.html';

    return fetch(path, { headers: { Accept: 'text/plain' } })
    .then(response => {
      if (response.ok)
        return response.text();
      else
        return `Failed to load ${ path }: HTTP ${ response.status }`;
    })
    .catch(err => console.error(err));

  }


  // events from development server
  updateAsset(event, paths) {
    // console.log(event, paths);

    let shouldReload = paths.map(path => {

      if (/\.(svg|html)$/.test(path)) {
        // handlebars templates dont have the leading slash
        path = path.slice('1');

        let altPath;
        if (path.slice(-5) === '.html')
          altPath = path.slice(0, -5);

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

        // update header/footer
        if ('/' + path === this.articleView.attrs.header_path)
          this.replaceHeader();
        if ('/' + path === this.articleView.attrs.footer_path)
          this.replaceFooter();

        return false; 
      }
      else if (path.endsWith('.js')) {

        if (document.querySelector(`script[src="${ path }"]`))
          return true;

        const applicable = this.attrs.assets
          .map(a => a.startsWith('/') ? a : '/' + a)
          .find(a => a === path || a + '.js' === path);

        if (applicable)
          return true;

      }
      else if (path.endsWith('.css')) {

        let existing = document.querySelector(`link[href^="${ path }"]`)

        if (event === 'remove') {
          if (existing)
            existing.remove();
          return;
        }

        const applicable = this.attrs.assets
          .map(a => a.startsWith('/') ? a : '/' + a)
          .find(a => a === path || a + '.css' === path);

        if (!applicable)
          return;

        const el = document.createElement('link');
        el.href = path + '?' + Date.now();
        el.rel = 'stylesheet';
        el.onload = () => window.dispatchEvent(new Event('resize'));

        if (event === 'add') {
          document.head.appendChild(el);
        }
        else if (event === 'change') {
          existing.parentNode.insertBefore(el, existing.nextElementSibling);
          existing.remove();
        }

        return false;
      }

    });

    return shouldReload.includes(true);
  }


  async replaceHeader() {
    const html = await this.fetchAsset(this.attrs.domain.header);
    dom.first('body > header').innerHTML = html;
  }


  async replaceFooter() {
    const html = await this.fetchAsset(this.attrs.domain.footer);
    dom.first('body > footer').innerHTML = html
  }


  reRenderViewsWithPartial(path) {
    let altPath;
    if (path.slice(-5) === '.html')
      altPath = path.slice(0, -5);

    this.articleView.views.forEach(view => {
      let match = (
        view.attrs.type === 'Graf' &&
        view.partials().some(p => p === path || p === altPath)
      );

      if (match) {
        article.replace(view)
      }

    });

  }



}



