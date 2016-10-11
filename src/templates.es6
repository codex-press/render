import Handlebars from 'handlebars';
import dateFormat from 'dateformat';
import * as u from './utility';
import icons from './icons';


export default function factory() {

  let handlebars = Handlebars.create();

  handlebars.registerPartial({

    br:         '<br>',

    date:       '<time datetime="{{publication_date}}">{{ formatDate publication_date "longDate" }}</time>',

    play:       `<span class="cp-play-button">${icons.play}</span>`,
    audio:      `<span class="cp-audio-button">${icons.audio}</span>`,
    share:      `<span class="cp-share-button">${icons.share}</span>`,
    fullscreen: `<span class="cp-fullscreen-button">${icons.fullscreen}</span>`,

    email:       '{{{ email }}}',
    reddit:      '{{{ reddit }}}',
    twitter:     '{{{ twitter message }}}',
    facebook:    '{{{ facebook }}}',

    play_icon:        icons.play,
    audio_icon:       icons.audio,
    fullscreen_icon:  icons.fullscreen,
    share_icon:       icons.share,
    email_icon:       icons.email,
    reddit_icon:      icons.reddit,
    twitter_icon:     icons.twitter,
    facebook_icon:    icons.facebook,

  });


  // uses dateFormat library: https://github.com/felixge/node-dateformat
  handlebars.registerHelper('formatDate', function(date, format, options) {
    try {
      // format is optional
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

    let size = 'low';
    if (arguments.length > 1)
       size = arguments[0];

    // there is no cover image
    let cover = options.data.root.cover;
    if (!cover) {
      if (options.fn)
        return '<div class=cover>' + options.fn(this) + '</div>';
      else
        return '';
    }

    let source = u.findSource(cover.media.srcset, size);

    let cpID = cover.id;

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
      let x = Math.round(cover.crop.left * 1000) / 10;
      let y = Math.round(cover.crop.top * 1000) / 10;
      position = ` background-position: ${x}% ${y}%`;
    }

    let highestSource = u.findSource(cover.media.srcset, 'high');
    let maxWidth = Math.round(1.2 * Math.min(
      highestSource.width,
      cover.media.original_width
    ));
    maxWidth = `max-width: ${ maxWidth }px`;

    if (options.fn) {
      return (
        `<div x-cp-background-image x-cp-id=${ cpID }
          class=cover
        style="background-image: url(${ url }); ${ position }; ${ maxWidth }">
          ${options.fn(this)}
            <div class=shim style="padding-top: ${ padding }%;"></div>
          </div>`
             );
    }
    else {
      return (
        `<img x-cp-image x-cp-id=${ cpID } draggable=false
          class=cover src="${ url }" style="${ maxWidth }">`
      );
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
      return `<a href="${url}" target=_blank>${icons.facebook}</a>`;
  });



  handlebars.registerHelper('twitter', function() {

    let options = arguments[arguments.length - 1];
    
    // if not passed in, it will go to Article metadata share_message, then
    // title.
    let message = options.data.root.share_message;
    if (arguments.length > 1 && arguments[0])
      message = arguments[0];

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
      return `<a href="${url}" target=_blank>${icons.twitter}</a>`;
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
      return `<a href="${url}" target=_blank>${icons.reddit}</a>`;
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
      return `<a href="${url}" target=_blank>${icons.email}</a>`;

  });


  return handlebars;
}
