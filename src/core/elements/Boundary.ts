import { BasicElement } from '../BasicElement'
import { Feature, GeoJSON } from 'geojson'
import { CompoundPath, Polyline } from 'zrender'
import { Projection } from '../tools/Projection'

export interface BoundaryStyle {
  /** 线的颜色 */
  color: string
  /** 同一geojson文件下 层级 */
  z: number
}

export interface BoundaryOption {
  minZoomLevel: number
  maxZoomLevel: number
  lineColor: string
  lineWidth: number
  geo?: GeoJSON
  style?: (feature: Feature) => Partial<BoundaryStyle>
}

export class Boundary extends BasicElement {
  private _option: BoundaryOption = {
    minZoomLevel: 0,
    maxZoomLevel: 18,
    lineColor: '#000000',
    lineWidth: 2,
  }
  /** 复合路径 */
  private _compoundPathGroup: Map<string, CompoundPath> = new Map()
  /** 边界元素 */
  constructor(name: string, option: Partial<BoundaryOption> = {}) {
    super(name)
    Object.assign(this._option, option)
    if (this._option.geo) {
      this._draw(this._option.geo)
    }
  }
  /**
   * 绘制边界
   */
  private _draw(geo: GeoJSON) {
    switch (geo.type) {
      case 'FeatureCollection':
        geo.features.map((feature: Feature) => {
          const paths: Polyline[] = []
          let lineColor = this._option.lineColor
          let lineZ = 10
          if (this._option.style) {
            const { color, z } = this._option.style!(feature)
            color && (lineColor = color)
            z && (lineZ += z)
          }
          const compoundpath = new CompoundPath({
            silent: true,
            z: lineZ,
            shape: {
              paths: [],
            },
            style: {
              fill: 'none',
              lineWidth: this._option.lineWidth,
              stroke: lineColor,
              strokeNoScale: true,
            },
          })
          switch (feature.geometry.type) {
            case 'MultiPolygon':
              feature.geometry.coordinates.forEach(lines => {
                lines.forEach(line => {
                  paths.push(
                    new Polyline({
                      shape: {
                        points: line.map(point => [
                          Projection.lonToMercatorX(point[0]),
                          Projection.latToMercatorY(point[1]),
                        ]),
                      },
                    })
                  )
                })
              })
              break
            case 'Polygon':
              feature.geometry.coordinates.forEach(line => {
                paths.push(
                  new Polyline({
                    shape: {
                      points: line.map(point => [
                        Projection.lonToMercatorX(point[0]),
                        Projection.latToMercatorY(point[1]),
                      ]),
                    },
                  })
                )
              })
              break
            default:
              throw new Error(`TODO ${feature.geometry.type}`)
          }
          compoundpath.attr({
            shape: {
              paths,
            },
          })
          this._compoundPathGroup.set(feature.properties!.name, compoundpath)
        })
        this._compoundPathGroup.forEach((path: CompoundPath) => {
          this.root.add(path)
        })
        break
      default:
        throw new Error(`TODO ${geo.type}`)
    }
  }
  /**
   * 设置Geo数据
   * @param geo
   */
  setData(geo: GeoJSON) {
    this.root.removeAll()
    this._compoundPathGroup.clear()
    this._draw(geo)
  }
  /** 缩放时线宽随缩放系数改变 */
  onZoomEnd() {
    const zoom = this._map!.zoom
    if (zoom < this._option.minZoomLevel || zoom > this._option.maxZoomLevel) {
      this.root.eachChild(e => {
        const path = e as CompoundPath
        path.hide()
      })
    } else {
      this.root.eachChild((e, i) => {
        const path = e as CompoundPath
        path.show()
        path.attr({
          style: {
            // lineWidth: this._option.lineWidth / this._map!.root.scaleX,
          },
        })
      })
    }
  }
}
