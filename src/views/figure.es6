import View from './base';
import {findSource} from 'utility';

export default class FigureView extends View {


  constructor(attrs) {
    super(attrs);

    this.aspectRatio = (
      this.attrs.media.original_height / this.attrs.media.original_width
    );
  }


  html() {
    this.source = findSource(this.attrs.media.srcset, this.quality());

    let sourceUrl, thumbUrl;

    thumbUrl = this.thumbSource();
    sourceUrl = this.article.attrs.content_origin + this.source.url;

    return this.template({
      sourceUrl,
      thumbUrl,
      attrs: this.attrs,
      type: this.attrs.type.toLowerCase(),
      classes: this.classes(),
      javascript: this.article.attrs.javascript,
      children: this.childrenHTML(),
    });

  }


  quality() {
    var classes = (this.attrs.classes || []);
    if (classes.includes('low-quality'))    return 'low';
    if (classes.includes('medium-quality')) return 'medium';
    if (classes.includes('high-quality'))   return 'high';
    return this.article.attrs.quality;
  }


  thumbSource() {
    return 'data:image/jpeg;base64,' + this.attrs.media.base64_thumb;
  }

}

