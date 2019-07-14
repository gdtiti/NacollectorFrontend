import AppNavbar from '../AppNavbar'

import { Base64 } from 'js-base64'
import TaskItem from './TaskItem'
import TaskManagerLayer from './TaskManagerLayer'
import AppLayer from '../AppLayer';

const TaskController = window.TaskController

window.taskItem = TaskItem

/**
 * 任务
 */
export default class Task {
  public static readonly sel = {
    runtime: '.task-runtime'
  }

  /** 任务列表 */
  public static list: { [key: string]: TaskItem } = {}

  /** 当前显示的任务ID */
  public static currentDisplayedId: string = null

  /** 创建任务 */
  public static createTask(typeName: string, classLabel: string, parmsObj: object): TaskItem {
    let taskId = new Date().getTime().toString()

    // 实例化 TaskItem
    let taskItem = new TaskItem(taskId, typeName, classLabel, parmsObj)
    this.list[taskId] = taskItem

    // 让任务控制器 开始一个执行新任务
    taskItem.show()
    Task.taskManagerLayer.addItem(taskId)
    try {
      TaskController.createTask(taskId, typeName, classLabel, JSON.stringify(parmsObj)).then((callback: any) => {
        // ... 结束加载
      })
    } catch (e) {
      AppLayer.Notify.error('创建任务失败')
      throw e
    }

    return taskItem
  }

  /** 获取任务 */
  public static get(taskId: string): TaskItem {
    if (!this.list.hasOwnProperty(taskId)) { return null }

    return this.list[taskId]
  }

  /** 获取当前显示任务 */
  public static getCurrent(): TaskItem {
    if (!this.get(this.currentDisplayedId)) { return null }

    return this.get(this.currentDisplayedId)
  }

  /** 显示指定任务 */
  public static show(taskId: string) {
    if (!this.get(taskId)) { throw Error(`未找到任务 ${taskId}`) }

    if (this.getCurrent() !== null) { this.hide() }

    let taskObj = this.get(taskId)
    let runtimeSel = this.sel.runtime
    let taskItemSel = taskObj.getSel()

    $(taskItemSel).show()
    $(runtimeSel).show()

    $(runtimeSel).on('scroll', () => {
      taskObj.allowAutoScrollToBottom = false

      let documentheight = $(taskObj.getSel() + ' > .container').innerHeight()

      let totalheight = $(runtimeSel).height() + $(runtimeSel).scrollTop()

      if (documentheight === totalheight) {
        taskObj.allowAutoScrollToBottom = true
      }
    })

    taskObj.setTitle()

    // 显示导航栏控制按钮组
    AppNavbar.BtnBox.getBtnGroup('task-runtime').show()

    this.currentDisplayedId = taskId
  }

  /** 隐藏 */
  public static hide() {
    if (this.currentDisplayedId === null) { throw Error('未显示任何任务') }

    let runtimeSel = this.sel.runtime
    let taskItemSel = Task.getCurrent().getSel()

    $(runtimeSel).hide()
    $(runtimeSel).off('scroll')
    $(taskItemSel).hide()

    this.getCurrent().setOriginalTitle()

    // 隐藏导航栏控制按钮组
    AppNavbar.BtnBox.getBtnGroup('task-runtime').hide()

    this.currentDisplayedId = null
  }

  /** 日志 */
  public static log(taskId: string, text: string, level?: string, timeStamp?: string, textIsBase64?: boolean) {
    if (!this.get(taskId)) { throw Error(`未找到任务 ${taskId}`) }

    if (typeof textIsBase64 === 'boolean' && textIsBase64 === true) { text = Base64.decode(text) }

    this.get(taskId).log(text, level)
  }

  public static taskManagerLayer = TaskManagerLayer // 任务管理器层

  /** 是否有 task 正在运行 */
  public static isTaskRunning() {
    let isTaskRunning = false
    for (let i in Task.list) {
      if (Task.list[i].getIsInProgress()) {
        isTaskRunning = true
        break;
      }
    }
    
    return isTaskRunning
  }
}
