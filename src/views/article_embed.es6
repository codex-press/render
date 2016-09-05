import templates, {unscopeLinks} from '../templates';
import View  from './base';
import Index from './index';


// This class is used for children of an Index and for articles that are
// just dragged into the story explicitly to build a page of links to other
// stories.
export default class ArticleEmbed extends View {

  constructor(attrs) {
    super(attrs);
    this.attrs.type = 'ArticleEmbed';
  }


  makeAttrs() {
    return Object.assign(
      {},
      this.attrs.article.classed_content,
      this.attrs.article.metadata,
      this.attrs.article,
      {attrs: this.attrs},
      {content_origin: this.article.attrs.content_origin}
    );
  }


  html() {

    if (this.parent instanceof Index) {
      let html = this.parent.entryTemplate(this.makeAttrs());
      return unscopeLinks(html, this.article.attrs.path_prefix);
    }

    let contentTemplate = this.article.templates.find(t => 
      t.descriptor === this.attrs.template
    );

    if (!contentTemplate) {
      contentTemplate = this.article.templates.find(t => 
        t.descriptor === 'template.article-embed-default'
      );
    }

    contentTemplate = contentTemplate.compiled;

    let html = this.template({
      attrs: this.attrs,
      classes: this.classes(),
      tagName: this.tagName(),
      content: contentTemplate(this.makeAttrs()),
    });

    return unscopeLinks(html, this.article.attrs.path_prefix);
  }

}
