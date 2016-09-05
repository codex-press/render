import Handlebars from 'handlebars';
import View          from './view';
import Audio         from './audio';
import Block         from './block';
import Graf          from './graf';
import Figure        from './figure';
import HTMLBlock     from './html_block';
import ArticleEmbed  from './article_embed';
import Index         from './index';


export default class ArticleView extends View {

  constructor(attrs) {
    super(attrs);

    // fresh factory
    this.handlebars = Handlebars.create();

    // could do UA testing here
    // if (!this.attrs.javascript)
      this.attrs.quality = 'high';

    // kinda terrible to do this here
    this.templateAttrs = Object.assign(
      {},
      {
        title: this.attrs.title,
        canonical_url: this.attrs.canonical_url,
        twitter_handle: this.attrs.twitter_handle,
        facebook_app_id: this.attrs.facebook_app_id || '1092197300805177',
      },
      this.attrs.metadata
    );

    if (!this.templateAttrs.share_message)
      this.templateAttrs.share_message = this.attrs.title;

    this.templates = this.attrs.content.filter(c => (
      c.type === 'HTMLBlock' &&
      c.classes &&
      c.classes[0] ==='template'
    ));

    let partials = this.attrs.content.filter(c => {
      return (
        c.type === 'HTMLBlock' &&
        c.classes &&
        c.classes[0] ==='partial'
      );
    });
    this.partials = (this.attrs.partials || []).concat(partials);
 
    // filter out templates and partials
    let content = this.attrs.content.filter(c => {
      return !this.templates.includes(c) && !partials.includes(c);
    });

    this.views = content.map(c => {
      switch (c.type) {
        case 'Graf':         return new Graf(c);
        case 'Image':        return new Figure(c);
        case 'Video':        return new Figure(c);
        case 'Audio':        return new Audio(c);
        case 'Block':        return new Block(c);
        case 'Index':        return new Index(c);
        case 'HTMLBlock':    return new HTMLBlock(c);
        case 'ArticleEmbed': return new ArticleEmbed(c);
      }
    });

    this.views = this.views.filter(c => !c.is_empty);
    this.views.map(c => c.article = this);

    // we make the content array a tree
    this.children = this.views.reduce((list, item, i, children) => {

      // add to parent
      if (item.attrs.parent_id) {
        var parent = children.find(function(p) {
          return p.attrs.id === item.attrs.parent_id;
        });
        item.parent = parent;
        parent.children.push(item);
      }
      // no parent
      else {
        item.parent = this;
        list.push(item);
      }

      return list;
    },[]);

  }


  defaultTagName() {
    return 'article';
  }

}

