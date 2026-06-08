<script lang="ts" setup>
import { useJoinStats } from '#imports';

const { chartData, pending, refresh } = useJoinStats()
</script>

<template>
  <div>
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <button
        :disabled="pending"
        style="margin-left: auto; font-size: 12px; opacity: 0.6; cursor: pointer;"
        @click="refresh"
      >
        {{ pending ? '…' : '↺' }}
      </button>
    </div>

    <AreaChart
      :categories="['joins']"
      :data="chartData"
      index="date"
    />
  </div>
</template>
