import dom from 'dom';
import EventEmitter from 'events';
import renderer from './client_renderer';
import article from 'article';

let version = '0.0.1'; 

// singleton. it's instatiated by Renderer if needed
let instance = false;
export {instance as default};

let reconnectInterval;

class DevelopmentServer extends EventEmitter() {

  constructor() {
    super();

    // singleton
    if (instance)
      return instance;
    instance = this;

    this.fileList = {};
  }


  // returns Promise to a loaded fileList
  connect() {

    return new Promise((resolve, reject) => {

      let ws = new WebSocket('wss://localhost:8000');

      ws.onerror = err => {
        // it's trying to reconnect so normal to be erroring
        if (reconnectInterval)
          return;
        console.error(err);
        this.sendAlert({
          head: 'Can\'t connect to https://localhost:8000',
          type: 'error',
          id: 'connect',
        });
        article.removeState('dev-server');
      };


      ws.onclose = e => {
        if (!reconnectInterval) {
          this.sendAlert({
            head: 'Lost Connection To Development Server',
            id: 'connect',
            type: 'error',
            timeout: false
          });
          reconnectInterval = setInterval(this.connect.bind(this), 2000);
        }
      };

      let firstMessage = true;
      ws.onmessage = e => {
        let data = JSON.parse(e.data);

        if (firstMessage) {
          firstMessage = false;

          if (data.version !== version) {
            this.sendAlert({
              head: 'Your Development Server Is Out Of Date',
              body: `The current version is v${version} and you are running v${data.version || '0.0.0'}. You must update it like this:`,
              pre: 'git pull\nnpm install',
              id: 'connect',
              timeout: false
            });
            reject();
            return;
          }

          this.fileList = data.fileList;
          this.sendAlert({
            body: 'Connected To Development Server',
            id: 'connect',
          });

          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }

          resolve();
        }

        if (data.error) {

          let head;
          if (data.filename)
            head = `${data.error.type} Error: ${data.filename}`;
          else
            head = `${data.error.type} Error`;

          let body = data.error.message;
          if (data.error.line)
            body += `\nline: ${data.error.line}`;
          if (data.error.column)
            body += `\ncolumn: ${data.error.column}`;

          this.sendAlert({
            head,
            body,
            pre: data.error.extract,
            type: 'error',
            id: data.assetPath,
            timeout: false
          });

          console.error(data.error.message, data.error);
        }
        else if (data.assetPath) {

          this.sendAlert({
            body: `Update: ${data.assetPath}`,
            id: data.assetPath
          });
          this.fileList = data.fileList;
          renderer.updateAsset(data.assetPath);
        }
      };

    });
  }


  sendAlert(args) {
    article.send('alert', args);
  }


}

new DevelopmentServer();
