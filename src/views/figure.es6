import View from './view';
import {findSource} from '../utility';
import compile from '../templates';

let template = compile(`
  <figure id=cp-{{attrs.id}}
    class="image {{classes}} {{#if javascript}}loading{{/if}}">

    <div class=frame>

      {{#if javascript}}
        <!-- this comment will be replaced with size info -->
      {{/if}}

      <div class=crop>

        {{#if javascript}}
          <img class=thumb src="{{thumbUrl}}" draggable=false> 
          <img class=full draggable=false> 
        {{else}}
          <img src="{{sourceUrl}}" draggable=false> 
        {{/if}}

      </div>

    </div>

    {{{children}}}

  </figure>
`);


let videoTemplate = compile(`
<figure id=cp-{{attrs.id}} 
  class="video {{classes}} {{#if javascript}}loading{{/if}}">

  <div class=frame>

    {{#if javascript}}
      <!-- this comment will be replaced with size info -->
    {{/if}}

    <div class=crop>

      <video src="{{sourceUrl}}"

        {{#if javascript}}
          preload=none
        {{else}}
          controls preload=auto
        {{/if}}

        {{#if attrs.loop }}loop{{/if}}>
      </video>

      {{#if javascript}}
        <img class=thumb src="{{thumbUrl}}" draggable=false> 
        <img class=poster draggable=false> 
      {{/if}}

    </div>

  </div>

  {{{children}}}

</figure>
`);

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

    return template({
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
    if (classes.includes('low-quality')) return 'low';
    if (classes.includes('medium-quality')) return 'medium';
    if (classes.includes('high-quality')) return 'high';
    return this.article.attrs.quality;
  }


  thumbSource() {
    return 'data:image/jpeg;base64,' + this.attrs.media.base64_thumb;
  }

}

