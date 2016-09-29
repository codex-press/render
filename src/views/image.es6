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


// cropping but just by center point. overlays are absolutely positioned in
// CSS
let backgroundImageTemplate = Handlebars.compile(`
  <{{tagName}} x-cp-background-image x-cp-id={{  cpID  }}
    class="{{  classes  }}"
    style="background-image: url({{ url }});{{  position  }}">

    {{{  children  }}}

    <div class=shim style="padding-top: {{  padding  }}%;"></div>

  </{{tagName}}>
`);


// no cropping here.  but with Javascript, it will constrain width if it's
// too big for the container (like for the max-height 100vh). Positions
// overlays
let figureTemplate = Handlebars.compile(`
  <figure x-cp-image x-cp-figure x-cp-id={{  cpID  }} class="{{  classes  }}">

    {{#if javascript}}
      <div class=frame>
        <div class=shim style="padding-top: {{  padding  }}%;"></div>
        <img class=thumb src="{{  thumbURL  }}" draggable=false> 
        <img class=full draggable=false> 
      </div>
    {{else}}
      <img src="{{  sourceURL  }}" draggable=false> 
    {{/if}}

    {{{  children  }}}

  </figure>
`);


// JS only: cropping and nice overlays on top
let cropTemplate = Handlebars.compile(`
  <figure x-cp-image x-cp-figure x-cp-id={{  cpID  }} class="{{  classes  }}">

    <div class=frame>
      <div class=shim style="padding-top: {{  padding  }}%;"></div>
      <div class=crop>
        <img class=thumb src="{{  thumbURL  }}" draggable=false> 
        <img class=full draggable=false> 
      </div>
    </div>

    {{{  children  }}}

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
    // any other tag name besides <figure> will use background image 
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

    // CSS doesn't let us set this satisfactorily but this is close
    let position;
    if (this.attrs.crop) {
      let x = Math.round(this.attrs.crop.left * 1000) / 10;
      let y = Math.round(this.attrs.crop.top * 1000) / 10;
      position = ` background-position: ${x}% ${y}%`;
    }

    let url;
    if (this.article.attrs.javascript)
      url = this.thumbSource();
    else
      url = this.sourceURL;

    return backgroundImageTemplate({
      tagName: this.tagName(),
      cpID: this.attrs.id,
      classes: this.classes(),
      url,
      position,
      padding: (this.aspectRatio * 1000) / 10,
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
      padding: (this.aspectRatio * 1000) / 10,
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
      padding: (this.aspectRatio * 1000) / 10,
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