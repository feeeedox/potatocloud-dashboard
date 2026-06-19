<script lang="ts" setup>
import { useJoinStats } from '#imports';

const { chartData } = useJoinStats()
</script>

<template>
  <div>
    <!--    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"> -->
    <!--      <button -->
    <!--        style="margin-left: auto; font-size: 12px; opacity: 0.6; cursor: pointer;" -->
    <!--      > -->
    <!--        {{ pending ? '…' : '↺' }} -->
    <!--      </button> -->
    <!--    </div> -->

    <div v-if="!chartData.length" style="height: 300px; display: flex; align-items: center; justify-content: center;">
      Loading…
    </div>

    <AreaChart
      v-else-if="chartData.length > 0"
      :categories="['joins']"
      :data="chartData"
      index="date"
    />

    <div v-else style="height: 300px; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
      No data available
    </div>
  </div>
</template>