import handlebars from 'handlebars/runtime';

import dateFormat from 'dateformat';

import * as u     from 'utility';

import './templates/compiled';
export default handlebars.templates;


export const unscopeLinks = function unscopeLinks(html, pathPrefix) {
  return html.replace(/<a[^>]* href="?([^" >]*?)[" >]/g, (string, url) => {
    // if it's an absolute path, fix the path
    if (/^\//.test(url))
      return string.replace(url, u.unscopedPath(pathPrefix, url));
    else
      return string;
  });
};


export const snippets = {

  br:          '<br>',

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
};


// uses dateFormat library: https://github.com/felixge/node-dateformat
handlebars.registerHelper('date', function(format, options) {
  options = arguments[arguments.length - 1];
  format = arguments.length > 1 ? arguments[0] : 'longDate';
  return dateFormat(options.data.root.publication_date, format);
});


// used in video
handlebars.registerHelper('printTime', seconds => {
  return u.printTime(seconds);
});


handlebars.registerHelper('cover', function() {
  let options = arguments[arguments.length - 1];

  // size is optional first argument
  let size = arguments.length > 1 ? arguments[0] : 'thumb';

  // there is no cover image
  let cover = options.data.root.cover;
  if (!cover)
    return '';

  let source = u.findSource(cover.media.srcset, size);

  let url;
  if (cover.type === 'Video')
    url = options.data.root.content_origin + source.poster;
  else
    url = options.data.root.content_origin + source.url;

  return `<img class=cover src="${url}">`;
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


