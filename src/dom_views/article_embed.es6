import dom from 'dom';
import ArticleEmbedView from '../views/article_embed';
import DomView          from './base';

export default class ArticleEmbed extends DomView(ArticleEmbedView) {

}

dom.mixin(ArticleEmbed.prototype);

