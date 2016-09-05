import View  from './view';
import Index from './index';
import compile from '../templates';
import {unscopeLinks} from '../utility';

let template = compile(`
  <{{  tagName  }} class="article {{  classes  }}">
    {{{  content  }}}
  </{{  tagName  }}>
`);

let defaultTemplate = compile(`
  <h3><a href="{{  url  }}"> {{  title  }} </a></h3>
  <p class=description>{{  description  }}</p>
`);


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
      {attrs: this.attrs}
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

    if (!contentTemplate)
      contentTemplate = defaultTemplate;

    let html = this.template({
      attrs: this.attrs,
      classes: this.classes(),
      tagName: this.tagName(),
      content: contentTemplate(this.makeAttrs()),
    });

    return unscopeLinks(html, this.article.attrs.path_prefix);
  }

}
