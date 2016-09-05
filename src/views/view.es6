import compile from '../templates';

var tags = 'nav article header main section footer h1 h2 h3 h4 h5 h6 div p aside blockquote li ul ol menu menuitem button address table th tr td'.split(' ');

let template = compile(`
<{{tagName}}
  {{#if attrs.id}}id=cp-{{attrs.id}}{{/if}}
  {{#if classes}} class="{{classes}}"{{/if}}>
  {{{children}}}
</{{tagName}}>
`);

export default class View {

  constructor(attrs = {}) {
    this.attrs = attrs;
    this.attrs.classes = this.attrs.classes || [];
    this.parent = undefined;
    this.children = [];
  }


  html() {
    return this.template({
      attrs: this.attrs,
      children: this.childrenHTML(),
      javascript: (this.article || this).attrs.javascript,
      classes: this.classes(),
      tagName: this.tagName() || 'div',
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

}

View.prototype.template = template;

