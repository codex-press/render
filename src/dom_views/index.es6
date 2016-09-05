import dom          from 'dom';
import DomView      from './base';
import IndexView    from '../views/index';
import ArticleEmbed from './article_embed';

export default class Index extends DomView(IndexView) {

  constructor(attrs) {
    super(attrs);

    this.children = this.attrs.articles.map(c =>
      new ArticleEmbed({article: c})
    );
  }

}

dom.mixin(Index.prototype);

