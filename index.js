import { article, dom, env } from '/app/index.js';
import ClientRenderer from './src/client.js';

const renderer = new ClientRenderer();

dom.on(window, 'message', e => {

  // console.log('renderer message', e.data);

  switch (e.data.event) {

    case 'set':
      renderer.set(e.data.args);
      return;

    case 'change':
      renderer.change(e.data.args);
      return;

    case 'add':
      renderer.add(e.data.args);
      return;

    case 'remove':
      renderer.remove(e.data.args);
      return;

    case 'setScroll':
      article.scroll(article.scrollMax() * e.data.args);
      return;

    case 'setStyle':
      dom.first(document, 'head style').innerHTML = e.data.args;
      article.resize();
      return;

  }

});


