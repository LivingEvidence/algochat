<template>
  <div class="section-label">{{ data.label }}</div>
</template>
<script setup>
defineProps(['data'])
</script>
<style scoped>
.section-label {
  width: 100%;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  padding: 2px 4px;
}
</style>
