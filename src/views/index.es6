import View        from './base';
import ArticleEmbed from './article_embed';

export default class Index extends View {

  constructor(attrs) {
    super(attrs);

    this.children = this.attrs.articles.map(c =>
      new ArticleEmbed({article: c})
    );

  }


  html() {
    // not ideal.. this mirrors for creating all the content
    this.children.map(c => { c.article = this.article; c.parent = this; });

    this.entryTemplate = this.article.templates.find(t => 
      t.descriptor === this.attrs.template
    );

    if (!this.entryTemplate) {
      this.entryTemplate = this.article.templates.find(t => 
        t.descriptor === 'template.index-default'
      );
    }

    this.entryTemplate = this.entryTemplate.compiled;

    return super.html();
  }

}
