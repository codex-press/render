(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


// attachAssets() {


//   let js = article.attrs.scripts.map(s =>  {
//     let el = document.createElement('script');
//     // not necessary obviously but just to help people understand
//     el.async = true;
//     // crossorigin attribute allows better error events
//     el.setAttribute('crossorigin','');
//     let repo = s.match(/^(.*?)[-./]/)[1];
//     if (developmentRepos.includes(repo)) {
//       let base = s.match(/(.*?)(-[a-f0-9]{32})?\.js$/)[1];
//       log.info('serving from development: ', base + '.js');
//       el.src = `https://localhost:8000/${base}.js`;
//     }
//     else
//       el.src = env.contentOrigin + '/' + s;
//     return el;
//   });

//   let css = article.attrs.stylesheets.map(s => {
//     let repo = s.match(/^(.*?)[-./]/)[1];
//     if (developmentRepos.includes(repo)) {
//       let base = s.match(/(.*?)(-[a-f0-9]{32})?\.css$/)[1];
//       log.info('serving from development: ', base + '.css');
//       s = `https://localhost:8000/${base}.css`;
//     }
//     else
//       s = env.contentOrigin + '/' + s;
//     return dom.create(`<link rel=stylesheet href="${s}">`)
//   });

//   // Editor-side article preview sends style as well
//   if (article.attrs.style)
//     dom('head').append(`<style>${article.attrs.style}</style>`);

//   return Promise.all(js.concat(css).map(el => {
//     dom.append(document.head, el);
//     return new Promise((resolve, reject) => {
//       el.onload = resolve;
//       setTimeout(resolve, 3000);
//     })
//   }));
// }
"use strict";

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguZXM2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNFRTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcblxuICAvLyBhdHRhY2hBc3NldHMoKSB7XG5cblxuICAvLyAgIGxldCBqcyA9IGFydGljbGUuYXR0cnMuc2NyaXB0cy5tYXAocyA9PiAge1xuICAvLyAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIC8vICAgICAvLyBub3QgbmVjZXNzYXJ5IG9idmlvdXNseSBidXQganVzdCB0byBoZWxwIHBlb3BsZSB1bmRlcnN0YW5kXG4gIC8vICAgICBlbC5hc3luYyA9IHRydWU7XG4gIC8vICAgICAvLyBjcm9zc29yaWdpbiBhdHRyaWJ1dGUgYWxsb3dzIGJldHRlciBlcnJvciBldmVudHNcbiAgLy8gICAgIGVsLnNldEF0dHJpYnV0ZSgnY3Jvc3NvcmlnaW4nLCcnKTtcbiAgLy8gICAgIGxldCByZXBvID0gcy5tYXRjaCgvXiguKj8pWy0uL10vKVsxXTtcbiAgLy8gICAgIGlmIChkZXZlbG9wbWVudFJlcG9zLmluY2x1ZGVzKHJlcG8pKSB7XG4gIC8vICAgICAgIGxldCBiYXNlID0gcy5tYXRjaCgvKC4qPykoLVthLWYwLTldezMyfSk/XFwuanMkLylbMV07XG4gIC8vICAgICAgIGxvZy5pbmZvKCdzZXJ2aW5nIGZyb20gZGV2ZWxvcG1lbnQ6ICcsIGJhc2UgKyAnLmpzJyk7XG4gIC8vICAgICAgIGVsLnNyYyA9IGBodHRwczovL2xvY2FsaG9zdDo4MDAwLyR7YmFzZX0uanNgO1xuICAvLyAgICAgfVxuICAvLyAgICAgZWxzZVxuICAvLyAgICAgICBlbC5zcmMgPSBlbnYuY29udGVudE9yaWdpbiArICcvJyArIHM7XG4gIC8vICAgICByZXR1cm4gZWw7XG4gIC8vICAgfSk7XG5cbiAgLy8gICBsZXQgY3NzID0gYXJ0aWNsZS5hdHRycy5zdHlsZXNoZWV0cy5tYXAocyA9PiB7XG4gIC8vICAgICBsZXQgcmVwbyA9IHMubWF0Y2goL14oLio/KVstLi9dLylbMV07XG4gIC8vICAgICBpZiAoZGV2ZWxvcG1lbnRSZXBvcy5pbmNsdWRlcyhyZXBvKSkge1xuICAvLyAgICAgICBsZXQgYmFzZSA9IHMubWF0Y2goLyguKj8pKC1bYS1mMC05XXszMn0pP1xcLmNzcyQvKVsxXTtcbiAgLy8gICAgICAgbG9nLmluZm8oJ3NlcnZpbmcgZnJvbSBkZXZlbG9wbWVudDogJywgYmFzZSArICcuY3NzJyk7XG4gIC8vICAgICAgIHMgPSBgaHR0cHM6Ly9sb2NhbGhvc3Q6ODAwMC8ke2Jhc2V9LmNzc2A7XG4gIC8vICAgICB9XG4gIC8vICAgICBlbHNlXG4gIC8vICAgICAgIHMgPSBlbnYuY29udGVudE9yaWdpbiArICcvJyArIHM7XG4gIC8vICAgICByZXR1cm4gZG9tLmNyZWF0ZShgPGxpbmsgcmVsPXN0eWxlc2hlZXQgaHJlZj1cIiR7c31cIj5gKVxuICAvLyAgIH0pO1xuXG4gIC8vICAgLy8gRWRpdG9yLXNpZGUgYXJ0aWNsZSBwcmV2aWV3IHNlbmRzIHN0eWxlIGFzIHdlbGxcbiAgLy8gICBpZiAoYXJ0aWNsZS5hdHRycy5zdHlsZSlcbiAgLy8gICAgIGRvbSgnaGVhZCcpLmFwcGVuZChgPHN0eWxlPiR7YXJ0aWNsZS5hdHRycy5zdHlsZX08L3N0eWxlPmApO1xuXG4gIC8vICAgcmV0dXJuIFByb21pc2UuYWxsKGpzLmNvbmNhdChjc3MpLm1hcChlbCA9PiB7XG4gIC8vICAgICBkb20uYXBwZW5kKGRvY3VtZW50LmhlYWQsIGVsKTtcbiAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gIC8vICAgICAgIGVsLm9ubG9hZCA9IHJlc29sdmU7XG4gIC8vICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgMzAwMCk7XG4gIC8vICAgICB9KVxuICAvLyAgIH0pKTtcbiAgLy8gfVxuXG4iXX0=
