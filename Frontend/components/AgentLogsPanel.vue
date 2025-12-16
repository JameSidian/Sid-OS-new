<template>
  <div
    v-if="isOpen"
    class="absolute bottom-0 left-0 right-0 text-slate-100 border-t-2 border-purple-500 shadow-2xl"
    :style="{ 
      height: `${panelHeight}px`, 
      maxHeight: '70vh', 
      minHeight: '200px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: '#0f172a',
      zIndex: 50
    }"
  >
    <!-- Resize Handle (top edge) -->
    <div
      class="absolute top-0 left-0 right-0 h-1 bg-slate-700 cursor-ns-resize hover:bg-purple-500 transition-colors"
      @mousedown="(e) => $emit('resize-start', e, panelHeight)"
    ></div>

    <!-- Logs Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700 mt-1" style="background-color: #1e293b;">
      <div class="flex items-center gap-4">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-white text-base">Agent Thinking</h3>
          <p class="text-xs text-slate-400 mt-0.5">Real-time reasoning and decision process</p>
        </div>
        <span v-if="logs.length > 0" class="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
          {{ logs.length }} {{ logs.length === 1 ? 'thought' : 'thoughts' }}
        </span>
      </div>
      <button
        @click="$emit('close')"
        class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        title="Close Logs"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Logs Content -->
    <div class="overflow-y-auto p-6 space-y-6 flex-1" style="background-color: #0f172a; min-height: 0;">
      <div v-if="logs.length === 0" class="text-center py-12" style="background-color: transparent;">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background-color: #1e293b;">
          <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p class="text-slate-400 font-sans">Agent thinking will appear here as you interact with the system.</p>
      </div>

      <div
        v-for="log in logs"
        :key="log.id"
        class="rounded-xl p-6 backdrop-blur-sm transition-colors border-l-2 log-entry"
        :class="getLogBorderColor(log.type)"
        style="background-color: rgba(30, 41, 59, 0.5);"
      >
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs text-slate-400 font-mono">{{ formatTime(log.timestamp) }}</span>
        </div>

        <!-- Render markdown/rich text content -->
        <div 
          class="text-slate-200 font-sans prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-white prose-code:text-purple-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-ul:text-slate-200 prose-ol:text-slate-200 prose-li:text-slate-200"
          style="background-color: transparent;"
          v-html="formatThinking(log.thinking)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface AgentLog {
  id: string
  type: 'thinking' | 'action' | 'result' | 'error'
  thinking: string  // Markdown/rich text content
  timestamp: Date
}

const props = withDefaults(defineProps<{
  isOpen: boolean
  logs: AgentLog[]
  panelHeight?: number
}>(), {
  panelHeight: 384
})

defineEmits<{
  open: []
  close: []
  'resize-start': [e: MouseEvent, currentHeight: number]
}>()

function getLogBorderColor(type: AgentLog['type']): string {
  const colors = {
    thinking: 'border-purple-500/50',
    action: 'border-purple-500/50',
    result: 'border-green-500/50',
    error: 'border-red-500/50'
  }
  return colors[type] || 'border-slate-600'
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  })
}

// Simple markdown-like formatting (can be enhanced with a proper markdown parser later)
function formatThinking(text: string): string {
  if (!text) return ''
  
  // Convert markdown-style formatting to HTML
  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-100 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-100 mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-100 mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    // Bullet points
    .replace(/^[-*] (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')
  
  // Wrap lists
  html = html.replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 my-3 ml-4">$1</ul>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = '<p class="mb-3 leading-relaxed">' + html + '</p>'
  } else if (!html.includes('<p')) {
    html = '<p class="mb-3 leading-relaxed">' + html + '</p>'
  }
  
  return html
}
</script>

<style scoped>
.log-entry:hover {
  background-color: rgba(30, 41, 59, 0.8);
}
</style>
