<template>
  <div class="grp-container" :style="{ borderColor: data.color }">
    <div class="grp-header" :style="{ background: data.color }">
      <span class="grp-num">{{ data.num }}</span>
      {{ data.label }}
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps(['data'])
</script>

<style scoped>
.grp-container {
  width: 100%; height: 100%;
  border: 2px solid;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.grp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.grp-num {
  font-size: 16px;
  line-height: 1;
}
</style>
