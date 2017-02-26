import Handlebars from 'handlebars';

import View from './view';


let simpleTemplate = Handlebars.compile(`
  <img 
    {{#if javascript }} x-cp-image x-cp-id={{  cpID  }} {{/if }}
    draggable=false
    {{#if id }} id={{  id  }}{{/if }}
    {{#if javascript }}
      src="{{  thumbURL  }}"
    {{ else }}
      src="{{  sourceURL  }}"
    {{/if }}
    style="max-width: {{  maxWidth  }}px"
    class="{{  classes  }}">
`.replace(/\n/g, ''));


// cropping but just by center point. overlays are absolutely positioned in
// CSS
let backgroundImageTemplate = Handlebars.compile(`
  <{{tagName}} x-cp-background-image x-cp-id={{  cpID  }}
    {{#if id }} id={{  id  }}{{/if }}
    class="{{  classes  }}"
    style="
      background-image: url({{ url }});
      {{  position  }};
      max-width: {{  maxWidth }}px;
      max-height: {{ maxHeight }}px;">

    {{{  children  }}}

    <div class=shim style="padding-top: {{  padding  }}%;"></div>

  </{{tagName}}>
`.replace(/\n/g, ''));


// no cropping here. But with Javascript, it will constrain width if it's
// too big for the container (like for the max-height 100vh). JS positions
// overlays on top and perhaps will move the ones below to the side.
let figureTemplate = Handlebars.compile(`
  <figure x-cp-image x-cp-figure 
    {{#if id }} id={{  id  }}{{/if }}
    x-cp-id={{  cpID  }} class="{{  classes  }}">

    {{#if javascript}}

      <div class=frame>
        <div class=shim style="padding-top: {{  padding  }}%;"></div>
        <img src="{{  thumbURL  }}" draggable=false> 
      </div>
      {{{  children  }}}

    {{else}}

      <img src="{{  sourceURL  }}" draggable=false> 
      {{{  children  }}}

    {{/if}}

  </figure>
`.replace(/\n/g, ''));


// JS only: cropping and nice overlays on top
let cropTemplate = Handlebars.compile(`
  <figure x-cp-image x-cp-figure 
    {{#if id }} id={{  id  }}{{/if }}
    x-cp-id={{  cpID  }} class="{{  classes  }}">

    <div class=frame>
      <div class=shim style="padding-top: {{  padding  }}%;"></div>
      <div class=crop-box></div>
      <div class=crop>
        <img src="{{  thumbURL  }}" draggable=false> 
      </div>
    </div>

    {{{  children  }}}

  </figure>
`.replace(/\n/g, ''));


export default class ImageView extends View {

  constructor(attrs) {
    super(attrs);

    this.aspectRatio = (
      this.attrs.media.original_height / this.attrs.media.original_width
    );
  }


  html() {
    this.source = this.attrs.media.srcset.slice().reverse().find(s => s.width <= 1000);
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

    let highestSource = this.attrs.media.srcset.slice().reverse()[0];
    console.log({highestSource});
    console.log(this.attrs.media.srcset);
    let maxWidth = Math.round(1.2 * Math.min(
      highestSource.width,
      this.attrs.media.original_width
    ));

    return simpleTemplate({
      cpID: this.attrs.id,
      id: this.id(),
      classes: this.classes(),
      maxWidth,
      sourceURL: this.sourceURL,
      thumbURL: this.attrs.media.base64_thumb,
      javascript: this.article.attrs.javascript,
    });
  }


  backgroundHTML() {

    // CSS doesn't let us set this satisfactorily but this is close
    let position;
    if (this.attrs.crop) {
      let x = this.attrs.crop.left + this.attrs.crop.width / 2;
      let y = this.attrs.crop.top + this.attrs.crop.height / 2;
      let round = n => Math.round(n * 1000) / 10;
      position = ` background-position: ${round(x)}% ${round(y)}%`;
    }

    let highestSource = this.attrs.media.srcset.slice().reverse()[0];
    let maxWidth = 1.2 * highestSource.width;
    let maxHeight = 1.2 * highestSource.height;

    let url;
    if (this.article.attrs.javascript)
      url = this.attrs.media.base64_thumb;
    else
      url = this.sourceURL;

    return backgroundImageTemplate({
      tagName: this.tagName(),
      cpID: this.attrs.id,
      id: this.id(),
      classes: this.classes(),
      url,
      position,
      maxWidth,
      maxHeight,
      padding: (this.aspectRatio * 1000) / 10,
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
    });
  }


  figureHTML() {
    return figureTemplate({
      cpID: this.attrs.id,
      id: this.id(),
      classes: this.classes(),
      sourceURL: this.sourceURL,
      thumbURL: this.attrs.media.base64_thumb,
      padding: (this.aspectRatio * 1000) / 10,
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
    });
  }


  cropHTML() {
    return cropTemplate({
      cpID: this.attrs.id,
      id: this.id(),
      classes: this.classes(),
      sourceURL: this.sourceURL,
      thumbURL: this.attrs.media.base64_thumb,
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


  defaultTagName() {
    return 'figure';
  }

}
