import Handlebars from '../../lib/handlebars.js';
import prism from '../../lib/prism.js';

import View from './view.js';
import { unscopeLinks } from '../utility.js';


let template = Handlebars.compile(`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if id }} id={{  id  }}{{/if ~}}
  {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
  {{#if classes}} class="{{  classes  }}"{{/if}}>
    {{{  content  }}}
</{{ tagName  }}>
`);

export default class HTMLBlock extends View {

  html() {

    let content = unscopeLinks(
      this.attrs.body,
      this.article.attrs.path_prefix
    );

    if (this.attrs.classes.includes('escaped')) {
      // default html
      let language = 'html';
      if (this.attrs.classes.includes('language-less'))
        language = 'less';
      if (this.attrs.classes.includes('language-css'))
        language = 'css';
      if (this.attrs.classes.includes('language-javascript'))
        language = 'javascript';
      let highlighted = prism.highlight(content, prism.languages[language]);
      content = (`
        <pre class=language-${language}><code>${highlighted}</code></pre>
      `);
    }

    return template({
      content,
      isOverlay: this.isOverlay(),
      id: this.id(),
      cpID: this.article.attrs.client ? this.attrs.id : '',
      classes: this.classes(),
      tagName: this.tagName() || 'div',
    });
  }

}

