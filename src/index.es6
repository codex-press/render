

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

