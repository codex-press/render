import View         from './base';
import {findSource} from 'utility';

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

