import View           from './view';
import {unscopeLinks} from '../utility';

let template = (`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
  {{#if classes}} class="{{  classes  }}"{{/if}}>
  {{{  content  }}}
</{{  tagName  }}>
`);

// Single mustache { turns to {{> so that it renders a partial, however 
// it can be escaped like \{
let partialRe = /([^\\]*?)\{{1}(.*?[^\\])\}{1}/g;

export default class Graf extends View {

  constructor(attrs) {
    super(attrs);
    this.errors = [];
    this.is_empty = (this.attrs.body.trim().length === 0)
  }


  html() {

    let content = '';

    // normal paragraph, no templating
    if (this.attrs.body.indexOf('{') < 0)
      return this.htmlFromContent(this.attrs.body);

    // make the body into a template so things like { date } work
    let source = this.attrs.body.replace(partialRe, '$1{{>$2}}');

    try {
      let compiled = this.article.handlebars.compile(source);
      content = compiled(this.article.templateAttrs)
      // escaped curly brackets turned to normal curly brackets
      content = content.replace(/\\{/g, '{').replace(/\\}/g, '}');
      return this.htmlFromContent(content);
    }
    catch (error) {
      let message;
      if (this.article.trigger) {
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
    content = unscopeLinks(content, this.article.attrs.path_prefix);

    return this.article.handlebars.compile(template)({
      content,
      isOverlay: this.isOverlay(),
      cpID: this.article.attrs.client || this.isOverlay() ? this.attrs.id : '',
      classes: this.classes(),
      tagName: this.tagName(),
    });

  }


  partials() {
    let partials = [];
    let match;
    partialRe.lastIndex = 0;
    while (match = partialRe.exec(this.attrs.body))
      partials.push(match[2].trim());
    return partials;
  }


  defaultTagName() {
    if (this.path().some(c => ['Image','Video'].includes(c.attrs.type)))
      return 'div';

    return 'p';
  }

}

