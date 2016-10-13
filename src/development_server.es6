import dom from 'dom';
import EventEmitter from 'events';
import renderer from './client_renderer';
import article from 'article';

let version = '0.0.1'; 

// singleton. it's instatiated by Renderer if needed
let instance = false;
export {instance as default};

let reconnectTimeout;
let firstConnection = true;

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

      ws.onclose = err => {

        // never got a single message so alert that it's not available
        if (firstConnection) {
          this.sendAlert({
            head: 'Can\'t connect to https://localhost:8000',
            type: 'error',
            id: 'connect',
          });
          // disabling it will leave the message since just the child
          // frame will be reloaded with server data
          article.removeState('dev-server');

          // not really used but makes sense
          reject();
        }
        else {

          // first time we got a close, so alert that it was lost
          if (!reconnectTimeout) {
            this.sendAlert({
              head: 'Lost Connection To Development Server',
              id: 'connect',
              type: 'error',
              timeout: false
            });
          }

          // continue trying to reconnect
          reconnectTimeout = setTimeout(this.connect.bind(this), 2000);
        }

      };


      // can't use onopen because we need the data in the first message so 
      // instead must wait for the first message
      let firstMessage = true;
      ws.onmessage = e => {
        let data = JSON.parse(e.data);

        this.fileList = data.fileList;
        if (firstMessage) {
          reconnectTimeout = undefined;
          firstConnection = false;
          firstMessage = false;

          if (data.version === version) {
            this.sendAlert({
              body: 'Connected To Development Server',
              id: 'connect',
            });
            resolve();
          }
          else {
            this.sendAlert({
              head: 'Your Development Server Is Out Of Date',
              body: `The current version is v${version} and you are running
                v${data.version || '0.0.0'}. You must update it like this:`,
              pre: 'git pull\nnpm install',
              id: 'connect',
              timeout: false
            });
            reject();
          }
        }

        else if (data.error) {

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
