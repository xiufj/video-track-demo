import React, { useCallback, useRef, useState } from 'react'
import Store from './store/rootStore'
import { TrackItem } from './types'
import { observer } from 'mobx-react'

import { DragTool } from './components/DragTool'

const App = observer(() => {
  const { appStore } = Store()
  const [dragPoint, setSragPoint] = useState({
    x: 0,
    y: 0
  })
  const trackListContainer = useRef<HTMLDivElement>(null)
  const [dropItemLeft, setDropItemLeft] = useState(0) // 目标left值

  /**
   *  鼠标落点
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // 阻止浏览器默认行为
    event.preventDefault()
    const trackListElement = trackListContainer.current
    const { left } = trackListElement!.getBoundingClientRect()
    const { clientX } = event
    const scrollX = trackListContainer.current!.scrollLeft

    const { x: offsetX } = dragPoint
    const itemLeft = clientX - left + scrollX - offsetX
    setDropItemLeft(itemLeft < 0 ? 0 : itemLeft)
  }
  /**
   * 鼠标按下 开始拖动
   * @param event
   * @param item
   * @param indexP
   * @param indexC
   */
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    item: TrackItem,
    indexP: number,
    indexC: number
  ) => {
    handleClick(indexP, indexC)
    // 计算鼠标相对于元素的偏移量
    const offsetX =
      event.clientX - (event.target as Element).getBoundingClientRect().left
    const offsetY =
      event.clientY - (event.target as Element).getBoundingClientRect().top
    setSragPoint({ x: offsetX, y: offsetY })
  }
  /**
   *鼠标拖拽后松开，设置片段位置
   */
  const handleDrop = (index: number) => {
    appStore.setTrackListItem(dropItemLeft, index)
  }
  /**
   * 片段点击
   */
  const handleClick = (indexP: number, indexC: number) => {
    appStore.setSelectCoordinate(indexP, indexC)
    setDropItemLeft(0)
  }
  // 辅助线
  const auxiliaryLine = () => (
    <div
      className="z-30 w-px absolute -top-5 bottom-0 bg-yellow-400"
      style={{ left: `${dropItemLeft}px` }}
    />
  )
  return (
    <div
      className="m-auto w-full flex justify-center"
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        ref={trackListContainer}
        className="py-1 m-4 relative flex shrink-0 flex-col justify-center w-[1200px] bg-[#121214]  rounded-xl overflow-auto"
      >
        {appStore.trackList.map((item, index) => {
          return (
            <div
              className={[
                'mb-1 mt-1 relative  h-10  w-[4800px]',
                appStore.selectCoordinate.line === index
                  ? 'bg-[#6a6a6a94] '
                  : 'bg-[#27282d] '
              ].join(' ')}
              key={index}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              {item?.list.map((v, i) => {
                return (
                  <div key={i}>
                    {/* 此处是节点长度 */}
                    <div
                      className="text-left text-sm top-0 absolute h-10"
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, v, index, i)}
                      onClick={() => handleClick(index, i)}
                      style={{
                        left: v.left,
                        width: v.width
                      }}
                    >
                      {appStore.selectCoordinate.line === index &&
                        appStore.selectCoordinate.index === i && <DragTool />}
                      <div className="flex flex-col rounded overflow-hidden h-full">
                        <div className="flex items-center text-xs  pl-2 overflow-hidden h-10 leading-6 bg-[#8d2e2e]  text-gray-300 font-bold">
                          <span className="shrink-0 text-center">
                            片段 {index},{i}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
        {dropItemLeft !== 0 && auxiliaryLine()}
      </div>
    </div>
  )
})
export default App
