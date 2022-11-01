/**
 * 为目标函数添加防抖
 * @param fun 目标函数
 * @param time 防抖时间间隔
 * @param immediately 是否立刻执行
 * @returns 防抖的目标函数
 */
export default function antiShake<T extends (...args: any) => void>(
  fun: T,
  time = 0,
  immediately = false
): T {
  let handler = 0
  let lock = 0
  if (immediately) {
    return function (...args: any) {
      const now = Date.now()
      if (handler) {
        clearTimeout(handler)
      }
      if (lock < now) {
        fun(...args)
        lock = now + time
      } else {
        handler = window.window.setTimeout(() => {
          handler = 0
          fun(...args)
        }, lock - now)
      }
    } as T
  } else {
    return function (...args: any) {
      const now = Date.now()
      if (handler) {
        clearTimeout(handler)
        handler = window.setTimeout(() => {
          handler = 0
          fun(...args)
        }, lock - now)
      } else {
        lock = now + time
        handler = window.setTimeout(() => {
          handler = 0
          fun(...args)
        }, time)
      }
    } as T
  }
}
