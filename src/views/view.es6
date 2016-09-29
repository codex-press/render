import Handlebars from 'handlebars';
import EventEmitter from 'events';

export let tags = 'nav article header main section footer h1 h2 h3 h4 h5 h6 div p aside blockquote li ul ol menu menuitem button address table th tr td pre figure figcaption'.split(' ');

let template = Handlebars.compile(`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
  {{#if classes }} class="{{  classes  }}"{{/if }}>
  {{{  children  }}}
</{{  tagName  }}>
`);

// FIRST TIME WE NEEDED TO DO SERVER CHECK
// creeep begins
let Super;
if (typeof window === 'undefined')
  Super = class NotNodeEventEmitterSilly { }
else
  Super = EventEmitter();

export default class View extends Super {

  constructor(attrs = {}) {
    super();
    this.attrs = attrs;
    this.attrs.classes = this.attrs.classes || [];
    this.parent = undefined;
    this.children = [];
  }


  html() {
    return this.template({
      attrs: this.attrs,
      isOverlay: this.isOverlay(),
      cpID: this.article.attrs.client || this.isOverlay() ? this.attrs.id : '',
      children: this.childrenHTML(),
      javascript: (this.article || this).attrs.javascript,
      classes: this.classes(),
      tagName: this.tagName(),
    });
  }


  tagName() {
    var classes = this.attrs.classes || [];
    var tag = (classes[0] || '').toLowerCase();
    return tags.includes(tag) ? classes[0] : this.defaultTagName();
  }


  defaultTagName() {
    return 'div';
  }


  classes() {
    if (this.tagName() === this.attrs.classes[0])
      return this.attrs.classes.slice(1).join(' ');
    else
      return (this.attrs.classes || []).join(' ');
  }


  childrenHTML() {
    if (!this.children)
      return '';

    return this.children.map(c => {
      if (c.html)
        return c.html()
    }).join('');
  }


  path() {
    if (this.parent)
      return this.parent.path().concat(this);
    else
      return [this]
  }


  isOverlay() {
    return (
      this.parent &&
      ['Image','Video'].includes(this.parent.attrs.type) &&
      this.parent.tagName() === 'figure'
    );
  }

}

View.prototype.template = template;

