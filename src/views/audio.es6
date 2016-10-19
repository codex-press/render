import Handlebars from 'handlebars';

import View         from './view';
import {findSource} from '../utility';

let template = Handlebars.compile(`
<div x-cp-audio x-cp-id={{  id  }} class="{{  classes  }}">
  <audio {{#if id }} id={{  id  }}{{/if ~}}
    {{#if javascript }}preload=none{{/if }}
    src="{{sourceUrl}}"
    type="audio/mp3">
  </audio>
</div>
`);


export default class Audio extends View {

  constructor(attrs) {
    super(attrs);
  }

 
  html() {
    this.source = findSource(
      this.attrs.media.srcset,
      this.article.attrs.quality
    );

    let sourceUrl = this.article.attrs.content_origin + this.source.url;

    return this.template({
      sourceUrl,
      attrs: this.attrs,
      javascript: this.article.attrs.javascript,
      classes: this.classes(),
      id: this.id(),
      tagName: this.tagName() || 'div',
    });
  }

}

