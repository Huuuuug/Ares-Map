<template>
  <div ref="mapRef" class="map"></div>
</template>
<script lang="ts" setup>
import { AresMap } from '@/core/AresMap'
import { onMounted, ref } from 'vue'

const mapRef = ref<HTMLDivElement | null>(null)
onMounted(() => {
  const a = new AresMap(mapRef.value!, { keepContent: true, backgroundColor: '#333333' })
})
</script>
