<template>
  <div class="app">
    <header class="topbar">
      <div class="topbar-left">
        <img class="logo-icon" :src="`${baseUrl}logo.svg`" alt="" />
        <div class="logo-copy">
          <span class="logo-text">
            mCRPC Algorithm
            <span class="logo-badge">Beta</span>
          </span>
          <span class="logo-subtitle">
            Systemic Therapy in Patients With mCRPC: ASCO Living Guideline, Version 2026.1
          </span>
        </div>
      </div>

      <nav class="topbar-tabs" aria-label="Primary navigation">
        <RouterLink v-for="tab in primaryTabs" :key="tab.name" class="topbar-tab" :to="{ name: tab.name }">
          <svg class="topbar-tab-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path :d="tab.icon" />
          </svg>
          <span>{{ tab.label }}</span>
        </RouterLink>
      </nav>
    </header>

    <RouterView class="main-content" />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'

const baseUrl = import.meta.env.BASE_URL

const primaryTabs = [
  {
    name: 'interactive-algorithm',
    label: 'Interactive Algorithm',
    icon: 'M10 2.5a7.5 7.5 0 1 0 7.5 7.5h-2a5.5 5.5 0 1 1-5.5-5.5v-2zM11 3.5v5.5h5.5A5.5 5.5 0 0 0 11 3.5z',
  },
  {
    name: 'classic-overview',
    label: 'Classic View',
    icon: 'M4 4.5A1.5 1.5 0 0 1 5.5 3h9A1.5 1.5 0 0 1 16 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 15.5v-11zm2 2v2h8v-2H6zm0 4v1.5h8v-1.5H6zm0 3.5v1h5v-1H6z',
  },
]
</script>

<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: #f0f4f8; }
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 52px;
  background: #1e3a5f;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.logo-icon {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.28));
}

.logo-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.05;
}

.logo-text {
  display: inline-flex;
  align-items: flex-start;
  min-width: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
}

.logo-badge {
  margin-left: 5px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  transform: translateY(-0.2em);
  white-space: nowrap;
}

.logo-subtitle {
  margin-top: 2px;
  max-width: 680px;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.84);
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.15;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
  white-space: nowrap;
}

.topbar-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 3px;
  border: 1px solid rgba(203, 213, 225, 0.24);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.22);
}

.topbar-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
  min-height: 30px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(226, 232, 240, 0.86);
  font-size: 12.5px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.topbar-tab-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  fill: currentColor;
}

.topbar-tab:hover {
  border-color: rgba(203, 213, 225, 0.34);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.topbar-tab.router-link-active {
  border-color: #cbd5e1;
  background: #fff;
  color: #1e3a5f;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
}

@media (max-width: 640px) {
  .logo-text {
    font-size: 15px;
  }

  .logo-badge {
    font-size: 5.8px;
  }

  .logo-subtitle {
    max-width: 48vw;
    font-size: 7.5px;
  }

  .topbar-tab {
    padding: 6px 9px;
    font-size: 12px;
  }
}
</style>
