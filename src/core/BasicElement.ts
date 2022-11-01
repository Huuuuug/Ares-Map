import { Group } from 'zrender'
import { AresMap } from './AresMap'

export abstract class BasicElement {
  /** 元素名,元素的唯一标识 */
  readonly name: string
  /** 内部图元根节点 */
  readonly root = new Group()
  /** 地图实例 */
  protected _map?: AresMap
  /** 是否显示 */
  get show() {
    return !this.root.ignore
  }
  set show(val) {
    if (val === this.show) return
    if (val) {
      this.root.show()
      this.onZoomEnd()
    } else {
      this.root.hide()
    }
  }
  constructor(name: string) {
    this.name = name
  }
  /**
   * 将元素添加到地图
   * @param map
   * @returns
   */
  addTo(map: AresMap) {
    if (map === this._map) return this
    if (this._map) throw new Error('该元素已被其他地图实例占用')
    this._map = map
    this._map.add(this)
    this.onZoomEnd()
    return this
  }
  /** 将元素从地图移除 */
  remove() {
    if (!this._map) return
    this._map.delete(this.name)
    this._map = undefined
    return this
  }

  /** 地图平移时的回调 */
  onMove() {}
  /** 地图平移结束时的回调 */
  onMoveEnd() {}
  /** 地图缩放开始时的回调 */
  onZoomStart() {}
  /** 地图缩放结束时的回调 */
  onZoomEnd() {}
}
