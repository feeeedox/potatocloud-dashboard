<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const { screens, loading, error, fetchScreens } = useScreens()
const selectedScreen = ref<string | null>(null)

onMounted(() => {
  fetchScreens()
})

function selectScreen(screenName: string) {
  selectedScreen.value = screenName
}
</script>

<template>
  <div class="screen-page">
    <div class="sidebar">
      <h2>Available Screens</h2>

      <div v-if="loading" class="loading">
        Loading screens...
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="screens" class="screen-list">
        <button
          v-for="screen in screens.screens"
          :key="screen.name"
          :class="[{ active: selectedScreen === screen.name }]" class="screen-item"
          @click="selectScreen(screen.name)"
        >
          <span class="screen-name">{{ screen.name }}</span>
          <span class="log-count">{{ screen.logCount }} logs</span>
        </button>
      </div>

      <button class="refresh-btn" @click="fetchScreens">
        ↻ Refresh
      </button>
    </div>

    <div class="console-container">
      <div v-if="!selectedScreen" class="no-selection">
        <p>Select a screen to view logs</p>
      </div>

      <ServicesConsole
        v-else
        :key="selectedScreen"
        :screen-name="selectedScreen"
      />
    </div>
  </div>
</template>

<style scoped>
.screen-page {
  display: flex;
  height: 100vh;
  background: #0a0a0a;
  color: #eee;
}

.sidebar {
  width: 280px;
  background: #111;
  border-right: 1px solid #333;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.loading,
.error {
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

.loading {
  background: #1a1a1a;
  color: #aaa;
}

.error {
  background: #3b0000;
  color: #f88;
}

.screen-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
}

.screen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #eee;
  text-align: left;
}

.screen-item:hover {
  background: #222;
  border-color: #3a3a3a;
}

.screen-item.active {
  background: #1e40af;
  border-color: #2563eb;
}

.screen-name {
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
}

.log-count {
  font-size: 11px;
  color: #888;
  background: #0a0a0a;
  padding: 2px 6px;
  border-radius: 4px;
}

.screen-item.active .log-count {
  background: #1e3a8a;
  color: #bfdbfe;
}

.refresh-btn {
  padding: 10px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  color: #eee;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.refresh-btn:hover {
  background: #222;
  border-color: #3a3a3a;
}

.console-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 16px;
}

.no-selection p {
  margin: 0;
}
</style>
