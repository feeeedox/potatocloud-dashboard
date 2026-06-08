<script lang="ts" setup>
import type { CloudGroup } from '~/types/cloud'

const props = defineProps<{
  group: CloudGroup
  isProxy?: boolean
}>()

interface Theme {
  p: string
  c1: string
  c2: string
}

const THEMES = [
  { p: 'grid', c1: '#2d1b69', c2: 'rgba(180,140,255,0.3)' },
  { p: 'dots', c1: '#1a3a5c', c2: 'rgba(100,180,255,0.35)' },
  { p: 'diag', c1: '#1a4a2e', c2: 'rgba(80,210,130,0.3)' },
  { p: 'checker', c1: '#4a1a1a', c2: 'rgba(220,100,80,0.3)' },
  { p: 'hexish', c1: '#1a2a4a', c2: 'rgba(100,160,255,0.3)' },
  { p: 'cross', c1: '#2a2a1a', c2: 'rgba(200,180,80,0.3)' },
] as Theme[]

function getTheme(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFFFF
  return THEMES[Math.abs(hash) % THEMES.length] as Theme
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

function drawPattern(canvas: HTMLCanvasElement, p: string, c1: string, c2: string) {
  const ctx = canvas.getContext('2d')!
  const { width: w, height: h } = canvas

  const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
  bgGrad.addColorStop(0, c1)
  bgGrad.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  ctx.lineCap = 'round'

  const fns: Record<string, () => void> = {
    grid: () => {
      ctx.strokeStyle = c2
      ctx.lineWidth = 0.5
      for (let x = 0; x < w; x += 15) {
        ctx.globalAlpha = Math.random() * 0.3 + 0.2
        ctx.beginPath()
        ctx.moveTo(x, 0); ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 15) {
        ctx.globalAlpha = Math.random() * 0.3 + 0.2
        ctx.beginPath()
        ctx.moveTo(0, y); ctx.lineTo(w, y)
        ctx.stroke()
      }
    },
    dots: () => {
      for (let x = 8; x < w; x += 16) {
        for (let y = 8; y < h; y += 16) {
          const size = Math.random() * 1.5 + 0.5
          ctx.globalAlpha = Math.random() * 0.5 + 0.3
          ctx.fillStyle = c2
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    },
    diag: () => {
      ctx.strokeStyle = c2
      ctx.lineWidth = 1.5
      for (let i = -h; i < w + h; i += 12) {
        ctx.globalAlpha = (i % 24 === 0) ? 0.4 : 0.15
        ctx.beginPath()
        ctx.moveTo(i, 0); ctx.lineTo(i + h, h)
        ctx.stroke()
      }
    },
    checker: () => {
      const s = 12
      for (let x = 0; x < w; x += s) {
        for (let y = 0; y < h; y += s) {
          if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 0) {
            ctx.globalAlpha = Math.random() * 0.2 + 0.1
            ctx.fillStyle = c2
            ctx.fillRect(x + 1, y + 1, s - 2, s - 2)
          }
        }
      }
    },
    hexish: () => {
      ctx.strokeStyle = c2
      ctx.lineWidth = 1
      const r = 10
      const rw = r * 1.732
      const rh = r * 1.5
      for (let row = 0; row < 10; row++) {
        for (let col = -1; col < 20; col++) {
          const x = col * rw + (row % 2) * rw / 2
          const y = row * rh
          ctx.globalAlpha = Math.random() * 0.3 + 0.1
          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 6)
            ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
          }
          ctx.closePath(); ctx.stroke()
        }
      }
    },
    cross: () => {
      ctx.strokeStyle = c2
      ctx.lineWidth = 1.2
      const s = 18
      for (let x = 9; x < w; x += s) {
        for (let y = 9; y < h; y += s) {
          ctx.globalAlpha = Math.random() * 0.4 + 0.2
          ctx.beginPath()
          ctx.moveTo(x - 3, y - 3); ctx.lineTo(x + 3, y + 3)
          ctx.moveTo(x + 3, y - 3); ctx.lineTo(x - 3, y + 3)
          ctx.stroke()
        }
      }
    },
  }

  ctx.globalCompositeOperation = 'screen'
  fns[p]?.()
  ctx.globalAlpha = 1.0
}

onMounted(() => {
  if (!canvasRef.value)
    return
  const { p, c1, c2 } = getTheme(props.group.name)
  drawPattern(canvasRef.value, p, c1, c2)
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-border/40 bg-background cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-border shadow-md"
    @click="navigateTo(`/groups/${group.name}`)"
  >
    <div class="relative h-20 overflow-hidden">
      <canvas ref="canvasRef" class="w-full h-full" height="120" width="300" />
      <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
        <span class="text-white font-bold text-2xl font-minecrafter tracking-widest uppercase drop-shadow select-none">
          {{ group.name }}
        </span>
      </div>
      <span
        class="flex flex-row items-center gap-2 absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-900/100"
      >
        <div
          :class="{
            'bg-emerald-500/85': group.onlineServicesCount >= group.maxOnlineCount,
            'bg-orange-400/90': group.onlineServicesCount > 0 && group.onlineServicesCount < group.maxOnlineCount,
            'bg-neutral-600/70 ': group.onlineServicesCount === 0,
          }"
          class="size-2 rounded-full"
        />
        <span class="text-white">
          {{ group.onlineServicesCount }} / {{ group.maxOnlineCount }}
        </span>
      </span>
    </div>

    <div class="p-3">
      <p class="text-sm font-semibold mb-2">
        {{ group.name }}
      </p>

      <div class="grid grid-cols-2 gap-1.5 mb-3">
        <div class="bg-muted/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <Icon class="h-3.5 w-3.5 text-muted-foreground" name="lucide:users" />
          <div>
            <p class="text-xs font-semibold tabular-nums">
              {{ group.onlinePlayerCount }} / {{ group.maxPlayerCount }}
            </p>
            <p class="text-[10px] text-muted-foreground leading-tight">
              Players
            </p>
          </div>
        </div>
        <div class="bg-muted/60 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <Icon class="h-3.5 w-3.5 text-muted-foreground" name="lucide:cpu" />
          <div>
            <p class="text-xs font-semibold tabular-nums">
              {{ group.maxMemory }} MB
            </p>
            <p class="text-[10px] text-muted-foreground leading-tight">
              Memory
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
        <div class="flex items-center gap-1.5">
          <Icon :name="group.platform.proxy ? 'lucide:network' : 'lucide:file-code-2'" class="h-3 w-3" />
          <span>{{ group.platform.name }}</span>
        </div>
        <span class="font-mono text-[10px]">{{ group.platformVersion.name }}</span>
      </div>
    </div>
  </div>
</template>
