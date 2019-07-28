/**
 * Created by qwqcode on 2017/7/15.
 * https://github.com/qwqcode/Nacollector
 */

import App, { init as CompInit } from './components/index'

CompInit()

const AppWrapEl = window.AppWrapEl = $('.wrap')

/**
 * 页面初始化
 */
$(document).ready(() => {
  // 初始化 NavBar
  App.AppNavbar.init()

  // 初始化 Tooltip
  $('[data-toggle="tooltip"]').tooltip()

  // 浏览器初始化时白色闪光 减少违和感
  setTimeout(() => {
    $('body').css('opacity', '1')
    $(AppWrapEl).css('opacity', '1')
  }, 10)

  // 任务生成器初始化
  App.TaskGen.init()

  // 任务管理器层初始化
  App.Task.taskManagerLayer.init()

  // 点击操作按钮列表第一个
  $(App.TaskGen.sel.formToggleBtns + ' a:nth-child(1)').click()

  // 下载面板初始化
  App.Downloads.init()

  // 设置初始化
  App.Setting.init()

  // 设置程序当前版本号
  App.AppAction.tryGetVersion((version: string) => {
    if (typeof (version) !== 'undefined') {
      App.AppAction.version = version
    }
  })

  // 更新模块初始化
  App.AppUpdate.init()

  // 打开 开发者工具
  $(document).keydown((e) => {
    if (e.altKey && e.keyCode === 123) {
      App.AppAction.showDevTools()
    }
  })

  initMarked()
})

// 根据 URL 创建一个下载任务
window.downloadFile = (srcUrl: string) => {
  App.AppAction.downloadUrl(srcUrl)
}

/**
 * 扩展函数
 */
$.extend({
  getPosition: ($element: JQuery) => {
    let el = $element[0]
    let isBody = el.tagName === 'BODY'

    let elRect = el.getBoundingClientRect()
    if (elRect.width === null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    let isSvg = SVGElement && el instanceof SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    let elOffset = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    let scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    let outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }
})

function initMarked () {
  const marked = require('marked')
  let renderer = new marked.Renderer()
  const linkRenderer = renderer.link
  renderer.link = function (href: any, title: any, text: any): string {
    const html = linkRenderer.call(renderer, href, title, text)
    return html.replace(/^<a /, '<a target="_blank" ')
  }

  marked.setOptions({
    renderer: renderer,
    pedantic: false,
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: false, // 净化
    smartLists: true,
    smartypants: true,
    xhtml: false
  })

  window.marked = marked
}
