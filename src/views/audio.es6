import View         from './view';
import compile      from '../templates';
import {findSource} from '../utility';

let template = compile(`
<div id=cp-{{attrs.id}} class="audio-button icon-audio {{classes}}">
  <audio {{#if javascript}}preload=none{{/if}} src="{{sourceUrl}}" type="audio/mp3"></audio>
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
      tagName: this.tagName() || 'div',
    });
  }

}

