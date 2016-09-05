import {unscopeLinks} from '../templates';
import View from './base';

export default class HTMLBlock extends View {

  html() {

    let content = unscopeLinks(
      this.attrs.body,
      this.article.attrs.path_prefix
    );

    return this.template({
      content,
      attrs: this.attrs,
      classes: this.classes(),
      tagName: this.tagName() || 'div',
    });
  }

}

