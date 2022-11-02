import { BasicElement } from '../BasicElement'
import antiShake from '../utils/antiShake'
import { TwoDimensional } from '../utils/dimensionalMapping'
import { CompoundPath, Image as ZImage } from 'zrender'

const MAX = 20037508.34278924
const tileMapping = new TwoDimensional([
  [-MAX, MAX],
  [MAX, -MAX],
])

export interface TileLayerOption {
  /** 最小缩放等级 */
  minZoom: number
  /** 最大缩放等级 */
  maxZoom: number
  url: string
  /** 瓦片服务的子域 */
  subdomains: string
  z: number
}
export class TileLayer extends BasicElement {
  private _option: TileLayerOption = {
    minZoom: 1,
    maxZoom: 18,
    subdomains: '01234567',
    url: 'http://t{s}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=bbcdcab63afc93b01d12978964804731',
    z: 0,
  }
  /** 正在展示的瓦片索引 */
  private _tileIndex = new Map<string, ZImage>()
  constructor(name: string, option: Partial<TileLayerOption>) {
    super(name)
    Object.assign(this._option, option)
    this.onMove = antiShake(this.onMove.bind(this), 100, false)
  }
  /** 缩放后重置瓦片 */
  onZoomEnd() {
    if (!this._map) return
    const map = this._map
    let zoom = Math.round(map.zoom)
    if (zoom < this._option.minZoom) {
      zoom = this._option.minZoom
    } else if (zoom > this._option.maxZoom) {
      zoom = this._option.maxZoom
    }
    /** 瓦片图缩放倍数 */
    const magnification = Math.pow(2, zoom)
    const size = map.size
    const screenLeftBottom = tileMapping
      .forward([-map.root.x / map.root.scaleX, -map.root.y / map.root.scaleY])
      .map(e => Math.floor(e * magnification))
    const screenRightTop = tileMapping
      .forward([(size.x - map.root.x) / map.root.scaleX, (size.y - map.root.y) / map.root.scaleY])
      .map(e => Math.ceil(e * magnification))

    /** 延迟移除旧图 */
    const waitRemove: ZImage[] = []
    this._tileIndex.forEach(image => {
      waitRemove.push(image)
    })
    this._tileIndex.clear()
    if (waitRemove.length > 0) {
      setTimeout(() => {
        waitRemove.forEach((e: ZImage) => {
          this.root.remove(e)
        })
      }, 100)
    }
    this._generateTile(screenLeftBottom, screenRightTop, zoom)
  }
  /** 平移后更新瓦片 */
  onMove() {
    const map = this._map!
    let zoom = Math.round(map.zoom)
    if (zoom < this._option.minZoom) {
      zoom = this._option.minZoom
    } else if (zoom > this._option.maxZoom) {
      zoom = this._option.maxZoom
    }
    /** 瓦片图缩放倍数 */
    const magnification = Math.pow(2, zoom)
    const size = map.size
    const screenLeftBottom = tileMapping
      .forward([-map.root.x / map.root.scaleX, -map.root.y / map.root.scaleY])
      .map(e => Math.floor(e * magnification))
    const screenRightTop = tileMapping
      .forward([(size.x - map.root.x) / map.root.scaleX, (size.y - map.root.y) / map.root.scaleY])
      .map(e => Math.ceil(e * magnification))
    this._tileIndex.forEach((image, key) => {
      const [x, y] = key.split('-').map(e => Number.parseInt(e))
      if (
        x < screenLeftBottom[0] ||
        x > screenRightTop[0] ||
        y < screenLeftBottom[1] ||
        y > screenRightTop[1]
      ) {
        this.root.remove(image)
        this._tileIndex.delete(key)
      }
    })
    this._generateTile(screenLeftBottom, screenRightTop, zoom)
  }
  /**
   * 生成新的瓦片
   * @param min
   * @param max
   * @param zoom 缩放等级
   */
  private _generateTile(min: number[], max: number[], zoom: number) {
    /** 瓦片图缩放倍数 */
    const magnification = Math.pow(2, zoom)
    min[1] = Math.max(0, min[1])
    max[1] = Math.min(magnification, max[1])
    const tileSize = (2 * MAX) / magnification
    const { url, subdomains } = this._option
    // this._tileIndex.forEach((image, key) => {
    //   const [x, y] = key.split('-').map(e => Number.parseInt(e))
    //   if (x < min[0] || x > max[0] || y < min[1] || y > max[1]) {
    //     this.root.remove(image)
    //     this._tileIndex.delete(key)
    //   }
    // })
    /** 添加新的瓦片 */
    for (let y = min[1]; y < max[1]; y++) {
      const _y = MAX - tileSize * y
      for (let x = min[0]; x < max[0]; x++) {
        const key = `${x}-${y}`
        if (!this._tileIndex.has(key)) {
          let _x = x
          while (_x < 0) {
            _x += magnification
          }
          _x = _x % magnification
          const image = new ZImage({
            silent: true,
            x: tileSize * x - MAX,
            y: _y,
            z: this._option.z,
            scaleY: -1,
            style: {
              width: tileSize,
              height: tileSize,
            },
          })
          const _image = new Image()
          _image.crossOrigin = 'anonymous'
          _image.src = url
            .replace('{s}', subdomains[(_x + y) % subdomains.length])
            .replace('{x}', _x.toFixed(0))
            .replace('{y}', y.toFixed(0))
            .replace('{z}', zoom.toFixed(0))
          _image.onload = () => {
            image.attr({
              style: {
                image: _image,
              },
            })
          }
          this.root.add(image)
          this._tileIndex.set(key, image)
        }
      }
    }
  }
}
