export interface CoordinateObject {
  x: number
  y: number
}
type Coordinate = Array<number> | CoordinateObject

export class Point {
  private x: number
  private y: number
  /** 点 */
  constructor(coordinate: Coordinate) {
    if (Array.isArray(coordinate)) {
      this.x = coordinate[0]
      this.y = coordinate[1]
    } else {
      this.x = coordinate.x
      this.y = coordinate.y
    }
  }

  set(coordinate: Array<number> | Coordinate) {
    if (Array.isArray(coordinate)) {
      this.x = coordinate[0]
      this.y = coordinate[1]
    } else {
      this.x = coordinate.x
      this.y = coordinate.y
    }
    return this
  }

  add(coordinate: CoordinateObject) {
    this.x += coordinate.x
    this.y += coordinate.y
    return this
  }
}
