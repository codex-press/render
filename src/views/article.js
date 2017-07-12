import prism from '../../lib/prism.js';
import marked from '../../lib/marked.js';

import handlebarsFactory from '../templates.js';

import View from './view.js';

import Audio from './audio.js';
import Block from './block.js';
import Graf from './graf.js';
import Image from './image.js';
import Video from './video.js';
import Index from './index.js';
import HTMLBlock from './html-block.js';
import ArticleEmbed from './article-embed.js';


export default class ArticleView extends View {

  constructor(attrs = {}) {
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
      this.attrs.metadata,
    );

    this.templateAttrs.content_origin = this.attrs.content_origin;

    if (!this.templateAttrs.share_message)
      this.templateAttrs.share_message = this.attrs.title;

    this.attrs.content = this.attrs.content || [];
    let templates = this.attrs.content.filter(c => (
      c.type === 'HTMLBlock' &&
      c.classes &&
      c.classes[0] ==='template'
    ));

    this.templates = templates.map(t => ({
      descriptor: t.classes.join('.'),
      compiled: this.handlebars.compile(t.body),
    }));

    this.partials = [];

    let htmlBlockPartials = this.attrs.content.filter(c => {
      return (
        c.type === 'HTMLBlock' &&
        c.classes &&
        c.classes[0] ==='partial'
      );
    });
    htmlBlockPartials.map(this.addPartialFromHTMLBlock, this);

    this.attrs.inline_assets.map(a => {
      // sigh... SVG asset uses 'min', HTML uses 'html' and JS uses 'source'
      this.addPartialFromAsset(
        a.path,
        a.versions.min || a.versions.html || a.versions.source
      )
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
    this.handlebars.registerPartial(data.classes.slice(1).join('.'), data.body || '');
  }


  addPartialFromAsset(path, source) {
    if (/\.js$/.test(path))
      source = renderJavascriptSource(source);
    if (/\.html$/.test(path))
      this.handlebars.registerPartial(path.slice(1,-4), source || '');
    this.handlebars.registerPartial(path.slice(1), source || '');
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

    this.views.push(v);
    v.article = this;
    return v;
  }


  defaultTagName() {
    return 'article';
  }


  update(data) {
    if (!this.views)
      return;
    let view = this.views.find(v => v.attrs.id == data.id);
    if (view)
      view.set(data);
    return view;
  }


  remove(id) {
    let view = this.views.find(v => v.attrs.id == id);
    // will remove children recursively in view.es6
    if (view)
      view.remove();
    return view;
  }


  add(data, index) {

    let recursiveAdd = (data, parent) => {
      let view = this.makeView(data);
      this.views.push(view);
      view.parent = parent;
      // make child views
      if (data.content)
        view.children = data.content.map(d => recursiveAdd(d, view));
      return view;
    }

    let parent;
    if (data.parent_id == this.attrs.id)
      parent = this;
    else
      parent = this.views.find(v => v.attrs.id === data.parent_id)

    let view = recursiveAdd(data, parent);

    // add to the parent's children array
    view.parent.children.splice(index, 0, view);

    //console.log(view);
    return view;
  }

}



function renderJavascriptSource(source) {
  let sections = [];
  let commentRe = /(\/\*{2,}[^]*?\*\/)/g;
  let code, docs;

  code = docs = '';

  let saveSection = () => {
    sections.push({code, docs});
    code = docs = '';
  }

  source.split(commentRe).map(part => {
    if (commentRe.test(part)) {
      if (code.trim())
        saveSection();
      part = part.replace(/^\s*\/\*{2}/, '').replace(/\*\/\s*$/, '');
      part.split('\n').forEach(line => docs += line.replace(/^\s*?\* ?/,'') + '\n');
    }
    else {
      // trim blank lines from the start
      part = part.replace(/^(\s*\n)*/g, '')
      // trim all whitespace from the end
      part = part.replace(/\s*$/g, '')
      code = part + '\n';
    }
  });

  saveSection();

  let renderer = new marked.Renderer();

  // code examples inside the markdown
  renderer.code = (code, language) => {
    code = prism.highlight(code, prism.languages.javascript);
    return `<pre class=language-javascript><code>${code}</code></pre>`;
  };

  return sections.map(({code, docs}) => {

    let highlighted = prism.highlight(code, prism.languages.javascript);

    let markdowned = marked(docs, {
      renderer,
      smartypants: true,
    });

    return (`
      <section>
        <div class=comment>${markdowned}</div>
        <div class=code>
          <pre class=language-javascript>${highlighted}</pre>
        </div>
      </section>`
    );
  }).join('');
}


