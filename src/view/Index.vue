<template>
  <div id="map" ref="mapRef"></div>
</template>
<script lang="ts" setup>
import { AresMap } from '@/core/AresMap'
import { TileLayer, Boundary } from '@/core/Index'
import { onMounted, ref } from 'vue'
import geo from '@/assets/json/zhejiangcitys.json'
import { Feature } from 'geojson'
let map: AresMap
let tileLayer: TileLayer
let boundary: Boundary
const mapRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
  map = new AresMap(mapRef.value!)
  ;(window as any).map = map
  tileLayer = new TileLayer('瓦片图', {
    maxZoom: 18,
    minZoom: 7,
    url: 'http://t{s}.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=5bf7a836480dc4f84c923a55ba20bbb0',
  })
  boundary = new Boundary('边界', {
    lineColor: '#ff0',
    lineWidth: 2,
    style: (feature: Feature) => {
      return { color: feature.properties!.color, z: feature.properties!.z }
    },
  })
  boundary.setData(geo as any)
  tileLayer.addTo(map)
  boundary.addTo(map)
})
</script>
<style lang="less" setup>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
