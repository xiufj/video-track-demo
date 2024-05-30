import { TrackLineItem, TrackItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

/**
 * 初始化store轨道数据
 */
export const initStore = () => {
  const result: TrackLineItem[] = []
  let prevEnd = 0 // 记录前一个结束值

  for (let i = 0; i < 10; i++) {
    let list = []
    for (let index = 0; index < 13; index++) {
      let start, end, width, left
      if (index === 0) {
        // 第一个元素直接随机生成
        width = Math.floor(Math.random() * (200 - 100 + 1)) + 100
        left = Math.floor(Math.random() * (200 - 100 + 1)) + 100
        start = left
        end = left + width
      } else {
        // 后续元素的起始值必须大于前一个的结束值
        width = Math.floor(Math.random() * (200 - 100 + 1)) + 100
        left = prevEnd + Math.floor(Math.random() * (200 - 100 + 1)) + 100
        start = left
        end = left + width
      }
      list.push({ id: uuidv4(), width, left, start, end })
      prevEnd = end // 更新前一个结束值
    }
    result.push({ list })
  }
  return result
}
// 轨道按起始点排序
export const sortTrackLine = (trackLine: TrackLineItem[]) => {
  return trackLine.map((item) => ({
    ...item,
    list: item.list.sort((a, b) => a.start - b.start)
  }))
}
