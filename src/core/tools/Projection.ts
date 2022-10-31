const R = 6378137
const D = Math.PI / 180
const RD = R * D
const r = R / 2

export abstract class Projection {
  /** 缩放等级为0时缩放系数 */
  static SCALE_UNIT = 128 / (R * Math.PI)
  /** 墨卡托横坐标转经度 */
  static mercatorXToLon(x: number) {
    return x / RD
  }
  /** 墨卡托纵坐标转纬度 */
  static mercatoYToLat(y: number) {
    return (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) / D
  }
  /** 经度转墨卡托横坐标 */
  static lonToMercatorX(lon: number) {
    return RD * lon
  }
  /** 纬度转墨卡托纵坐标 */
  static latToMercatorY(lat: number) {
    const sin = Math.sin(lat * D)
    return r * Math.log((1 + sin) / (1 - sin))
  }
}
