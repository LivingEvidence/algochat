<template>
  <div class="app">
    <header class="topbar">
      <div class="topbar-left">
        <img class="logo-icon" :src="`${baseUrl}logo.svg`" alt="" />
        <span class="logo-text">mCRPC Algorithm</span>
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
}

.logo-icon {
  width: 24px;
  height: 24px;
  display: block;
  flex-shrink: 0;
}

.logo-text {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #93c5fd;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 10px;
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
}
</style>
