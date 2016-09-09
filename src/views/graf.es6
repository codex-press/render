import View           from './view';
import {unscopeLinks} from '../utility';

let template = (`
  <{{  tagName  ~}}
    {{#if cpID }} x-cp-id={{  cpID  }}{{/if ~}}
    {{#if classes}} class="{{  classes  }}"{{/if}}>
    {{{  content  }}}
  </{{  tagName  }}>
`);

export default class Graf extends View {

  constructor(attrs) {
    super(attrs);
    this.is_empty = (this.attrs.body.trim().length === 0)
  }


  html() {

    let content = '';
    // normal paragraph
    if (this.attrs.body.indexOf('{') < 0)
      content = this.attrs.body;
    // make the body into a template so things like {>date} work
    else {

      // single mustache for {{> so it renders partial works and is not
      // escaped. single curly bracket itself escaped with \

      let partials = this.attrs.body.match(/\{(.+?)\}/g).map(s => {
        return s.replace(/[{}]/g,'').trim();
      });

      let bracketRe = /([^\\]*?)\{{1}(.*?[^\\])\}{1}/g;
      let source = this.attrs.body.replace(bracketRe, '$1{{>$2}}');
      try {
        let compiled = this.article.handlebars.compile(source);
        content = compiled(this.article.templateAttrs)
      }
      catch (e) {
        console.log(e);
        this.article.trigger('assetMissing', this, partials);
        if (this.article.attrs.client)
          content = 'Loading... ' + partials.join(' ');
        else
          content = e.message;
      }
    }

    // escaped curly brackets turned to normal curly brackets
    content = content.replace(/\\{/g, '{').replace(/\\}/g, '}');

    // change links for virtual hosts
    content = unscopeLinks(content, this.article.attrs.path_prefix);

    return this.article.handlebars.compile(template)({
      content,
      cpID: this.article.attrs.client ? this.attrs.id : '',
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

