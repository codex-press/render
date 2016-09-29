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

    return new Promise((resolve, reject) => {

      let ws = new WebSocket('wss://localhost:8000');

      ws.onerror = err => {
        log.error(err);
        let message = `<div class=cp-heading>Can't connect to https://localhost:8000</div>`;
        this.showAlert(message, 'connect');
        console.error(response);
        article.removeState('dev-server');
      };


      ws.onclose = e => {
        if (!reconnectInterval) {
          let message = `<div class=cp-heading>Lost Connection To Development Server</div>`;
          this.showAlert(message, 'connect', false);
          reconnectInterval = setInterval(this.connect.bind(this), 2000);
        }
      };

      let firstMessage = true;
      ws.onmessage = e => {
        let data = JSON.parse(e.data);

        if (firstMessage) {
          firstMessage = false;

          if (data.version !== version) {
            let message = (`
              <div class=cp-heading>Your Development Server Is Out Of Date</div>
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
          this.showAlert(`<div class=cp-heading>Connected To Development Server</div>`, 'connect');
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }
          resolve();
        }

        if (data.error) {
          let message;
          if (data.filename)
            message = (
              `<div class=cp-heading>${data.error.type} Error: ${data.filename}</div>`
            );
          else
            message = `<div class=cp-heading>${data.error.type} Error</div>`;
          message += `<div class=cp-message>${data.error.message}</div>`;
          if (data.error.line)
            message += `<div>line: ${data.error.line}</div>`;
          if (data.error.column)
            message += `<div>column: ${data.error.column}</div>`;
          if (data.error.extract)
            message += `<pre>${data.error.extract}</pre>`;
          this.showAlert(message, data.assetPath, false);
          console.error(data.error.message, data.error);
        }
        else if (data.assetPath) {
          this.showAlert(
            `<div>Update: ${data.assetPath}</div>`,
            data.assetPath
          );
          this.fileList = data.fileList;
          renderer.updateAsset(data.assetPath);
        }
      };

    });
  }


  showAlert(html, assetPath, timeout = 2000) {
    let el = dom.create(`<div class=cp-error>${html}</div>`);
    // replace existing
    if (errorEls[assetPath])
      errorEls[assetPath].remove();
    if (assetPath)
      errorEls[assetPath] = el;
    dom('.cp-error-container').append(el);
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
