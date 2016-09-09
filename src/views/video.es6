import View from './view';
import {findSource} from '../utility';
import compile from '../templates';

let attributes = `
  src="{{sourceURL}}"
  poster="{{  posterURL  }}"
  {{#if javascript}} preload=none {{else}} preload=auto {{/if}}
  {{#if loop }}  loop  {{/if}}
  {{#if autoplay }}  autoplay  {{/if }}
  {{#if controls }}  controls  {{/if }}
`;


// when specified with tag <video>
let simpleTemplate = compile(`
  <video x-cp-video x-cp-id={{  cpID  }} class="{{  classes  }}" ${attributes}>
  </video>
`);


// no crop
let figureTemplate = compile(`
  <figure x-cp-figure x-cp-video x-cp-id={{  cpID  }} class="{{  classes  }}">

    {{#if javascript}}
      <!-- this comment will be replaced with size info -->
    {{/if}}

    <div class=frame>
      <video ${attributes}></video>
      {{#if javascript}}
        <img class=thumb src="{{  thumbURL  }}" draggable=false> 
        <img class=poster draggable=false> 
      {{/if}}
    </div>

    {{{children}}}

  </figure>
`);


// with cropping, JS only
let cropTemplate = compile(`
  <figure x-cp-figure x-cp-video x-cp-crop x-cp-id={{  cpID  }}
    class="{{classes}}">

    <!-- this comment will be replaced with size info -->

    <div class=frame>
      <div class=crop>
        <video ${attributes}></video>
        <img class=thumb src="{{thumbURL}}" draggable=false> 
        <img class=poster draggable=false> 
      </div>
    </div>

    {{{children}}}

  </figure>
`);



export default class FigureView extends View {

  html() {
    this.source = findSource(this.attrs.media.srcset, this.quality());

    let sourceURL = this.article.attrs.content_origin + this.source.url;
    let posterURL = this.article.attrs.content_origin + this.source.poster;

    let autoplay = this.attrs.autoplay && !this.article.attrs.javascript;

    let controls = this.attrs.controls ||
      (!this.attrs.autoplay && !this.article.attrs.javascript);

    let attributes = {
      cpID: this.attrs.id,
      classes: this.classes(),
      sourceURL,
      posterURL,
      thumbURL: this.thumbSource(),
      loop: this.attrs.loop,
      autoplay,
      controls,
      javascript: this.article.attrs.javascript,
      children: this.childrenHTML(),
    };

    if (this.tagName() === 'video')
      return simpleTemplate(attributes);
    // crop requires JS
    else if (this.attrs.crop && this.article.attrs.javascript)
      return cropTemplate(attributes);
    else
      return figureTemplate(attributes);

  }


  quality() {
    var classes = (this.attrs.classes || []);
    if (classes.includes('low-quality')) return 'low';
    if (classes.includes('medium-quality')) return 'medium';
    if (classes.includes('high-quality')) return 'high';
    return this.article.attrs.quality;
  }


  classes() {
    if (this.article.attrs.javascript)
      return super.classes() + ' loading';
    else
      return super.classes();
  }


  tagName() {
    if (this.classes && this.classes[0] === 'video')
      return 'video';
    else
      return super.tagName();
  }


  thumbSource() {
    return 'data:image/jpeg;base64,' + this.attrs.media.base64_thumb;
  }

  defaultTagName() {
    return 'figure';
  }

}
