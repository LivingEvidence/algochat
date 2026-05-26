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

      <nav class="topbar-nav" aria-label="Primary navigation">
        <RouterLink class="nav-btn" :to="{ name: 'all-pathways' }">
          All Pathways
        </RouterLink>
        <RouterLink class="nav-btn overview-btn" :to="{ name: 'classic-overview' }">
          Classic View
        </RouterLink>
      </nav>
    </header>

    <RouterView class="main-content" />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'

const baseUrl = import.meta.env.BASE_URL
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

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-btn:hover,
.nav-btn.router-link-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
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
}
</style>
