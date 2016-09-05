import View           from './view';
import compile  from '../templates';
import {unscopeLinks} from '../utility';

let template = compile(`
<{{tagName}} {{#if classes}} class="{{classes}}"{{/if}}>
  {{{content}}}
</{{tagName}}>
`);


export default class Graf extends View {

  constructor(attrs) {
    super(attrs);
    this.is_empty = (this.attrs.body.trim().length === 0)
  }


  html() {

    let content;
    if (this.attrs.template) {
      let precompiled = (new Function('return ' + this.attrs.template))();
      content = template(this.article.templateAttrs);
    }
    // this graf is not a template or server would have sent it
    else
      content = this.attrs.body;

    // escaped curly brackets turned to normal curly brackets
    content = content.replace(/\\{/g, '{').replace(/\\}/g, '}');

    // change links for virtual hosts
    content = unscopeLinks(content, this.article.attrs.path_prefix);

    return this.template({
      content,
      attrs: this.attrs,
      classes: this.classes(),
      tagName: this.tagName(),
    });

  }


  defaultTagName() {
    if (this.path().some(c => ['Image','Video'].includes(c.attrs.type)))
      return 'div';

    return 'p';
  }

}

