export class OneDimensional {
  k: number
  b: number
  /** 一维数据映射器 */
  constructor(from: [number, number], to: [number, number] = [0, 1]) {
    const d = from[1] - from[0]
    this.k = (to[1] - to[0]) / d
    this.b = (to[0] * from[1] - to[1] * from[0]) / d
  }
  /** 从from映射到to */
  forward(x: number) {
    return this.k * x + this.b
  }
  /** 从to映射到from */
  backward(y: number) {
    return (y - this.b) / this.k
  }
}

export class TwoDimensional {
  xMap: OneDimensional
  yMap: OneDimensional
  /** 二维数据映射器 */
  constructor(
    from: [[number, number], [number, number]],
    to: [[number, number], [number, number]] = [
      [0, 1],
      [0, 1],
    ]
  ) {
    this.xMap = new OneDimensional(from[0], to[0])
    this.yMap = new OneDimensional(from[1], to[1])
  }
  /** 从from映射到to */
  forward(from: [number, number]) {
    return [this.xMap.forward(from[0]), this.yMap.forward(from[1])]
  }
  /** 从to映射到from */
  backward(to: [number, number]) {
    return [this.xMap.backward(to[0]), this.yMap.backward(to[1])]
  }
}
