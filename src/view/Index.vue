<template>
  <div id="map" ref="mapRef"></div>
</template>
<script lang="ts" setup>
import { AresMap } from '@/core/AresMap'
import { onMounted, ref } from 'vue'

const mapRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
  const map = new AresMap(mapRef.value!, { keepContent: true, backgroundColor: '#333333' })
  ;(window as any).map = map
})
</script>
<style lang="less" setup>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
