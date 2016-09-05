import dom          from 'dom';
import EventEmitter from 'events';

const factory = superClass => class DomView extends EventEmitter(superClass) {

  constructor(attrs) {
    super(attrs);
    this.plugins = [];
  }


  attach() {
    this.el = this.parent.find('#cp-' + this.attrs.id);
    this.children.map(c => { c.attach(); });
  }


  set(data) {
    super.set(data);
    if (this.el) {
      this.el.outerHTML = this.html();
      this.attach();
    }
  }


  remove() {
    super.remove();
    if (this.el)
      this.el.remove();
  }

};

export {factory as default};

