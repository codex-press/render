
export const unscopeLinks = function unscopeLinks(html, pathPrefix) {
  let hrefRE = /<a[^>]* href="?([^" >]*?)[" >]/g;
  let newHTML = html.replace(hrefRE, (string, url) => {
    // if it's an absolute path, fix the path
    if (/^\//.test(url))
      return string.replace(url, unscopedPath(pathPrefix, url));
    else
      return string;
  });

  // must add rel=noopener so that when you hit command to open in a new
  // window it works. totally weird
  return newHTML.replace(/<a /g, '<a rel=noopener ');
};


// Scoped Path
//   change from /xela to /nimble/xela (per origin domain)
//   used to turn links suitable for fetching from server
//   call with no args for current location
export const scopedPath = function scopedPath(pathPrefix, path) {
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
export const unscopedPath = function unscopedPath(pathPrefix, path) {
  if (!pathPrefix)
    return path;
  var regex = new RegExp('^' + pathPrefix);
  if (regex.test(path)) {
    path = path.replace(regex,'');
    return path ? path : '/';
  }
  else
    return 'https://codex.press' + path;
}


