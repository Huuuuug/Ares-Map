import { Group, init, Rect, ZRenderType } from 'zrender'

export interface AresMapOption {
  show: boolean
  /** 地图初始中心坐标 默认:[130,20] */
  center: [number, number]
  /** 地图初始缩放等级：默认：7 */
  zoom: number
  /** 缩放间隔 默认：1 */
  zoomDelta: number
  /** 缩进动画时间(毫秒) 默认：200*/
  zoomDuring: number
  /** 最小缩放等级 */
  minZoomLevel: number
  /** 最大缩放等级 */
  maxZoomLevel: number
  /** 屏幕像素比 */
  dpi: number
  /** 背景色 */
  backgroundColor: string
  /** 保留内部元素 */
  keepContent: boolean
  /** 是否可平移 */
  moveable: boolean
  /** 是否可缩放 */
  zoomable: boolean
}
export class AresMap {
  private _option: AresMapOption = {
    show: true,
    center: [130, 20],
    zoom: 7,
    zoomDelta: 1,
    zoomDuring: 200,
    minZoomLevel: 3,
    maxZoomLevel: 18,
    dpi: window.devicePixelRatio,
    backgroundColor: '',
    keepContent: false,
    moveable: true,
    zoomable: true,
  }
  /** 全局根节点，通过平移缩放将内部坐标转化为伪墨卡托坐标  */
  readonly root: Group = new Group()
  /** zrender实例 */
  public zr: ZRenderType
  constructor(dom: HTMLDivElement, option: Partial<AresMapOption> = {}) {
    Object.assign(this._option, option)

    if (this._option.keepContent) {
      this._replaceReservedElements(dom)
    }
    /** 初始化zrender画布 */
    this.zr = init(dom, {
      devicePixelRatio: this._option.dpi,
    })
    if (this._option.backgroundColor) {
      this.zr.add(
        new Rect({
          silent: true,
          shape: {
            width: dom.offsetWidth,
            height: dom.clientHeight,
          },
          style: {
            fill: this._option.backgroundColor,
          },
        })
      )
    }
    this.zr.add(this.root)
    ;(window as any).zr = this.zr
  }

  /** 替换dom中保留的元素 */
  private _replaceReservedElements(dom: HTMLDivElement) {
    const _temp = []
    let element = dom.children.item(0)
    while (element) {
      _temp.push(element)
      element.remove()
      element = dom.children.item(0)
    }
    _temp.forEach(e => {
      dom.appendChild(e)
    })
  }
  setView(lon: number, lat: number, zoom: number) {}
}
