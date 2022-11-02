import { ElementEvent } from 'zrender'
import { AresMap } from '../AresMap'

export class MapEvent {
  readonly maps: AresMap[] = []
  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
  }
  onMouseMove(e: MouseEvent) {
    this.maps.forEach(map => {
      map.handleMouseMove(e)
    })
  }
  onMouseUp() {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
    this.maps.forEach(map => {
      map.handleMouseUp()
    })
  }
  onMouseWheel(e: ElementEvent) {
    this.maps.forEach(map => {
      map.handleMouseWheel(e)
    })
  }
  /** 添加地图对象 */
  // add(map: AresMap) {
  //   if (this.maps.includes(map)) {
  //     return
  //   }
  //   this.maps.push(map)
  //   map.addTo(this)
  // }
  // /** 移除地图对象 */
  // remove(map: AresMap) {
  //   if (this.maps.includes(map)) {
  //     this.maps.splice(this.maps.indexOf(map), 1)
  //     map.remove()
  //   }
  // }
  // clear() {
  //   while (this.maps.length > 0) {
  //     const map = this.maps.pop()
  //     map!.remove()
  //   }
  // }
}
