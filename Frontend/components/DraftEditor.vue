<template>
  <div class="h-full w-full flex flex-col bg-white">
    <!-- Editor Header -->
    <div class="flex-shrink-0 bg-slate-800 text-white px-6 py-3 flex items-center justify-between border-b border-slate-700">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 class="font-semibold">{{ title || 'Draft Document' }}</h3>
        <span v-if="isDirty" class="text-xs text-slate-300">(unsaved changes)</span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Word Export Button -->
        <button
          v-if="content && content.trim()"
          @click="exportToWord"
          :disabled="exporting"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg v-if="!exporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ exporting ? 'Exporting...' : 'Export to Word' }}
        </button>
        <div class="w-px h-6 bg-slate-600"></div>
        <!-- Close Button -->
        <button
          @click="handleClose"
          class="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Close"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="flex-1 overflow-hidden flex">
      <!-- Editor Area -->
      <div class="flex-1 flex flex-col">
        <div ref="scrollContainer" class="flex-1 overflow-auto p-8 bg-white" @scroll="handleScroll">
          <div
            ref="editorRef"
            contenteditable="true"
            class="prose prose-lg max-w-4xl mx-auto focus:outline-none"
            :class="{ 'opacity-50': loading }"
            @input="handleInput"
            @paste="handlePaste"
          ></div>
          
          <!-- Loading Overlay -->
          <div v-if="loading" class="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div class="text-center">
              <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-slate-600 font-medium">{{ loadingMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface Props {
  title?: string
  initialContent?: string
  loading?: boolean
  loadingMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Draft Document',
  initialContent: '',
  loading: false,
  loadingMessage: 'Generating content...'
})

const emit = defineEmits<{
  'update:content': [content: string]
  'content-changed': [content: string]
  close: []
  'export-word': [content: string]
}>()

const editorRef = ref<HTMLElement | null>(null)
const scrollContainer = ref<HTMLElement | null>(null)
const content = ref(props.initialContent || '')
const isDirty = ref(false)
const exporting = ref(false)
const isEditorFocused = ref(false) // Track if user is actively editing
const isTyping = ref(false) // Track if content is being typed

// Initialize editor content when the component mounts
onMounted(() => {
  if (editorRef.value && props.initialContent) {
    editorRef.value.innerHTML = props.initialContent
    content.value = props.initialContent
  }
  
  // Track focus state to prevent cursor jumps while editing
  if (editorRef.value) {
    editorRef.value.addEventListener('focus', () => {
      isEditorFocused.value = true
    })
    editorRef.value.addEventListener('blur', () => {
      isEditorFocused.value = false
    })
  }
})

// When parent replaces the initial content (e.g. regenerates proposal),
// update the editor contents - but ONLY if the editor is not focused
watch(
  () => props.initialContent,
  (newContent) => {
    if (newContent === undefined || newContent === null) return
    
    // Don't update if user is actively editing - this prevents cursor jumps
    if (isEditorFocused.value) {
      console.log('Skipping content update - editor is focused')
      return
    }
    
    // Don't update if content hasn't actually changed
    if (editorRef.value && editorRef.value.innerHTML === newContent) {
      return
    }

    content.value = newContent
    isDirty.value = false

    nextTick(() => {
      if (editorRef.value) {
        editorRef.value.innerHTML = newContent || ''
      }
    })
  },
  { immediate: true }
)

function handleInput(event: Event) {
  const target = event.target as HTMLElement
  content.value = target.innerHTML
  isDirty.value = true
  emit('update:content', content.value)
  emit('content-changed', content.value)
}

function handlePaste(event: ClipboardEvent) {
  // Allow rich text pasting - don't strip formatting
  // The browser will handle it naturally, we just need to prevent default
  // and let it paste as HTML
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    // Get HTML content if available, otherwise use plain text
    const htmlData = event.clipboardData?.getData('text/html')
    const textData = event.clipboardData?.getData('text/plain') || ''
    
    if (htmlData) {
      // Paste as HTML
      event.preventDefault()
      const range = selection.getRangeAt(0)
      range.deleteContents()
      
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlData
      const fragment = document.createDocumentFragment()
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
      }
      range.insertNode(fragment)
      
      // Move cursor to end of inserted content
      range.setStartAfter(fragment.lastChild || fragment)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      
      handleInput(event)
    } else if (textData) {
      // Fallback to plain text if no HTML
      event.preventDefault()
      selection.deleteContents()
      selection.getRangeAt(0).insertNode(document.createTextNode(textData))
      handleInput(event)
    }
  }
}

async function exportToWord() {
  if (!content.value || !content.value.trim()) {
    return
  }

  exporting.value = true
  try {
    emit('export-word', content.value)
    // The parent component will handle the actual export via local agent
  } catch (error) {
    console.error('Export error:', error)
  } finally {
    exporting.value = false
  }
}

function handleClose() {
  if (isDirty.value) {
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
      emit('close')
    }
  } else {
    emit('close')
  }
}

// Function to scroll to bottom of editor
function scrollToBottom() {
  if (scrollContainer.value) {
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
      }
    })
  }
}

function handleScroll() {
  // Can add scroll handling logic if needed
}

// Function to type content into the editor with a typing effect
async function typeContent(htmlContent: string, speed: number = 20) {
  if (!editorRef.value) return
  
  isTyping.value = true
  
  // Parse HTML into text nodes while preserving structure
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  
  // Convert to text while preserving structure markers
  let textToType = ''
  const walker = document.createTreeWalker(
    tempDiv,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null
  )
  
  let node
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName.toLowerCase()
      if (tag === 'h2') {
        textToType += '\n<h2>'
      } else if (tag === 'p') {
        textToType += '\n<p>'
      } else if (tag === 'ul') {
        textToType += '\n<ul>'
      } else if (tag === 'li') {
        textToType += '\n<li>'
      } else if (tag === 'strong' || tag === 'b') {
        textToType += '<strong>'
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      textToType += node.textContent || ''
    }
  }
  
  // For typing effect, we'll type character by character
  // But we need to handle HTML tags properly
  const selection = window.getSelection()
  const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  
  // Get insertion point
  if (!range || !editorRef.value.contains(range.commonAncestorContainer)) {
    // If no selection or selection is outside editor, append to end
    const range2 = document.createRange()
    range2.selectNodeContents(editorRef.value)
    range2.collapse(false)
    selection?.removeAllRanges()
    selection?.addRange(range2)
  }
  
  // Type the content character by character
  const chars = htmlContent.split('')
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.insertNode(document.createTextNode(char))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
      
      // Update content state
      if (editorRef.value) {
        content.value = editorRef.value.innerHTML
      }
      
      // Small delay for typing effect
      await new Promise(resolve => setTimeout(resolve, speed))
      
      // Scroll to bottom periodically while typing
      if (i % 10 === 0) {
        scrollToBottom()
      }
    }
  }
  
  // Final scroll to bottom
  scrollToBottom()
  
  // Trigger input event to update content state
  handleInput(new Event('input'))
  isTyping.value = false
}

// Function to insert generated HTML content at cursor position or at end with typing effect
async function insertContentAtCursor(htmlContent: string, useTypingEffect: boolean = true) {
  if (!editorRef.value) return
  
  if (useTypingEffect) {
    // Use typing effect
    await typeContent(htmlContent, 20) // 20ms delay between characters
    return
  }
  
  // Otherwise insert immediately
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    
    // Insert the content
    const fragment = document.createDocumentFragment()
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    
    range.insertNode(fragment)
    
    // Move cursor to end of inserted content
    range.setStartAfter(fragment.lastChild || fragment)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    
    // Trigger input event to update content state
    handleInput(new Event('input'))
  } else {
    // If no selection, append to end
    editorRef.value.insertAdjacentHTML('beforeend', htmlContent)
    handleInput(new Event('input'))
  }
}

// Expose insertContentAtCursor for parent component
defineExpose({
  insertContentAtCursor
})
</script>

<style scoped>
.prose {
  @apply text-slate-900;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: #1e293b;
}

.prose h1 {
  @apply text-4xl font-bold mb-6 mt-10;
  color: #0f172a;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.prose h2 {
  @apply text-3xl font-bold mb-4 mt-8;
  color: #1e293b;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.prose h3 {
  @apply text-2xl font-semibold mb-3 mt-6;
  color: #334155;
  line-height: 1.4;
  font-weight: 600;
}

.prose h4 {
  @apply text-xl font-semibold mb-2 mt-5;
  color: #475569;
  line-height: 1.4;
  font-weight: 600;
}

.prose p {
  @apply mb-6;
  line-height: 1.85;
  font-size: 16px;
  color: #1e293b;
  text-align: left;
  margin-top: 0.5rem;
}

.prose ul, .prose ol {
  @apply mb-5 ml-8;
  line-height: 1.75;
}

.prose ul {
  list-style-type: disc;
  list-style-position: outside;
  padding-left: 2rem;
  margin: 1rem 0;
}

.prose ol {
  list-style-type: decimal;
  list-style-position: outside;
  padding-left: 2rem;
  margin: 1rem 0;
}

.prose li {
  margin: 0.75rem 0;
  line-height: 1.75;
  color: #1e293b;
  display: list-item;
  padding-left: 0.5rem;
}

.prose li::marker {
  color: #6366f1;
  font-weight: 600;
  font-size: 1.1em;
}

.prose strong,
.prose b {
  font-weight: 600;
  color: #0f172a;
}

.prose em {
  @apply italic;
  font-style: italic;
}

.prose a {
  @apply text-purple-600 underline;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose a:hover {
  @apply text-purple-700;
}

.prose blockquote {
  @apply border-l-4 border-purple-300 pl-6 italic my-6;
  color: #475569;
  font-style: italic;
}

.prose code {
  @apply bg-slate-100 px-2 py-1 rounded text-sm font-mono;
  color: #dc2626;
}

.prose pre {
  @apply bg-slate-100 p-4 rounded-lg overflow-x-auto my-4;
}

.prose pre code {
  @apply bg-transparent p-0;
  color: inherit;
}

.prose hr {
  @apply border-t border-slate-300 my-8;
}

/* Better focus styles for contenteditable */
.prose:focus {
  outline: none;
}

.prose:focus-visible {
  outline: 2px solid #a855f7;
  outline-offset: 2px;
}

/* Ensure proper spacing for nested lists */
.prose ul ul,
.prose ol ol,
.prose ul ol,
.prose ol ul {
  @apply mt-2 mb-2 ml-6;
}
</style>

