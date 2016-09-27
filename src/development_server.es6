import dom from 'dom';
import EventEmitter from 'events';
//import * as u from 'utility';

let version = '0.0.1'; 

// singleton. it's instatiated by Renderer if needed
let instance = false;
export {instance as default};

let errorEls = {};
let reconnectInterval;

class DevelopmentServer extends EventEmitter() {

  constructor() {
    super();

    // singleton
    if (instance)
      return instance;
    instance = this;

    this.fileList = {};

    dom.ready.then(() => 
      dom.body().append('<div class=error-container></div>')
    );
  }


  // returns Promise to a loaded fileList
  connect() {
    console.log('here');

    return new Promise((resolve, reject) => {

      let ws = new WebSocket('wss://localhost:8000');
      let firstMessage = true;

      ws.onerror = err => {
        log.error(err);
        let message = `<h2>Can't connect to https://localhost:8000</h2>`;
        this.showAlert(message, 'connect');
        localStorage.removeItem('developmentServer');
        devServerEnabled = false;
        dom.first('.editor-nag input').checked = false;
        console.log.error(response);
      };


      ws.onclose = e => {
        console.log('onclose');
        if (!reconnectInterval) {
          let message = `<h2>Lost Connection To Development Server<h2>`;
          this.showAlert(message, 'connect');
          reconnectInterval = setInterval(this.connect.bind(this), 2000);
        }
      };


      ws.onmessage = e => {
        let data = JSON.parse(e.data);

        if (firstMessage) {
          firstMessage = false;

          if (data.version !== version) {
            let message = (`
              <h2>Your Development Server Is Out Of Date</h2>
              <div>
                The current version is v${version} and you are running
                v${data.version || '0.0.0'}. You must update it like this:
              </div>
              <pre>git pull
              npm install</pre>
            `);
            this.showAlert(message, 'connect');
            reject();
            return;
          }

          this.fileList = data.fileList;
          this.showAlert(`<h2>Connected To Development Server</h2>`, 'connect');
          setTimeout(() => this.removeAlert('connect'), 2000)
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }
          resolve();
        }

        if (data.error) {
          let message;
          if (data.filename)
            message = `<h2>${data.error.type} Error: ${data.filename}</h2>`;
          else
            message = `<h2>${data.error.type} Error</h2>`;
          message += `<h3>${data.error.message}</h3>`;
          if (data.error.line)
            message += `<div>line: ${data.error.line}</div>`;
          if (data.error.column)
            message += `<div>column: ${data.error.column}</div>`;
          if (data.error.extract)
            message += `<pre>${data.error.extract}</pre>`;
          this.showAlert(message, data.assetPath);
        }
        else if (data.assetPath) {
          this.showAlert(`<h4>Update: ${data.assetPath}</h3>`, data.assetPath);
          setTimeout(() => this.removeAlert(data.assetPath), 2000)
        }
      };

    });
  }


  devFileList(list) {
    let devFileList = list;

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
    if (this.articleView.handlebars.partials[path] ||
       this.articleView.handlebars.partials[path + '.hbs']) {
      // Remove from fetchedAssets so it will fetch again even if it errored 
      // last time.
      this.fetchedAssets = this.fetchedAssets.filter(a => a !== path);
      // re-render the views that depend on this asset for a patrial.
      this.articleView.views.forEach(view => {
        if (view.attrs.type === 'Graf' &&
            view.partials().some(p => p === path || `${p}.hbs` === path))
          this.replaceViewHTML(view)
      });
    }
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


  showAlert(html, assetPath) {
    let el = dom.create(`<div class=error>${html}</div>`);
    // replace existing
    if (errorEls[assetPath])
      errorEls[assetPath].remove();
    if (assetPath)
      errorEls[assetPath] = el;
    dom('.error-container').append(el);
    dom(el).on('click', () => this.removeAlert(assetPath || el))
    return el;
  }


  removeAlert(assetPath) {
    let el = errorEls[assetPath];
    if (!el)
      return
    dom(el).addClass('hidden').on('animationend', () => {
      el.remove()
      errorEls[assetPath] = null;
    });
  }

}

new DevelopmentServer();
