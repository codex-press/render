import Handlebars from 'handlebars';

import View, {tags} from './view';
import Index from './index';
import {unscopeLinks} from '../utility';

let template = Handlebars.compile(`
  <{{  tagName  }} class="{{  classes  }}"
    {{#if cpID  }}id={{  cpID  }}{{/if }}>
    {{{  content  }}}
  </{{  tagName  }}>
`);

let defaultTemplate = Handlebars.compile(`
  <h3><a href="{{  url  }}"> {{  title  }} </a></h3>
  <p class=description>{{  description  }}</p>
`);


// This class is used for children of an Index and for articles that are
// just dragged into the story explicitly to build a page of links to other
// stories.
export default class ArticleEmbed extends View {

  constructor(attrs) {
    super(attrs);
    // if it comes from Index children it doesn't have this
    this.attrs.type = 'ArticleEmbed';
  }


  makeAttrs() {
    return Object.assign(
      {},
      this.attrs.article.classed_content,
      this.attrs.article.metadata,
      this.attrs.article,
      {attrs: this.attrs},
      {javascript: this.article.attrs.javascript}
    );
  }


  html() {
    if (this.attrs.template === 'all_content')
      return this.contentHTML();
    else
      return this.templateHTML();
  }


  contentHTML() {
    return template({
      tagName: this.articleTagName(),
      classes: this.articleClasses(),
      cpID: this.article.attrs.client ? this.attrs.id : '',
      content: this.childrenHTML(),
    });
  }


  articleTagName() {
    var classes = this.attrs.article.classes || [];
    var first = (classes[0] || '').toLowerCase();
    return tags.includes(first) ? classes[0] : 'aside';
  }


  articleClasses() {
    if (this.articleTagName() === this.attrs.classes[0])
      return this.attrs.article.classes.slice(1).join(' ');
    else
      return (this.attrs.article.classes || []).join(' ');
  }


  templateHTML() {

    if (this.parent instanceof Index) {
      let html = this.parent.entryTemplate.compiled(this.makeAttrs());
      return unscopeLinks(html, this.article.attrs.path_prefix);
    }

    let contentTemplate = this.article.templates.find(t => {
      return t.descriptor === this.attrs.template
    });

    if (contentTemplate)
      contentTemplate = contentTemplate.compiled
    else
      contentTemplate = defaultTemplate;

    let html = template({
      cpID: this.article.attrs.client ? this.attrs.id : '',
      classes: 'article ' + this.classes(),
      tagName: this.tagName(),
      content: contentTemplate(this.makeAttrs()),
    });

    return unscopeLinks(html, this.article.attrs.path_prefix);
  }

}
