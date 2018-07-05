import Handlebars from '../../lib/handlebars.js';
import EventEmitter from '../events.js';

export let tags = 'nav article header main section footer h1 h2 h3 h4 h5 h6 div p aside blockquote li ul ol menu menuitem button address table tbody thead th tr td pre figure figcaption video fx-carousel'.split(' ');

let template = Handlebars.compile(`
<{{  tagName  ~}}
  {{#if isOverlay}} x-cp-overlay{{/if ~}}
  {{#if id }} id={{  id  }}{{/if ~}}
  {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
  {{#if classes }} class="{{  classes  }}"{{/if }}>
  {{{  children  }}}
</{{  tagName  }}>
`);


export default class View extends EventEmitter() {

  constructor(attrs = {}) {
    super();
    this.set(attrs);
    this.parent = undefined;
    this.children = [];
  }


  set(attrs) {
    this.attrs = attrs;
    this.attrs.classes = this.attrs.classes || [];
  }


  remove() {
    this.article.views = this.article.views.filter(v => v !== this);
    this.parent.children = this.parent.children.filter(v => v !== this);
    // this.children.map(c => c.remove());
  }


  html() {
    return this.template({
      attrs: this.attrs,
      isOverlay: this.isOverlay(),
      id: this.id(),
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


  id() {
    let id = (this.attrs.classes || []).find(c => /^#/.test(c));
    if (id)
      return id.slice(1)
  }


  defaultTagName() {
    return 'div';
  }


  classes() {

    // exclude ID
    let classes = (this.attrs.classes || []).filter(c => !/^#/.test(c));

    // remove tag name
    if (this.tagName() === this.attrs.classes[0])
      classes.shift();

    return classes.join(' ');
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

