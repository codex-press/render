import { render } from './render'

let vnode = document.createElement('article')
document.body.appendChild(vnode)

window.addEventListener('message', e => {
  if (e.data.event != 'data') return
  // console.log('message', e.data.args)
  vnode = patch(vnode, render(e.data.args))
})

