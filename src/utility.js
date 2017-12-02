
export function unscopeLinks(html, pathPrefix, origin) {

  let hrefRE = /<a[^>]* href="?([^" >]*?)[" >]/g;
  let newHTML = html.replace(hrefRE, (string, url) => {

    // if it's an absolute path, fix the path
    if (url.startsWith('/'))
      return string.replace(url, unscopedPath(pathPrefix, url, origin));
    // these are external links
    else
      return string.replace('<a ', '<a target=_blank ');

  });

  // must add rel=noopener so that when you hit command to open in a new
  // window it works. totally weird
  return newHTML.replace(/<a /g, '<a rel=noopener ');
};


// Scoped Path
//   change from /xela to /nimble/xela (per origin domain)
//   used to turn links suitable for fetching from server
//   call with no args for current location
export function scopedPath(pathPrefix, path) {
  if (!path && typeof location !== undefined)
    path = location.pathname;
  path = pathPrefix + path;
  if (path.length > 1)
    path = path.replace(/\/$/,'')
  return path;
}


// Unscoped Path
//   for example, on the nimble.ink, changes it from /nimble/xela to /xela
//   and /nimble to /
//   and things like /alice to codex.press/alice
//   it's used in the Grafs and Indexes etc to fix links
export function unscopedPath(pathPrefix, path, origin) {

  if (!pathPrefix)
    return origin + path;
  else if (path.startsWith(pathPrefix)) {
    path = path.slice(pathPrefix.length)
    return origin + (path.length > 0 ? path : '/');
  }
  else
    return 'https://codex.press' + path;

}


export function addStylesheet(url, attrs = {}) {
  return new Promise((resolve, reject) => {
    let tag = document.createElement('link');
    tag.setAttribute('rel', 'stylesheet');
    Object.keys(attrs).map(k => tag.setAttribute(k, attrs[k]));
    tag.href = url;
    document.head.appendChild(tag);
    tag.onload = resolve;
    tag.onerror = reject;
  });
}


export function addScript(url, attrs = {}) {
  return new Promise((resolve, reject) => {
    let tag = document.createElement('script');
    Object.keys(attrs).map(k => tag.setAttribute(k, attrs[k]));
    tag.src = url;
    tag.async = false;
    document.head.appendChild(tag);
    tag.onload = resolve;
    tag.onerror = reject;
  });
}


export function camelize(obj) {

  const isScalar = (
    !obj ||
    typeof obj !== 'object' ||
    '[object RegExp]' == Object.prototype.toString.call(obj) ||
    '[object Date]' == Object.prototype.toString.call(obj)
  )

  if (isScalar)
    return obj
  else if (Array.isArray(obj))
    return obj.map(camelize)
  else
    return Object.keys(obj).reduce((acc, key) => {
      acc[ camelCase(key) ] = camelize(obj[key])
      return acc
    }, { })
}


export function camelCase(string) {
  return string
    .replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase())
    .replace('Url','URL')
    .replace('Id','ID')
    .replace('Html','HTML')
}


