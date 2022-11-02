import { Circle, ElementEvent, Group, init, Rect, ZRenderType } from 'zrender'
import { BasicElement } from './BasicElement'
import { Projection } from './tools/Projection'

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
    center: [120, 30],
    zoom: 7,
    zoomDelta: 0.5,
    zoomDuring: 300,
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
  /** 地图内部元素集合 */
  readonly elements = new Map<string, BasicElement>()
  /** zrender实例 */
  public zr: ZRenderType

  /** 画布尺寸 */
  get size() {
    return { x: this.zr.dom!.offsetWidth, y: this.zr.dom!.offsetHeight }
  }
  /** 地图缩放等级 */
  get zoom() {
    return Math.log2(this.root.scaleX / Projection.SCALE_UNIT)
  }
  get show() {
    return this._option.show
  }
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
    this.setView(this._option.center[0], this._option.center[1], this._option.zoom)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    if (this._option.moveable) {
      this.zr.on('mousedown', this._onMouseDown, this)
    }
    if (this._option.zoomable) {
      this.zr.on('mousewheel', this._onMouseWheel, this)
    }
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
  /** 鼠标按下 */
  private _onMouseDown(e: ElementEvent) {
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }
  private _onMouseWheel(e: ElementEvent) {
    this.handleMouseWheel(e)
  }
  /**
   * 设置当前视图
   * @param lon 中心经度
   * @param lat 中心纬度
   * @param zoom 缩放等级,默认：当前等级
   */
  setView(lon: number, lat: number, zoom: number = this.zoom) {
    const scale = Projection.SCALE_UNIT * Math.pow(2, zoom)
    const x = Projection.lonToMercatorX(lon)
    const y = Projection.latToMercatorY(lat)
    const { size } = this

    this.root.attr({
      x: size.x / 2 - x * scale,
      y: size.y / 2 + y * scale,
      scaleX: scale,
      scaleY: -scale,
    })
  }
  /**
   * 地图添加指定元素
   * @param ele
   */
  add(ele: BasicElement) {
    if (!this.elements.has(ele.name)) {
      this.elements.set(ele.name, ele)
      this.root.add(ele.root)
      ele.addTo(this)
    } else {
      if (this.elements.get(ele.name) != ele) {
        throw new Error(`已存在同名要素`)
      }
    }
  }
  /**
   * 地图删除指定元素
   * @param name
   * @returns
   */
  delete(name: string) {
    const ele = this.elements.get(name)
    if (!ele) return
    this.elements.delete(name)
    this.root.remove(ele.root)
    ele.remove()
  }
  /**
   * 鼠标移动 动态修改地图内所有元素
   * @param e
   */
  handleMouseMove(e: MouseEvent) {
    if (Number.isFinite(e.movementX) && Number.isFinite(e.movementY)) {
      this.root.attr({
        x: this.root.x + e.movementX,
        y: this.root.y + e.movementY,
      })
      this.elements.forEach((ele: BasicElement) => ele.onMove())
    }
  }
  handleMouseUp() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }
  handleMouseWheel(e: ElementEvent) {
    let delta = e.wheelDelta * this._option.zoomDelta
    const { zoom } = this
    delta = Math.min(this._option.maxZoomLevel, Math.max(this._option.minZoomLevel - zoom, delta))
    if (!delta) return
    /** 瓦片图缩放倍数 */
    const magnification = Math.pow(2, delta)
    this.elements.forEach((e: BasicElement) => {
      e.onZoomStart && e.onZoomStart()
    })
    this.root
      .animate('', false)
      .when(this._option.zoomDuring, {
        x: e.offsetX + (this.root.x - e.offsetX) * magnification,
        y: e.offsetY + (this.root.y - e.offsetY) * magnification,
        scaleX: this.root.scaleX * magnification,
        scaleY: this.root.scaleY * magnification,
      })
      .start()
      .done(() => {
        this.elements.forEach((e: BasicElement) => {
          e.onZoomEnd && e.onZoomEnd()
        })
      })
  }
}
