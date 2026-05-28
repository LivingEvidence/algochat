<template>
  <div class="bio-question">
    <Handle type="target" :position="Position.Left" />
    <Handle id="bio-question-bottom" type="source" :position="Position.Bottom" />
    <Handle
      v-if="data.showSpecialLink"
      id="bio-question-right"
      type="source"
      :position="Position.Right"
    />
    <p class="question">{{ data.label }}</p>
    <div class="choices">
      <button
        type="button"
        class="choice"
        :class="{ active: data.choice === 'yes' }"
        @click.stop="emit('choose', 'yes')"
      >Yes</button>
      <button
        type="button"
        class="choice"
        :class="{ active: data.choice === 'no' }"
        @click.stop="emit('choose', 'no')"
      >No</button>
    </div>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
const emit = defineEmits(['choose'])
</script>

<style scoped>
.bio-question {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.question {
  margin: 0;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}
.choices {
  display: flex;
  gap: 8px;
}
.choice {
  flex: 1;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #475569;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.choice:hover {
  border-color: #94a3b8;
  background: #f8fafc;
  color: #1e293b;
}
.choice.active {
  border-color: #2d6a4f;
  background: #d1fae5;
  color: #065f46;
}
</style>
