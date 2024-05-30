import { makeAutoObservable } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import { TrackLineItem, TrackItem } from '../types'
import { initStore, sortTrackLine } from '../utils/storeUtils'

export default class Store {
  trackList: TrackLineItem[] = initStore() // 轨道数据
  // 选中元素坐标
  selectCoordinate = {
    line: -1,
    index: -1
  }
  constructor() {
    makeAutoObservable(this)
    makePersistable(this, {
      // mobx数据持久化存储
      name: 'Store',
      properties: ['trackList', 'selectCoordinate'],
      storage: window.localStorage
    })
  }
  /**
   *
   * @param left 距离
   * @param landingIndex 落点轨道的下标
   * @returns
   */
  setTrackListItem(left: number, landingIndex: number) {
    const currentList = this.trackList[this.selectCoordinate.line].list
    const currentItem = currentList[this.selectCoordinate.index]
    const currentStart = left
    const currentEnd = left + currentItem.width
    // 如果落点轨道和当前拖动的不一致
    if (this.selectCoordinate.line !== landingIndex) {
      // 移除当前片段
      currentList.splice(this.selectCoordinate.index, 1)
      this.handleDifferentLine(
        currentItem,
        currentStart,
        currentEnd,
        landingIndex
      )
    } else {
      this.handleSameLine(currentItem, currentStart, currentEnd)
    }
  }

  handleDifferentLine(
    currentItem: TrackItem,
    currentStart: number,
    currentEnd: number,
    landingIndex: number
  ) {
    const landingList = this.trackList[landingIndex].list
    const overlap = landingList.some(
      (sublist) =>
        (sublist.start < currentStart && currentStart < sublist.end) ||
        (sublist.start < currentEnd && currentEnd < sublist.end) ||
        (currentStart < sublist.start && sublist.end < currentEnd)
    )
    // 更新当前片段位置
    currentItem.left = currentStart
    currentItem.start = currentStart
    currentItem.end = currentEnd

    if (overlap) {
      // 重叠时，将当前片段插入目标轨道
      if (!this.trackList[this.selectCoordinate.line].list.length) {
        this.trackList.splice(this.selectCoordinate.line, 1)
      }
      this.trackList.splice(landingIndex, 0, { list: [currentItem] })
    } else {
      // 移动到目标行
      this.trackList[landingIndex].list.push(currentItem)
    }
    this.selectCoordinate = { line: -1, index: -1 }
    this.trackList = sortTrackLine(this.trackList)
  }

  handleSameLine(
    currentItem: TrackItem,
    currentStart: number,
    currentEnd: number
  ) {
    const currentList = this.trackList[this.selectCoordinate.line].list
    // 判断当前片段是否与其他片段有重叠
    const overlap = currentList
      .filter((v, i) => i !== this.selectCoordinate.index)
      .some(
        (sublist) =>
          (sublist.start < currentStart && currentStart < sublist.end) ||
          (sublist.start < currentEnd && currentEnd < sublist.end)
      )

    // 更新当前片段位置
    currentItem.left = currentStart
    currentItem.start = currentStart
    currentItem.end = currentEnd

    if (!overlap) {
      // 移除当前片段
      currentList.splice(this.selectCoordinate.index, 1)
      // 未重叠，将当前片段插入当前轨道
      currentList.splice(this.selectCoordinate.index, 0, currentItem)
    } else {
      // 移除当前片段
      currentList.splice(this.selectCoordinate.index, 1)
      // 重叠时，将当前片段插入当前轨道
      this.trackList.splice(this.selectCoordinate.line, 0, {
        list: [currentItem]
      })
    }
    this.selectCoordinate = { line: -1, index: -1 }
    this.trackList = sortTrackLine(this.trackList)
  }
  // 设置选中片段坐标
  setSelectCoordinate(line: number, index: number) {
    this.selectCoordinate = { line, index }
  }
  // 片段拖动设置位置宽度
  setTrackWith(moveWidth: number, limitData: any, handleType: string) {
    const {
      start: originStart,
      end: originEnd,
      minStart,
      maxStart,
      minEnd,
      maxEnd
    } = limitData
    const { line, index } = this.selectCoordinate
    // 左侧拖拽
    if (handleType === 'left') {
      let newStart = originStart + moveWidth
      if (newStart > maxStart) newStart = maxStart
      if (newStart < minStart) newStart = minStart
      this.trackList[line].list[index].left = newStart
      this.trackList[line].list[index].start = newStart
      this.trackList[line].list[index].width = originEnd - newStart
    } else {
      // 右侧拖拽
      let newEnd = originEnd + moveWidth
      if (newEnd > maxEnd) newEnd = maxEnd
      if (newEnd < minEnd) newEnd = minEnd
      this.trackList[line].list[index].end = newEnd
      this.trackList[line].list[index].width = newEnd - originStart
    }
  }
}
