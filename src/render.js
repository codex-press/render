import { patch, h } from '../lib/snabbdom.js'

// import { contentOrigin } from './env'
const contentOrigin = ''


export function render(article, { findArticles, findMedia }) {
  return renderNode(article.body, { article, findArticles, findMedia })
}

async function renderNode(node, context) {
  switch (node.type) {
    case 'Article': return renderArticle(node, context)
    case 'ArticleEmbed': return await renderArticleEmbed(node, context)
    case 'Block': return await renderBlock(node, context)
    case 'CodeBlock': return renderCodeBlock(node, context)
    case 'SVG': return renderSVG(node, context)
    case 'Image': return renderImage(node, context)
    case 'Video': return await renderVideo(node, context)
    case 'Audio': return await renderAudio(node, context)
    case 'Graf': return renderGraf(node, context)
    case 'Inline': return await renderInline(node, context)
    case 'Text': return node.text
  }
}

async function renderArticle(node, context) {
  const tagName = node.tagName || 'article'
  return h(tagName, await renderChildren(node, context))
}

// <a href=$path><slot name=hed></slot></a>
const defaultTemplate = {
  tagName: 'div',
  nodes: [ {
    tagName: 'a',
    attributes: [ [ '$href', 'full_path' ] ],
    nodes: [ {
      tagName: 'slot',
      attributes: [ [ 'name', 'title' ] ],
    } ]
  } ]
}

function findNodeByUID(uid, tree) {
  if (tree.uid == uid)
    return tree
  else if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeByUID(uid, child)
      if (found) return found
    }
  }
}

function findTemplate(node, { article }) {
  if ('template' in node) {
    return findNodeByUID(node.template, article.body) || defaultTemplate
  }
  // would have something here about making
  return defaultTemplate
}

async function renderArticleEmbed(node, context) {
  const tagName = node.tagName || 'div' 
  const data = await context.findArticles(node.articleID)
  // console.log('--->', JSON.stringify(findTemplate(node, context).ast))
  // return renderTemplate(findTemplate(node, context), data)
  return renderTemplate(defaultTemplate, data)
}

function renderTemplate({ tagName, attributes = [ ], nodes = [ ]}, data) {
  if (tagName === 'slot') {
    const key = attributes.find(([ key ]) => key === 'name')[1]
    if (key in data) return data[key]
  }
  const children = nodes.map(n =>
    typeof n == 'string' ? n : renderTemplate(n, data)
  )
  const attrs = attributes.reduce((attrs, [ key, value ]) => {
    if (key.startsWith('$'))
      attrs[key.slice(1)] = data[ value ]
    else
      attrs[key] = value 
    return attrs
  }, { })
  return h(tagName, { attrs }, children)
}

async function renderBlock(node, context) {
  const tagName = node.tagName || 'div'
  return h(
    tagName,
    { attrs: attrs(node) },
    await renderChildren(node, context)
  )
}

function renderCodeBlock(node, context) {
  const tagName = node.tagName || 'pre'
  return h(tagName, { attrs: attrs(node) }, node.body)
}

function renderSVG(node, context) {
  const tagName = node.tagName || 'div'
  return h(tagName, { props: { innerHTML: node.src } })
}

function renderImage(node, context) {
  const src = '/images/' + node.mediaID + '/i500.jpg'
  return h('img', { attrs: { src } }, [])
}


const typeMap = {
  video: 'video/mp4',
  dash: 'application/dash+xml',
  hls: 'application/vnd.apple.mpegurl',
}

async function renderVideo(node, context) {
  const tagName = node.tagName || 'video' || 'codex-video'
  const media = await context.findMedia(node.mediaID)

  const attrs = {
    'has-audio': media.hasAudio,
    width: media.originalWidth,
    height: media.originalHeight,
  }

  const sourceToTag = s => {
    if ([ 'original', 'image' ].includes(s.type)) return null
    return h('source', { attrs: {
      type: typeMap[ s.type ],
      src: s.path,
    }})
  }

  const posterImage = h('img', { attrs: {
    width: media.originalWidth,
    height: media.originalHeight,
    src: media.base64Thumb,
    srcset: makeSrcSet(media.sources),
    slot: 'cover',
  }})

  console.log(attrs)

  const children = media.sources
    .map(sourceToTag)
    .filter(t => !!t)
    .concat(posterImage)

  return h(tagName, { attrs }, children)
}


function renderAudio(node, context) {
  const tagName = node.tagName || 'cp-audio'
  const sources = JSON.stringify([ ])
  return h(tagName, { attrs: { sources } }, [ ])
  // const media = article.media.find(m => m.id === node.mediaID)
  // const sources = JSON.stringify(media.sources)
  // return h(tagName, { attrs: { sources } }, [])
}

async function renderGraf(node, context) {
  const tagName = node.tagName || 'p'
  return h(tagName, await renderChildren(node, context))
}

async function renderInline(node, context) {
  const tagName = node.tagName || 'span' 
  return h(tagName, await renderChildren(node, context))
}

// helpers

function attrs(node) {
  const attrs = { }
  if (node.classList && node.classList.length)
    attrs.class = node.classList.join(' ')
  if (node.id)
    attrs.id = node.id
  return attrs
}

async function renderChildren(node, context) {
  return await Promise.all(
    node.children.map(async n => await renderNode(n, context))
  )
}



function makeSrcSet(sources) {
  return sources
    .filter(s => s.type === 'image')
    .map(s => `${ contentOrigin + s.path } ${ s.width }w`)
    .join(', ')
}

