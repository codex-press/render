import handlebars            from 'handlebars/runtime';
import templates, {snippets} from '../templates';

import View          from './base';
import Audio         from './audio';
import Block         from './block';
import Graf          from './graf';
import Figure        from './figure';
import HTMLBlock     from './html_block';
import ArticleEmbed  from './article_embed';
import Index         from './index';


export default class ArticleView extends View {

  constructor(attrs) {
    super();

    if (attrs)
      this.set(attrs);
  }


  set(attrs) {
    this.attrs = attrs;

    // console.log('article view', this.attrs.title);

    this.article = this;

    let snippetChildren = this.attrs.content.filter(c => {
      return (
        c.type === 'HTMLBlock' &&
        c.classes &&
        c.classes[0] ==='snippet'
      );
    });

    let snippetsHash = snippetChildren.reduce((hash, s) => {
      hash[s.classes[1]] = s.body;
      return hash;
    },{});

    // kinda terrible to do this here
    this.templateAttrs = Object.assign(
      {},
      snippets,
      {
        title: this.attrs.title,
        canonical_url: this.attrs.canonical_url,
        twitter_handle: this.attrs.twitter_handle,
        facebook_app_id: this.attrs.facebook_app_id || '1092197300805177',
      },
      this.attrs.metadata,
      snippetsHash
    );

    if (!this.templateAttrs.share_message)
      this.templateAttrs.share_message = this.attrs.title;

    this.templates = this.attrs.content.filter(c => {
      return (
        c.type === 'HTMLBlock' &&
        c.classes &&
        c.classes[0] ==='template'
      );
    });

    // makes the precomipled Handlebars template into  a function again.
    // very weird syntax... 
    this.templates.map(t => {
      t.descriptor = t.classes.join('.');
      let evaled = (new Function('return ' + t.precompiled))();
      t.compiled = handlebars.template(evaled);
    });

    this.templates.push({
      descriptor: 'template.article-embed-default',
      compiled: templates.article_embed_default,
    });

    this.templates.push({
      descriptor: 'template.index-default',
      compiled: templates.index_entry_default,
    });

    // filter out templates and snippets
    let content = this.attrs.content.filter(c => {
      return !this.templates.includes(c) && !snippetChildren.includes(c);
    });

    this.views = this.makeViews(content);

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


  makeViews(content) {
    return content.map(c => {
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
  }


  defaultTagName() {
    return 'article';
  }

}

