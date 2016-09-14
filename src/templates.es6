import Handlebars from 'handlebars';
import dateFormat from 'dateformat';
import * as u from './utility';


export default function factory() {

  let handlebars = Handlebars.create();

  handlebars.registerPartial({

    br:          '<br>',
    
    date:        '{{ formatDate publication_date "longDate" }}',

    play:        '<span class="play-button icon-play"></span>',
    audio:       '<span class="audio-button icon-audio"></span>',
    share:       '<span class="share-button icon-share"></span>',
    fullscreen:  '<span class="fullscreen-button icon-fullscreen"></span>',

    play_icon:        '<span class="icon-play"></span>',
    audio_icon:       '<span class="icon-audio"></span>',
    share_icon:       '<span class="icon-share"></span>',
    fullscreen_icon:  '<span class="icon-fullscreen"></span>',

    email_icon:       '<span class="icon-email"></span>',
    reddit_icon:      '<span class="icon-reddit"></span>',
    twitter_icon:     '<span class="icon-twitter"></span>',
    facebook_icon:    '<span class="icon-facebook"></span>',

  });


  // uses dateFormat library: https://github.com/felixge/node-dateformat
  handlebars.registerHelper('formatDate', function(date, format, options) {
    try {
      options = arguments[arguments.length - 1];
      format = arguments.length > 2 ? arguments[1] : 'longDate';
      return dateFormat(date, format);
    }
    catch (e) {
      return e.message;
    }
  });


  // used in video
  handlebars.registerHelper('printTime', seconds => {
    return u.printTime(seconds);
  });


  handlebars.registerHelper('cover', function() {
    let options = arguments[arguments.length - 1];

    // there is no cover image
    let cover = options.data.root.cover;
    if (!cover) {
      if (options.fn)
        return '<div>' + options.fn(this) + '</div>';
      else
        return '';
    }

    let source = u.findSource(cover.media.srcset, 'low');

    let cpID = options.data.root.attrs.id;

    let url;
    if (options.data.root.javascript)
      url = 'data:image/jpeg;base64,' + cover.media.base64_thumb;
    else if (cover.type === 'Video')
      url = options.data.root.content_origin + source.poster;
    else
      url = options.data.root.content_origin + source.url;

    let aspectRatio = source.height / source.width;
    let padding = Math.round(aspectRatio * 1000) / 10;

    let position = '';
    if (cover.crop) {
      let x = cover.crop.left + cover.crop.width / 2;
      let y = cover.crop.top + cover.crop.height / 2;
      let round = n => Math.round(n * 100000) / 1000;
      position = ` background-position: ${round(x)}% ${round(y)}%`;
    }

    if (options.fn) {
      return (`<div x-cp-background-image x-cp-id=${ cpID }
        class=cover
        style="background-image: url(${ url });${ position }">
          ${options.fn(this)}
          <div class=shim style="padding-top: ${ padding }%;"></div>
        </div>`);
    }
    else {
      return (`<img x-cp-image x-cp-id=${ cpID } draggable=false
        class=cover
        {{#if javascript }}
          src="{{  thumbURL  }}"
        {{ else }}
          src="{{  sourceURL  }}"
        {{/if }}
        style="max-width: {{  maxWidth  }}px">`);
    }
  });


  handlebars.registerHelper('facebook', function(options) {

    let urlToShare = (
      options.data.root.canonical_url +
      '?utm_campaign=social&utm_source=facebook'
    );

    let url = (
      'https://www.facebook.com/dialog/share?' +
      'app_id=' + encodeURIComponent(options.data.root.facebook_app_id) +
      '&display=popup' +
      '&href=' + encodeURIComponent(urlToShare)
    );

    if (options.fn)
      return `<a href="${url}" target=_blank>${options.fn(this)}</a>`;
    else
      return `<a href="${url}" target=_blank><span class=icon-facebook></span></a>`;
  });



  handlebars.registerHelper('twitter', function() {

    let options = arguments[arguments.length - 1];

    // if not passed in, it will go to article metadata one, then title.
    let message = (
      (arguments.length > 1 ? arguments[0] : options.data.root.share_message)
    );

    let urlToShare = (
      options.data.root.canonical_url +
      '?utm_campaign=social&utm_source=twitter'
    );

    // can replace with default Codex twitter (when one is created)
    let via = (options.data.root.twitter_handle || '').replace(/^@/,'');

    let url = (
      'https://twitter.com/intent/tweet' +
      '?text=' + encodeURIComponent(message) +
      '&via=' + encodeURIComponent(via) +
      '&url=' + encodeURIComponent(urlToShare)
    );

    if (options.fn)
      return `<a href="${url}" target=_blank>${options.fn(this)}</a>`;
    else
      return `<a href="${url}" target=_blank><span class=icon-twitter></span></a>`;
  });


  handlebars.registerHelper('reddit', function(options) {

    let urlToShare = encodeURIComponent(
      options.data.root.canonical_url +
      '?utm_campaign=social&utm_source=reddit'
    );

    let url = (
      'http://reddit.com/submit' +
      '?url=' + urlToShare +
      '&title=' + encodeURIComponent(options.data.root.title)
    );

    if (options.fn)
      return `<a href="${url}" target=_blank>${options.fn(this)}</span></a>`;
    else
      return `<a href="${url}" target=_blank><span class=icon-reddit></span></a>`;
  });


  handlebars.registerHelper('email', function() {

    let options = arguments[arguments.length - 1];

    // if not passed in, it will go to article metadata one, then title.
    // (these set in ContentCollection)
    let message = (
      (arguments.length > 1 ? arguments[0] : options.data.root.share_message)
    );

    let urlToShare = encodeURIComponent(
      options.data.root.canonical_url +
      '?utm_campaign=social&utm_source=email'
    );

    let url = (
      'mailto:' +
      '?subject=' + encodeURIComponent(options.data.root.title) +
      '&body=' + encodeURIComponent(message + '\n\n') + urlToShare
    );

    if (options.fn)
      return `<a href="${url}" target=_blank>${options.fn(this)}</span></a>`;
    else
      return `<a href="${url}" target=_blank><span class=icon-email></span></a>`;

  });


  return handlebars;
}
