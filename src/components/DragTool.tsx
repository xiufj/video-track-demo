import Store from '../store/rootStore'
import { TrackItem } from '../types'

export const DragTool = () => {
  const { appStore } = Store()

  // 定位数据缓存
  let positionLeft = 0
  // 可操作的范围
  let limitData = {
    start: 0,
    end: 0,
    minStart: 0,
    maxStart: 0,
    minEnd: 0,
    maxEnd: 0
  }
  // 计算限制范围
  const initLimits = (lineData: TrackItem[], trackItem: TrackItem) => {
    const { index } = appStore.selectCoordinate
    const beforeTrack = index > 0 ? lineData[index - 1] : null
    const afterTrack = index < lineData.length ? lineData[index + 1] : null
    const data = {
      start: trackItem.start,
      end: trackItem.end,
      minStart: beforeTrack ? beforeTrack.end : 0, // 可以调节的最小start
      maxStart: trackItem.end - 10,
      minEnd: trackItem.start + 10,
      maxEnd: afterTrack ? afterTrack.start : 4800 // 可以调节的最大end
    }
    Object.assign(limitData, {
      ...data
    })
  }
  const mouseDownHandler = (
    event: React.MouseEvent<HTMLDivElement>,
    type: string
  ) => {
    event.preventDefault()
    event.stopPropagation()
    const { pageX: startX } = event
    positionLeft = startX
    const { line, index } = appStore.selectCoordinate
    initLimits(
      appStore.trackList[line]?.list || [],
      appStore.trackList[line]?.list?.[index]
    )
    document.onmousemove = (documentEvent) => {
      const { pageX } = documentEvent
      const moveWidth = pageX - positionLeft
      appStore.setTrackWith(moveWidth, limitData, type)
    }

    document.onmouseup = () => {
      document.onmouseup = null
      document.onmousemove = null
    }
  }
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 border-2 border-[#0095aa] rounded">
      <div
        onMouseDown={(e) => mouseDownHandler(e, 'left')}
        className="cursor-col-resize flex justify-center  absolute bottom-2 top-2  text-center rounded-tr rounded-br w-[6px]   bg-[#0095aa] text-black"
      >
        <span className="text-[10px] font-bold">|</span>
      </div>
      <div
        onMouseDown={(e) => mouseDownHandler(e, 'right')}
        className="cursor-col-resize flex justify-center  absolute bottom-2 top-2 right-0 text-center rounded-tl rounded-bl w-[6px]   bg-[#0095aa] text-black"
      >
        <span className="text-[10px] font-bold">|</span>
      </div>
    </div>
  )
}
