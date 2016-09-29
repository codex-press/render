import dom from 'dom';
import EventEmitter from 'events';
import renderer from './client_renderer';

let version = '0.0.1'; 

// singleton. it's instatiated by Renderer if needed
let instance = false;
export {instance as default};

let errorEls = {};
let reconnectInterval;
let timers = {};

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
    console.trace('connect');

    return new Promise((resolve, reject) => {

      let ws = new WebSocket('wss://localhost:8000');

      ws.onerror = err => {
        log.error(err);
        let message = `<h2>Can't connect to https://localhost:8000</h2>`;
        this.showAlert(message, 'connect');
        console.log.error(response);
        article.removeState('dev-server');
      };


      ws.onclose = e => {
        console.log('onclose');
        if (!reconnectInterval) {
          let message = `<h2>Lost Connection To Development Server<h2>`;
          this.showAlert(message, 'connect', false);
          reconnectInterval = setInterval(this.connect.bind(this), 2000);
        }
      };

      let firstMessage = true;
      ws.onmessage = e => {
        let data = JSON.parse(e.data);
        console.log('message', data);

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
            this.showAlert(message, 'connect', false);
            reject();
            return;
          }

          this.fileList = data.fileList;
          this.showAlert(`<h2>Connected To Development Server</h2>`, 'connect');
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }
          console.log('resolving');
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
          this.showAlert(message, data.assetPath, false);
        }
        else if (data.assetPath) {
          this.showAlert(
            `<h3>Update: ${data.assetPath}</h3>`,
            data.assetPath
          );
          this.fileList = data.fileList;
          renderer.updateAsset(data.assetPath);
        }
      };

    });
  }


  showAlert(html, assetPath, timeout = 2000) {
    let el = dom.create(`<div class=error>${html}</div>`);
    // replace existing
    if (errorEls[assetPath])
      errorEls[assetPath].remove();
    if (assetPath)
      errorEls[assetPath] = el;
    dom('.error-container').append(el);
    dom(el).on('click', () => this.removeAlert(assetPath || el))
    if (timeout)
      timers[assetPath] = setTimeout(() => this.removeAlert(assetPath), timeout)
    else
      clearTimeout(timers[assetPath])
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
