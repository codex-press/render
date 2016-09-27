import Handlebars from 'handlebars';

import View from './view';
import {unscopeLinks} from '../utility';
import hljs from 'highlight.js';


let template = Handlebars.compile(`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if cpId }}x-cp-id={{  id  }}{{/if ~}}
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
      let highlighted = hljs.highlight('javascript', content).value;
      content = `<pre><code>${highlighted}</code></pre>`;
    }

    return template({
      content,
      isOverlay: this.isOverlay(),
      cpID: this.article.attrs.client ? this.attrs.id : '',
      classes: this.classes(),
      tagName: this.tagName() || 'div',
    });
  }

}

