<template>
  <section class="classic-shell">
    <div class="classic-nav">
      <div class="classic-nav-title">
        <span class="classic-kicker">Classic View</span>
        <strong>Reference pathways</strong>
      </div>

      <nav class="classic-tabs" aria-label="Classic view modes">
        <RouterLink class="classic-tab" :to="{ name: 'classic-overview' }">
          Overview
        </RouterLink>
        <RouterLink
          v-for="t in PRIOR_TREATMENTS"
          :key="t.id"
          class="classic-tab"
          :to="{ name: 'classic-pathway', params: { guidelineId: t.id } }"
        >
          {{ t.shortLabel }}
        </RouterLink>
      </nav>
    </div>

    <RouterView class="classic-content" />
  </section>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { PRIOR_TREATMENTS } from '../data/guidelines.js'
</script>

<style scoped>
.classic-shell {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.classic-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 22px;
  background: #f8fafc;
  border-bottom: 1px solid #dbe4ee;
  flex-shrink: 0;
}

.classic-nav-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
  color: #1e3a5f;
}

.classic-kicker {
  font-size: 10px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.classic-nav-title strong {
  font-size: 13px;
}

.classic-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
}

.classic-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  color: #475569;
  background: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.classic-tab:hover,
.classic-tab.router-link-active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.classic-content {
  flex: 1;
  min-height: 0;
}

@media (max-width: 760px) {
  .classic-nav {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .classic-nav-title {
    min-width: 0;
  }
}
</style>
