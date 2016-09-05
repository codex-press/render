import * as u        from 'utility';
import templates     from '../templates';

var tags = 'nav article header main section footer h1 h2 h3 h4 h5 h6 div p aside blockquote li ul ol menu menuitem button address table th tr td'.split(' ');

export default class View {

  constructor(attrs = {}) {
    this.attrs = attrs;
    this.attrs.classes = this.attrs.classes || [];
    this.parent = undefined;
    this.children = [];
  }


  template(data) {
    let fn = templates[u.toSnakeCase(this.attrs.type || '')];
    fn = fn || templates.basic;
    return fn(data);
  }


  html() {
    return this.template({
      attrs: this.attrs,
      children: this.childrenHTML(),
      javascript: this.article.attrs.javascript,
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

