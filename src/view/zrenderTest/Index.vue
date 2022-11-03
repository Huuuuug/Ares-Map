<template>
  <div ref="zrenderRef" class="zrender"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { CompoundPath, init, Polyline, Rect, ZRenderType } from 'zrender'

const zrenderRef = ref<HTMLDivElement | null>(null)

let zr: ZRenderType
onMounted(() => {
  zr = init(zrenderRef.value)
  zr.add(
    new Rect({
      silent: true,
      shape: {
        width: zrenderRef.value?.clientWidth,
        height: zrenderRef.value?.clientHeight,
      },
      style: {
        fill: '#ffffff',
      },
    })
  )
  // zr.add(
  //   new Polyline({
  //     silent: true,
  //     shape: {
  //       points: [
  //         [10, 20],
  //         [20, 40],
  //         [20, 140],
  //         [30, 140],
  //         [40, 440],
  //         [20, 640],
  //       ],
  //     },
  //     style: {
  //       // fill: '#ff0000',
  //       lineWidth: 2,
  //       stroke: '#ff0999',
  //     },
  //   })
  // )
  // zr.add(
  //   new Polyline({
  //     silent: true,
  //     shape: {
  //       points: [
  //         [101, 20],
  //         [201, 40],
  //         [201, 140],
  //         [301, 140],
  //         [401, 440],
  //         [201, 640],
  //       ],
  //     },
  //     style: {
  //       // fill: '#ff0000',
  //       lineWidth: 2,
  //       stroke: '#ff0999',
  //     },
  //   })
  // )
  zr.add(
    new CompoundPath({
      silent: true,
      shape: {
        paths: [
          new Polyline({
            silent: true,
            shape: {
              points: [
                [101, 20],
                [201, 40],
                [201, 140],
                [301, 140],
                [401, 440],
                [201, 640],
              ],
            },
          }),
          new Polyline({
            silent: true,
            shape: {
              points: [
                [10, 20],
                [20, 40],
                [20, 140],
                [30, 140],
                [40, 440],
                [20, 640],
              ],
            },
          }),
        ],
      },
      style: {
        // fill: '#ff0000',
        lineWidth: 4,
        stroke: '#ff0',
      },
    })
  )
})
</script>
<style>
.zrender {
  width: 100vw;
  height: 100vh;
}
</style>
