import Handlebars from 'handlebars';

import View from './view';
import {findSource} from '../utility';


let simpleTemplate = Handlebars.compile(`
  <img x-cp-image x-cp-id={{  cpID  }} draggable=false
    {{#if javascript }}
      src="{{  thumbURL  }}"
    {{ else }}
      src="{{  sourceURL  }}"
    {{/if }}
    style="max-width: {{  maxWidth  }}px"
    class="{{  classes  }}">
`);


// cropping but just by center point. overlays are absolutely positioned in CSS
let backgroundImageTemplate = Handlebars.compile(`
  <{{tagName}} x-cp-background-image x-cp-id={{  cpID  }}
    class="{{  classes  }}"
    style="background-image: url(
      {{~#if javascript }}
        {{~  thumbURL  ~}}
      {{ else }}
        {{~  sourceURL  ~}}
      {{/if ~}})
      {{~#if position  }}; background-position: {{  position  }}{{/if }}">

    {{{  children  }}}

    <div class=shim style="padding-top: {{  padding  }}%;"></div>

  </{{tagName}}>
`);


// no cropping but with JS, it will constrain width if it's too big for the
// container (like for the max-height 100vh). Positions overlays
let figureTemplate = Handlebars.compile(`
  <figure x-cp-figure x-cp-id={{  cpID  }} class="{{  classes  }}">

    {{#if javascript }}
      <!-- this comment will be replaced with size info -->
    {{/if }}

    <div class=frame>
      {{#if javascript}}
        <img class=thumb src="{{thumbURL}}" draggable=false> 
        <img class=full draggable=false> 
      {{else}}
        <img src="{{sourceURL}}" draggable=false> 
      {{/if}}
    </div>

    {{{children}}}

  </figure>
`);


// JS only: cropping and nice overlays on top
let cropTemplate = Handlebars.compile(`
  <figure x-cp-figure x-cp-crop x-cp-id={{  cpID  }} class="{{  classes  }}">

    <!-- this comment will be replaced with size info -->

    <div class=frame>
      <div class=crop>
        <img class=thumb src="{{  thumbURL  }}" draggable=false> 
        <img class=full draggable=false> 
      </div>
    </div>

    {{{children}}}

  </figure>
`);



export default class ImageView extends View {


  constructor(attrs) {
    super(attrs);

    this.aspectRatio = (
      this.attrs.media.original_height / this.attrs.media.original_width
    );
  }


  html() {
    this.source = findSource(this.attrs.media.srcset, this.quality());
    this.sourceURL = this.article.attrs.content_origin + this.source.url;

    // setting <img> just gives you an image and you're on your own
    if (this.tagName() === 'img')
      return this.simpleHTML();
    // any other tag name besides <figure> will prompt this behaviour
    else if (this.tagName() !== 'figure')
      return this.backgroundHTML();
    // crop requires JS
    else if (this.attrs.crop && this.article.attrs.javascript)
      return this.cropHTML();
    else
      return this.figureHTML();
  }


  simpleHTML() {

    let highestSource = findSource(this.attrs.media.srcset, 'high');
    let maxWidth = Math.round(1.2 * Math.min(
      highestSource.width,
      this.attrs.media.original_width
    ));

    return simpleTemplate({
      cpID: this.attrs.id,
      classes: this.classes(),
      maxWidth,
      sourceURL: this.sourceURL,
      thumbURL: this.thumbSource(),
      javascript: this.article.attrs.javascript,
    });
  }


  backgroundHTML() {

    let position;
    if (this.attrs.crop) {
      // XXX want this to be proportional to where the crop box is on the image
      let x = this.attrs.crop.left + this.attrs.crop.width / 2;
      let y = this.attrs.crop.top + this.attrs.crop.height / 2;
      let round = n => Math.round(n * 100000) / 1000;
      position = `${round(x)}% ${round(y)}%`;
    }

    return backgroundImageTemplate({
      tagName: this.tagName(),
      cpID: this.attrs.id,
      classes: this.classes(),
      sourceURL: this.sourceURL,
      thumbURL: this.thumbSource(),
      padding: (this.aspectRatio * 1000) / 10,
      position,
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
    });
  }


  figureHTML() {
    return figureTemplate({
      cpID: this.attrs.id,
      classes: this.classes(),
      sourceURL: this.sourceURL,
      thumbURL: this.thumbSource(),
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
    });
  }


  cropHTML() {
    return cropTemplate({
      cpID: this.attrs.id,
      classes: this.classes(),
      sourceURL: this.sourceURL,
      thumbURL: this.thumbSource(),
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
    });
  }


  classes() {
    if (this.article.attrs.javascript)
      return super.classes() + ' loading';
    else
      return super.classes();
  }


  tagName() {
    if (this.attrs.classes && this.attrs.classes[0] === 'img')
      return 'img';
    else
      return super.tagName();
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


  defaultTagName() {
    return 'figure';
  }

}
