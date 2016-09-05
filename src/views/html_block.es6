import View from './view';
import {unscopeLinks} from '../utility';
import compile from '../templates';


let template = compile(`
<{{  tagName  ~}}
  {{#if id }} data-cp-id={{  id  }}{{/if ~}}
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

    return template({
      content,
      attrs: this.attrs,
      classes: this.classes(),
      tagName: this.tagName() || 'div',
    });
  }

}

