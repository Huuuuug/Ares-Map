<template>
  <div id="map" ref="mapRef"></div>
</template>
<script lang="ts" setup>
import { AresMap } from '@/core/AresMap'
import { TileLayer } from '@/core/Index'
import { onMounted, ref } from 'vue'
let map: AresMap
let tileLayer: TileLayer
const mapRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
  map = new AresMap(mapRef.value!, { keepContent: true, backgroundColor: '#333333' })
  ;(window as any).map = map
  tileLayer = new TileLayer('瓦片图', { maxZoom: 18, minZoom: 7 })
  tileLayer.addTo(map)
})
</script>
<style lang="less" setup>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
