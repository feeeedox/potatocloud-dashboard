<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useWebSocket } from '~/composables/useWebSocket';

interface ScreenLogDto {
  screenName: string
  line: string
}

const props = defineProps<{
  screenName: string
}>()

const config = useRuntimeConfig()
const baseUrl = config.public.cloudBaseUrl

const MAX_RENDERED_LINES = 500

const logs = ref<string[]>([])

const commandInput = ref('')
const consoleRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)
const isConnected = ref(false)

let pendingLines: string[] = []
let rafId: number | null = null

function flushPending() {
  rafId = null
  if (pendingLines.length === 0) return

  const colorized = pendingLines.map(colorizeLog)
  pendingLines = []

  const next = logs.value.concat(colorized)
  logs.value = next.length > MAX_RENDERED_LINES ? next.slice(next.length - MAX_RENDERED_LINES) : next

  scrollToBottom()
}

function enqueueLogs(lines: string[]) {
  pendingLines.push(...lines)
  if (rafId === null) {
    rafId = requestAnimationFrame(flushPending)
  }
}

const ws = useWebSocket(`${baseUrl}/ws/screens/${props.screenName}`, {
  onOpen: () => {
    isConnected.value = true
  },
  onClose: () => {
    isConnected.value = false
  },
  onError: () => {
    isConnected.value = false
  },
})

ws.on('screen:logs:batch', (eventData: ScreenLogDto) => {
  if (eventData.screenName === props.screenName) {
    logs.value.push(colorizeLog(eventData.line));
    scrollToBottom();
  }
});

async function loadInitialLogs() {
  try {
    const data = await $fetch<{ screen: string, logs: string[] }>(`/api/cloud/screen/${props.screenName}`)
    if (data?.logs && data.logs.length > 0) {
      const slice = data.logs.slice(-MAX_RENDERED_LINES)
      logs.value = slice.map(colorizeLog)
      await nextTick()
      scrollToBottom()
    }
  }
  catch (e) {
    console.error('Failed to load initial logs', e)
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (consoleRef.value) {
      consoleRef.value.scrollTop = consoleRef.value.scrollHeight
    }
  })
}

function sendCommand() {
  const cmd = commandInput.value.trim()
  if (!cmd) return

  commandHistory.value.unshift(cmd)
  historyIndex.value = -1

  enqueueLogs([`> ${cmd}`])

  // eslint-disable-next-line no-control-regex
  const cleanedCmd = cmd.replace(/\u001B\[[0-9;]*m/g, '')
  ws.send(cleanedCmd)

  commandInput.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex.value < commandHistory.value.length - 1) {
      historyIndex.value++
      commandInput.value = commandHistory.value[historyIndex.value] || ''
    }
  }
  else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex.value > 0) {
      historyIndex.value--
      commandInput.value = commandHistory.value[historyIndex.value] || ''
    }
    else {
      historyIndex.value = -1
      commandInput.value = ''
    }
  }
}

function colorizeLog(line: string): string {
  if (!line) return ''

  let s = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  s = s.replace(
    // eslint-disable-next-line no-control-regex
    /(?:\x1B\[|\[)38;2;(\d+);(\d+);(\d+)m(.*?)(?=(?:\x1B\[|\[)(?:0m|38;2;)|$)/g,
    (_, r, g, b, text) => `<span style="color:rgb(${r},${g},${b})">${text}</span>`,
  )

  s = s.replace(
    // eslint-disable-next-line no-control-regex
    /(?:\x1B\[|\[)38;5;(\d+)m(.*?)(?=(?:\x1B\[|\[)(?:0m|38;2;|38;5;)|$)/g,
    (_, colorCode, text) => {
      const ansiPalette: Record<string, string> = {
        0: '#000000', 1: '#cd0000', 2: '#00cd00', 3: '#cdcd00',
        4: '#0000ee', 5: '#cd00cd', 6: '#00cdcd', 7: '#e5e5e5',
        8: '#7f7f7f', 9: '#ff0000', 10: '#00ff00', 11: '#ffff00',
        12: '#5c5cff', 13: '#ff00ff', 14: '#00ffff', 15: '#ffffff',
      }

      const color = ansiPalette[colorCode] || '#ff00ff';
      return `<span style="color:${color}">${text}</span>`;
    },
  )

  let italic = false
  let underline = false
  // eslint-disable-next-line no-control-regex
  s = s.replace(/(?:\x1B\[|\[)([0134])m/g, (_, code) => {
    if (code === '3' && !italic) {
      italic = true
      return '<i>'
    }
    if (code === '4' && !underline) {
      underline = true
      return '<u>'
    }
    if (code === '0') {
      let out = ''
      if (italic) {
        out += '</i>'
        italic = false
      }
      if (underline) {
        out += '</u>'
        underline = false
      }
      return out
    }
    return ''
  })
  if (italic) s += '</i>'
  if (underline) s += '</u>'

  s = s.replace(/§[0-9a-fk-or]/gi, '')

  s = s
    .replace(/\[INFO\]/g, '<span class="li">[INFO]</span>')
    .replace(/\[WARN\]/g, '<span class="lw">[WARN]</span>')
    .replace(/\[ERROR\]/g, '<span class="le">[ERROR]</span>')
    .replace(/\[DEBUG\]/g, '<span class="ld">[DEBUG]</span>')

  s = s.replace(/(\[\d{2}:\d{2}:\d{2}\])/g, '<span class="lt">$1</span>')

  if (s.startsWith('&gt; ') || s.startsWith('> ')) {
    s = `<span class="lc">${s}</span>`
  }

  return s
}

onMounted(() => {
  loadInitialLogs()
  inputRef.value?.focus()
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  ws.disconnect()
})
</script>

<template>
  <div class="console-wrapper">
    <div class="console-header">
      <span class="console-title">{{ screenName }}</span>
      <div class="flex items-center gap-2">
        <span :class="isConnected ? 'status-online' : 'status-offline'" class="status-badge">
          <span class="status-dot" />
          {{ isConnected ? 'Live' : 'Disconnected' }}
        </span>
        <button class="clear-btn" title="Clear console" @click="logs = []">
          <Icon class="h-3.5 w-3.5" name="lucide:trash-2" />
        </button>
      </div>
    </div>

    <div ref="consoleRef" class="console-output">
      <div v-if="logs.length === 0" class="console-empty">
        <Icon class="h-6 w-6 text-muted-foreground/40 mb-2" name="lucide:terminal" />
        <span>No logs yet...</span>
      </div>
      <div v-for="(html, i) in logs" :key="i" class="log-line" v-html="html" />
    </div>

    <div class="console-input-bar">
      <span class="prompt-symbol text-red-500">❯</span>
      <input
        ref="inputRef"
        v-model="commandInput"
        class="console-input"
        :placeholder="`Send command to ${screenName}...`"
        spellcheck="false"
        autocomplete="off"
        @keydown="handleKeydown"
        @keydown.enter="sendCommand"
      />
      <button class="send-btn" :disabled="!commandInput.trim()" @click="sendCommand">
        <Icon class="h-4 w-4" name="lucide:send" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.console-wrapper {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid hsl(var(--border) / 0.5);
  background: #0d0d0d;
  min-height: 400px;
  max-height: 600px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
}

.console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #161616;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}

.console-title {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  letter-spacing: 0.05em;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.status-online {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-offline {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}

.clear-btn:hover {
  background: #2a2a2a;
  border-color: #333;
  color: #aaa;
}

.console-output {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  /* Prevent layout thrashing from reflows while new lines arrive */
  contain: strict;
}

.console-output::-webkit-scrollbar {
  width: 4px;
}

.console-output::-webkit-scrollbar-track {
  background: transparent;
}

.console-output::-webkit-scrollbar-thumb {
  background: #2a2a2a;
  border-radius: 4px;
}

.console-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #444;
  font-size: 12px;
  gap: 4px;
}

.log-line {
  font-size: 12px;
  line-height: 1.7;
  color: #c8c8c8;
  white-space: pre-wrap;
  word-break: break-all;
  /* Tell the browser each line is independent — reduces reflow scope */
  contain: content;
}

/* Short class names avoid extra string work in colorizeLog */
.log-line :deep(.lt) {
  color: #555;
}

.log-line :deep(.li) {
  color: #60a5fa;
}

.log-line :deep(.lw) {
  color: #fbbf24;
}

.log-line :deep(.le) {
  color: #f87171;
  font-weight: 600;
}

.log-line :deep(.ld) {
  color: #a78bfa;
}

.log-line :deep(.lc) {
  color: #34d399;
  font-weight: 600;
}

.console-input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #111;
  border-top: 1px solid #222;
  flex-shrink: 0;
}

.prompt-symbol {
  color: #34d399;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  user-select: none;
}

.console-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  color: #e5e5e5;
  caret-color: #34d399;
}

.console-input::placeholder {
  color: #444;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #34d399;
  border: none;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #10b981;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #2a2a2a;
  color: #555;
  cursor: not-allowed;
}
</style>
