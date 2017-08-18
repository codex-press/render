import View from './view.js';
import { unscopeLinks } from '../utility.js';

let template = (`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if id }} id={{  id  }}{{/if ~}}
  {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
  {{#if classes}} class="{{  classes  }}"{{/if}}>
  {{{  content  }}}
</{{  tagName  }}>
`);

// Single mustache { turns to {{> so that it renders a partial, however 
// it can be escaped like \{
let partialRe = /(^|[^\\])\{{1}(.*?[^\\])\}{1}/g;

export default class Graf extends View {

  constructor(attrs) {
    super(attrs);
    this.errors = [];
  }


  isEmpty() {
    return (
      this.attrs.body.trim().length === 0 &&
      this.attrs.classes.length === 0
    );
  }


  html() {

    if (this.isEmpty()) {
      if (this.article.attrs.client)
        return `<p x-cp-id="${this.attrs.id}" style="display: none;"></p>`;
      else
        return '';
    }

    let content = '';

    // normal paragraph, no templating
    if (this.attrs.body.indexOf('{') < 0)
      return this.htmlFromContent(this.attrs.body);

    // hack to solve a problem where above regex fails on back to back things
    let body = this.attrs.body.replace('}{', '} {');

    // make the body into a template so things like { date } work
    let source = body.replace(partialRe, '$1{{>$2}}');

    try {
      let compiled = this.article.handlebars.compile(source);
      content = compiled(this.article.templateAttrs)
      // escaped curly brackets turned to normal curly brackets
      content = content.replace(/\\{/g, '{').replace(/\\}/g, '}');
      return this.htmlFromContent(content);
    }
    catch (error) {
      let message;
      if (this.article.client) {
        this.article.trigger('assetMissing', this, error);
        message = 'Loading... ' + this.partials().join(' ');
      }
      else {
        if (this.article.attrs.client) {
          console.warn(source);
          console.error(error);
        }
        message = error.message;
      }
      return this.htmlFromContent(message);
    }

  }


  htmlFromContent(content) {

    // change links for virtual hosts
    content = unscopeLinks(
      content,
      this.article.attrs.path_prefix,
      this.article.attrs.top_origin
    );

    return this.article.handlebars.compile(template)({
      content,
      isOverlay: this.isOverlay(),
      id: this.id(),
      cpID: this.article.attrs.client || this.isOverlay() ? this.attrs.id : '',
      classes: this.classes(),
      tagName: this.tagName(),
    });

  }


  partials() {

    // :( This is third place this is hard coded
    let builtIn = 'br date play audio share fullscreen email reddit twitter facebook play_icon audio_icon fullscreen_icon share_icon email_icon reddit_icon twitter_icon facebook_icon'.split(/ /);

    let partials = [];
    let match;
    partialRe.lastIndex = 0;
    while (match = partialRe.exec(this.attrs.body)) {
      let name = match[2].trim()
      if (!partials.includes(name) && !builtIn.includes(name))
        partials.push(name);
    }
    return partials;
  }


  defaultTagName() {

    // empty except for inline asset means it just gets <div> (<p> causes
    // many problems since other block elements inside are out of spec and
    // will move after when it renders)
    if (this.attrs.body.replace(/\{{1}.*?\}{1}/g,'').trim().length === 0)
      return 'div';

    switch(this.parent.tagName()) {
      case 'figure': return 'figcaption';
      case 'tr'    : return 'td';
      case 'ul'    : return 'li';
      case 'ol'    : return 'li';
      default      : return 'p';
    }
  }

}

