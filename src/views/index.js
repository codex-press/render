import Handlebars from 'handlebars';

import View        from './view';
import ArticleEmbed from './article_embed';

let defaultEntryTemplate = Handlebars.compile(`
  <p><a href="{{url}}">{{{title}}}</a></p>
`);

export default class Index extends View {

  constructor(attrs) {
    super(attrs);

    this.children = this.attrs.articles.map(c =>
      new ArticleEmbed({article: c})
    );
  }


  html() {
    // not ideal.. this mirrors for creating all the content
    this.children.map(c => {
      c.article = this.article;
      c.parent = this;
    });

    this.entryTemplate = this.article.templates.find(t => 
      t.descriptor === this.attrs.template
    );

    if (!this.entryTemplate) {
      this.entryTemplate = {
        descriptor: 'template.default',
        compiled: defaultEntryTemplate
      };
    }

    return super.html();
  }

}
