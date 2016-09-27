import hljs from 'highlight.js';
import marked from 'marked';

import handlebarsFactory from '../templates';

import View from './view';

import Audio from './audio';
import Block from './block';
import Graf from './graf';
import Image from './image';
import Video from './video';
import Index from './index';
import HTMLBlock from './html_block';
import ArticleEmbed from './article_embed';


export default class ArticleView extends View {

  constructor(attrs) {
    super(attrs);

    // fresh factory
    this.handlebars = handlebarsFactory();

    // needed for templating
    this.article = this;

    this.views = [];

    // XXX could do UA testing here... so that fallback also has responsive
    // images
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

    let templates = this.attrs.content.filter(c => (
      c.type === 'HTMLBlock' &&
      c.classes &&
      c.classes[0] ==='template'
    ));

    this.templates = templates.map(t => ({
      descriptor: t.classes.join('.'),
      compiled: this.handlebars.compile(t.body),
    }));

    this.partials = []

    let htmlBlockPartials = this.attrs.content.filter(c => {
      return (
        c.type === 'HTMLBlock' &&
        c.classes &&
        c.classes[0] ==='partial'
      );
    });
    htmlBlockPartials.map(this.addPartialFromHTMLBlock, this);

    this.attrs.inline_assets.map(a => {
      this.addPartialFromAsset(a.asset_path, a.source)
    });
 
    // filter out templates and partials
    let content = this.attrs.content.filter(c =>
      !templates.includes(c) && !htmlBlockPartials.includes(c)
    );

    content.map(this.makeView, this);

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


  addPartialFromHTMLBlock(data) {
    this.handlebars.registerPartial(data.classes.slice(1).join('.'), source);
    this.handlebars.registerPartial(data.asset_path.slice(0, -4), source);
  }


  addPartialFromAsset(path, source) {
    if (/\.es6$/.test(path))
      source = renderJavascriptSource(source);
    if (/\.hbs/.test(path))
      this.handlebars.registerPartial(path.slice(0,-4), source);
    this.handlebars.registerPartial(path, source);
  }


  makeView(data) {

    let v;
    switch (data.type) {
      case 'Graf':         v = new Graf(data);         break;
      case 'Image':        v = new Image(data);        break;
      case 'Video':        v = new Video(data);        break;
      case 'Audio':        v = new Audio(data);        break;
      case 'Block':        v = new Block(data);        break;
      case 'Index':        v = new Index(data);        break;
      case 'HTMLBlock':    v = new HTMLBlock(data);    break;
      case 'ArticleEmbed': v = new ArticleEmbed(data); break;
    }

    if (v.is_empty)
      return;

    this.views.push(v);
    v.article = this;
    return v;
  }


  defaultTagName() {
    return 'article';
  }


  set(data) {
    let v = this.views.find(v => v.attrs.id == data.id);
    v.attrs = data;
    return v;
  }


  remove(id) {
    this.views.find(v => v.id).remove();
  }

  add(data) {

  }

}


// Thanks to Docco and Jeremy Ashkenas:
// https://jashkenas.github.io/docco/

function renderJavascriptSource(source) {
  let sections = [];
  let commentRe = RegExp('^\s*//');
  let code, docs;
  code = docs = '';
  let saveSection = () => {
    sections.push({code, docs});
    code = docs = '';
  }

  source.split('\n').map(line => {
    if (commentRe.test(line)) {
      if (code)
        saveSection();
      docs += line.replace(commentRe, '') + '\n';
    }
    else {
      code += line + '\n';
    }
  });
  saveSection();

  return sections.map(({code, docs}) => {

    let highlighted = hljs.highlight('javascript', code).value;

    let markdowned = marked(docs, {
      smartypants: true,
      highlight: code => hljs.highlight('javascript', code).value
    });

    return (`
      <section>
        <div class=comment>${markdowned}</div>
        <pre class=hljs>${highlighted}</pre>
      </section>`
    );
  }).join('');
}


