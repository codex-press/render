import Handlebars from 'handlebars';

import View         from './view';
import {findSource} from '../utility';
import icons from '../icons';

let template = Handlebars.compile(`
<div x-cp-audio x-cp-id={{  attrs.id  ~}}
  {{#if id }} id={{  id  }}{{/if ~}} 
  {{#if classes }} class="{{  classes  }}" {{/if }}>
  ${ icons.audio }
  <audio {{#if javascript }}preload=none{{/if }}
    src="{{ sourceUrl  }}" type="audio/mp3">
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

    return template({
      sourceUrl,
      attrs: this.attrs,
      classes: this.classes(),
      id: this.id(),
    });
  }

}

