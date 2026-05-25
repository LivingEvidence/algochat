<template>
  <div class="app">
    <!-- Top navigation bar -->
    <header class="topbar">
      <div class="topbar-left">
        <span class="logo-text">mCRPC</span>
        <span class="logo-sub">Treatment Decision Guide</span>
      </div>
      <nav class="topbar-nav">
        <button v-if="currentView !== 'landing'" class="nav-btn" @click="goHome">
          ← All Pathways
        </button>
        <span v-if="currentView === 'detail'" class="breadcrumb">
          {{ selectedTreatment?.label }}
        </span>
        <button
          class="nav-btn"
          :class="{ active: currentView === 'tri' }"
          @click="currentView = currentView === 'tri' ? 'landing' : 'tri'"
        >
          All Pathways
        </button>
        <button
          class="nav-btn overview-btn"
          :class="{ active: currentView === 'overview' }"
          @click="toggleOverview"
        >
          Classic View
        </button>
      </nav>
    </header>

    <!-- Landing: choose prior treatment -->
    <main v-if="currentView === 'landing'" class="landing">
      <div class="landing-intro">
        <h2>Select Prior Treatment</h2>
        <p>Choose the patient's prior treatment history to view the corresponding second-line guideline.</p>
      </div>
      <div class="treatment-cards">
        <button
          v-for="t in PRIOR_TREATMENTS"
          :key="t.id"
          class="treatment-card"
          @click="selectTreatment(t)"
        >
          <div class="card-icon">Rx</div>
          <div class="card-label">{{ t.label }}</div>
          <div class="card-arrow">→</div>
        </button>
      </div>
      <div class="landing-footer">
        <button class="overview-cta" @click="currentView = 'tri'">
          View interactive pathway map →
        </button>
      </div>
    </main>

    <!-- Detail view: single pathway flowchart -->
    <DetailView
      v-else-if="currentView === 'detail'"
      :guideline-id="selectedTreatment.id"
      class="main-content"
    />

    <!-- Tri-column interactive view -->
    <TriColumnView
      v-else-if="currentView === 'tri'"
      class="main-content"
    />

    <!-- Classic overview: all 4 pathways -->
    <OverviewView
      v-else-if="currentView === 'overview'"
      class="main-content"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PRIOR_TREATMENTS } from './data/guidelines.js'
import DetailView from './views/DetailView.vue'
import OverviewView from './views/OverviewView.vue'
import TriColumnView from './views/TriColumnView.vue'

const currentView = ref('landing')
const selectedTreatment = ref(null)

function selectTreatment(t) {
  selectedTreatment.value = t
  currentView.value = 'detail'
}
function goHome() {
  currentView.value = 'landing'
  selectedTreatment.value = null
}
function toggleOverview() {
  currentView.value = currentView.value === 'overview' ? 'landing' : 'overview'
}
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
  padding: 0 24px;
  height: 52px;
  background: #1e3a5f;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.topbar-left { display: flex; align-items: baseline; gap: 10px; }
.logo-text { font-size: 17px; font-weight: 800; letter-spacing: 0.05em; color: #93c5fd; }
.logo-sub { font-size: 13px; color: #94a3b8; font-weight: 400; }
.topbar-nav { display: flex; align-items: center; gap: 10px; }
.nav-btn {
  background: transparent;
  border: 1px solid #475569;
  color: #cbd5e1;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn:hover { background: #2563eb; border-color: #2563eb; color: #fff; }
.nav-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
.breadcrumb { font-size: 13px; color: #93c5fd; font-weight: 600; padding: 0 6px; }

.landing {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;
  padding: 40px 24px;
}
.landing-intro { text-align: center; }
.landing-intro h2 { font-size: 22px; color: #1e3a5f; margin: 0 0 8px; font-weight: 700; }
.landing-intro p { font-size: 14px; color: #64748b; margin: 0; }
.treatment-cards { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; }
.treatment-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 28px 24px 20px;
  width: 190px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.treatment-card:hover {
  border-color: #2563eb;
  box-shadow: 0 6px 20px rgba(37,99,235,0.15);
  transform: translateY(-2px);
}
.card-icon {
  width: 44px; height: 44px;
  background: #c8956c;
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.card-label { font-size: 14px; font-weight: 600; color: #1e3a5f; text-align: center; line-height: 1.4; }
.card-arrow { font-size: 18px; color: #93c5fd; }
.landing-footer { margin-top: 8px; }
.overview-cta {
  background: transparent;
  border: 1.5px solid #2563eb;
  color: #2563eb;
  padding: 9px 22px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.overview-cta:hover { background: #2563eb; color: #fff; }
.main-content { flex: 1; overflow: hidden; display: flex; }
</style>
