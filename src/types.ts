// 片段
export type TrackItem = {
  id: string // 片段id
  left: number // 片段左侧距离
  width: number // 片段宽度
  start: number // 片段起始点
  end: number // 片段结束点
}
// 轨道列表
export interface TrackLineItem {
  main?: boolean
  list: TrackItem[]
}
