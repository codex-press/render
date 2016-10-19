import Handlebars from 'handlebars';

import View, {tags} from './view';
import Index from './index';
import {unscopeLinks} from '../utility';

let template = Handlebars.compile(`
  <{{  tagName  }} class="{{  classes  }}"
    {{#if id }} id={{  id  }}{{/if ~}}
    {{#if cpID  }}x-cp-id={{  cpID  }}{{/if }}>
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
      {
        javascript: this.article.attrs.javascript,
        content_origin: this.article.attrs.content_origin
      }
    );
  }


  html() {
    // this should only happen on the client since server replaces 
    // 'all_content' with the content
    if (this.attrs.template === 'all_content')
      return `<div x-cp-id=${ this.attrs.id } style="display:none;"></div>`;
    else
      return this.templateHTML();
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
      let html;
      try { html = this.parent.entryTemplate.compiled(this.makeAttrs()); }
      catch (e) { html = `<div>${e.message}</div>`; }
      return unscopeLinks(html, this.article.attrs.path_prefix);
    }

    let contentTemplate = this.article.templates.find(t => {
      console.log(t.descriptor, this.attrs.template, t.descriptor === this.attrs.template);
      return t.descriptor === this.attrs.template
    });

    console.log(this.attrs.template, this.article.templates[0].descriptor);

    if (contentTemplate)
      contentTemplate = contentTemplate.compiled
    else
      contentTemplate = defaultTemplate;

    let html;
    try {
      html = template({
        id: this.id(),
        cpID: this.article.attrs.client ? this.attrs.id : '',
        classes: 'article ' + this.classes(),
        tagName: this.tagName(),
        content: contentTemplate(this.makeAttrs()),
      });
    }
    catch (e) {
      html = e.message;
    }

    return unscopeLinks(html, this.article.attrs.path_prefix);
  }

}
