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
      dom.body().append('<div class=cp-alert-container></div>')
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
            let html = (`
              <div class=cp-heading>Your Development Server Is Out Of Date</div>
              <div>
                The current version is v${version} and you are running
                v${data.version || '0.0.0'}. You must update it like this:
              </div>
              <pre>git pull
              npm install</pre>
            `);
            this.showAlert({html, id: 'connect', timeout: false});
            reject();
            return;
          }

          this.fileList = data.fileList;
          this.showAlert({
            html: `<div class=cp-heading>Connected To Development Server</div>`,
            id: 'connect',
          });
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }
          resolve();
        }

        if (data.error) {
          let html;
          if (data.filename)
            html = (
              `<div class=cp-heading>${data.error.type} Error: ${data.filename}</div>`
            );
          else
            html = `<div class=cp-heading>${data.error.type} Error</div>`;
          html += `<div class=cp-message>${data.error.message}</div>`;
          if (data.error.line)
            html += `<div>line: ${data.error.line}</div>`;
          if (data.error.column)
            html += `<div>column: ${data.error.column}</div>`;
          if (data.error.extract)
            html += `<pre>${data.error.extract}</pre>`;
          this.showAlert({html, type: 'error', id: data.assetPath, timeout: false});
          console.error(data.error.message, data.error);
        }
        else if (data.assetPath) {
          this.showAlert({
            html: `<div>Update: ${data.assetPath}</div>`,
            id: data.assetPath
          });
          this.fileList = data.fileList;
          renderer.updateAsset(data.assetPath);
        }
      };

    });
  }


  // types: info, error (or whatever you add in CSS)
  showAlert({html, type = 'info', id, timeout = 2000}) {

    let el = dom.create(`<div class="cp-alert ${type}">${html}</div>`);

    let removeAlert = () => {
      dom(el).addClass('hidden').on('animationend', () => {
        el.remove()
        errorEls[id] = null;
      });
    }

    // replace existing
    if (errorEls[id])
      errorEls[id].remove();

    errorEls[id] = el;

    dom('.cp-alert-container').append(el);
    dom(el).on('click', () => removeAlert())

    if (timeout)
      timers[id] = setTimeout(() => removeAlert(), timeout)
    else
      clearTimeout(timers[id])

    return el;
  }


}

new DevelopmentServer();
