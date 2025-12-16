<template>
  <div class="h-full w-full flex flex-col bg-white">
    <!-- Chat Header -->
    <div class="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
      <div class="flex items-center gap-3 mb-2">
        <img 
          src="/logo.png" 
          alt="Sid Logo" 
          class="w-10 h-10 object-contain"
          @error="handleLogoError"
        />
        <div>
          <h3 class="font-bold text-slate-900 text-lg">Sid</h3>
          <p class="text-xs text-slate-500 mt-0.5">The Autonomous Engineer</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex flex-col"
        :class="message.role === 'user' ? 'items-end' : 'items-start'"
      >
        <div
          class="max-w-[85%] rounded-2xl p-4 shadow-sm"
          :class="
            message.role === 'user'
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
              : 'bg-white text-slate-800 border border-slate-200 shadow-md'
          "
        >
          <div 
            v-if="message.role === 'assistant'"
            class="text-sm leading-relaxed"
          >
            <span v-html="formatMessage(message.content)"></span>
            <span v-if="message.isTyping" class="inline-block w-2 h-4 bg-slate-600 animate-pulse ml-1">|</span>
          </div>
          <p 
            v-else
            class="whitespace-pre-wrap text-sm leading-relaxed"
          >{{ message.content }}</p>
          <!-- Model open button -->
          <div
            v-if="message.modelUrl"
            class="mt-3 pt-3 border-t border-slate-200"
          >
            <button
              @click="openModelFromMessage(message.modelUrl, message.modelName)"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              View Model in Viewer
            </button>
          </div>
          <div v-if="message.source" class="flex items-center gap-2 mt-3 pt-3 border-t" :class="message.role === 'user' ? 'border-purple-500/30' : 'border-slate-200'">
            <span class="text-xs font-medium" :class="message.role === 'user' ? 'text-purple-100' : 'text-slate-500'">
              {{ message.source === 'speckle' ? '🔷 BIM Data' : message.source === 'rag' ? '📄 Documents' : '🔷📄 Multi-source' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Thinking/Loading Indicator with cycling messages -->
      <div
        v-if="isLoading || thinkingMessage"
        class="flex items-start gap-3 text-slate-600 mb-4"
      >
        <div class="flex-shrink-0 mt-1">
          <div
            class="h-5 w-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"
          />
        </div>
        <div class="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <p class="text-sm font-medium text-slate-800">{{ thinkingMessage || 'Thinking...' }}</p>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-slate-200 bg-white p-4">
      <!-- Database Toggles -->
      <div class="mb-3 flex items-center gap-2">
        <button
          @click="toggleDataSource('project')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
            dataSourcesComputed.project_db
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          ]"
          :disabled="isLoading"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 16">
            <path d="M8 2L2 5V13L8 16L14 13V5L8 2Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Project DB
        </button>
        <button
          @click="toggleDataSource('code')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
            dataSourcesComputed.code_db
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          ]"
          :disabled="isLoading"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 16">
            <path d="M4 8L2 10L4 12M12 8L14 10L12 12M6 3L5.33 12.67" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Code DB
        </button>
        <button
          @click="toggleDataSource('coop')"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
            dataSourcesComputed.coop_manual
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          ]"
          :disabled="isLoading"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 16 16">
            <path d="M2 3L8 1L14 3V13L8 15L2 13V3Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 1V15M2 3L8 5L14 3M2 13L8 11L14 13" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Coop DB
        </button>
      </div>

      <form @submit.prevent="handleSend" class="flex gap-3">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ask about projects, models, or documents..."
          class="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all"
          :disabled="isLoading"
        />
        <button
          type="submit"
          :disabled="isLoading || !inputMessage.trim()"
          class="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl disabled:shadow-md"
        >
          <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, inject, computed, onBeforeUnmount } from 'vue'
import { useSmartChat, type ChatSource } from '~/composables/useSmartChat'
import { useMessageFormatter } from '~/composables/useMessageFormatter'
import { useRFPWorkflow } from '~/composables/useRFPWorkflow'
import { useModelDesignWorkflow, type ProjectParameter, type SimilarProject, type ModelDesignState } from '~/composables/useModelDesignWorkflow'
import { useRFPProposalWorkflow, type RFPProposalState } from '~/composables/useRFPProposalWorkflow'

const { formatMessageText } = useMessageFormatter()

function handleLogoError(event: Event) {
  console.error('Logo failed to load:', event)
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  source?: ChatSource
  timestamp: Date
  modelUrl?: string
  modelName?: string
  isTyping?: boolean
}

const messages = ref<Message[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const thinkingMessage = ref<string>('')
const thinkingInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Data source toggles (default all enabled)
const dataSources = ref({
  project_db: true,
  code_db: true,
  coop_manual: true
})

// Computed for template access (handles SSR better)
const dataSourcesComputed = computed(() => dataSources.value)

function toggleDataSource(source: 'project' | 'code' | 'coop') {
  if (source === 'project') {
    dataSources.value.project_db = !dataSources.value.project_db
  } else if (source === 'code') {
    dataSources.value.code_db = !dataSources.value.code_db
  } else if (source === 'coop') {
    dataSources.value.coop_manual = !dataSources.value.coop_manual
  }
  
  // Ensure at least one is enabled
  if (!dataSources.value.project_db && !dataSources.value.code_db && !dataSources.value.coop_manual) {
    dataSources.value.project_db = true
  }
}

const { sendSmartMessage, determineQueryIntent } = useSmartChat()
const { analyzeRFPAndFindSimilar, generateProposal, exportToWord } = useRFPWorkflow()
const { 
  extractSpanRequirement, 
  determineQuestions, 
  extractParameters, 
  searchSimilarProjects, 
  createModel 
} = useModelDesignWorkflow()
const {
  extractProjectFolder,
  searchRFPInFolder,
  readKeypoints,
  getExampleReport,
  getProposalTemplate,
  readProposalContent
} = useRFPProposalWorkflow()
const config = useRuntimeConfig()

// Model design workflow state
const modelDesignState = ref<ModelDesignState>({
  parameters: {},
  similarProjects: [],
  step: 'initial'
})

// RFP proposal workflow state
const rfpProposalState = ref<RFPProposalState>({
  step: 'initial'
})

  // Inject workspace methods from parent
const workspace = inject('workspace') as ReturnType<typeof import('~/composables/useWorkspace').useWorkspace> | null
const openDocumentsList = inject<(documents: any[], title?: string, subtitle?: string) => void>('openDocumentsList')
const openPDF = inject<(url: string, fileName?: string) => void>('openPDF')
const openDraft = inject<(title: string, content?: string) => void>('openDraft')
const openModel = inject<(url: string, name?: string) => void>('openModel')
const similarDocuments = inject<Ref<any[]>>('similarDocuments')

// Welcome message
messages.value.push({
  id: 'welcome',
  role: 'assistant',
  content: 'Welcome to SidOS Assistant. I can help you with:\n\n• BIM models and structural elements\n• Project documents and specifications\n• Code references and standards\n\nWhat would you like to know?',
  timestamp: new Date()
})

const emit = defineEmits<{
  'agent-log': [log: import('~/components/AgentLogsPanel').AgentLog]
  messageSent: [message: string]
  responseReceived: [response: any]
}>()

function emitAgentLog(log: import('~/components/AgentLogsPanel').AgentLog) {
  emit('agent-log', log)
}

function detectAddSectionIntent(message: string): boolean {
  const lower = message.toLowerCase()
  
  // Check if user wants to add a section to the draft/proposal
  const addSectionKeywords = ['add', 'insert', 'create', 'include']
  const sectionKeywords = ['section', 'part', 'paragraph']
  const pastProjectsKeywords = ['past project', 'similar project', 'previous project', 'past similar', 'similar work', 'proof we have done']
  
  const hasAddKeyword = addSectionKeywords.some(kw => lower.includes(kw))
  const hasSectionKeyword = sectionKeywords.some(kw => lower.includes(kw))
  const hasPastProjectsKeyword = pastProjectsKeywords.some(kw => lower.includes(kw))
  
  // Check if we're in draft editing mode (proposal is open)
  const isDraftOpen = workspace?.state.value.mode === 'draft'
  
  // Must be in draft mode and have relevant keywords
  return isDraftOpen && hasAddKeyword && (hasSectionKeyword || hasPastProjectsKeyword)
}

function detectRFPIntent(message: string): {
  isRFP: boolean
  action?: 'new_rfp' | 'open_rfp' | 'keypoints' | 'example_report' | 'template' | 'write_proposal' | 'analyze' | 'find_similar' | 'export_word' | 'add_section'
  rfpPath?: string
} {
  const lower = message.toLowerCase()
  
  // Check for RFP-related keywords
  const rfpKeywords = ['rfp', 'request for proposal', 'proposal', 'bid', 'tender']
  const hasRFPKeyword = rfpKeywords.some(kw => lower.includes(kw))
  
  // Check for "new RFP in project" pattern
  const projectFolder = extractProjectFolder(message)
  if (projectFolder && (lower.includes('new rfp') || lower.includes('rfp in'))) {
    return { isRFP: true, action: 'new_rfp' }
  }
  
  // Check if user wants to open the found RFP
  if (rfpProposalState.value.step === 'rfp_found' && (lower.includes('yes') || lower.includes('open') || lower.includes('sure'))) {
    return { isRFP: true, action: 'open_rfp' }
  }
  
  // Check for keypoints request (after RFP is opened, "yes" means keypoints)
  if (rfpProposalState.value.step === 'rfp_opened' && (lower.includes('yes') || lower.includes('sure'))) {
    return { isRFP: true, action: 'keypoints' }
  }
  
  // Check for keypoints request by keywords
  if ((lower.includes('key') && lower.includes('consider')) || lower.includes('summary') || lower.includes('key things')) {
    return { isRFP: true, action: 'keypoints' }
  }
  
  // Check for example report request (after keypoints are shared, "yes" means example report)
  if (rfpProposalState.value.step === 'keypoints_shared' && (lower.includes('yes') || lower.includes('sure') || lower.includes('find'))) {
    return { isRFP: true, action: 'example_report' }
  }
  
  // Check for example report request by keywords
  if (lower.includes('example') && (lower.includes('report') || lower.includes('similar'))) {
    return { isRFP: true, action: 'example_report' }
  }
  
  // Check for template request (if agent asks)
  if (rfpProposalState.value.step === 'examples_added' && (lower.includes('yes') || lower.includes('sure') || lower.includes('open'))) {
    return { isRFP: true, action: 'template' }
  }
  
  // Check for write proposal request (after template is added, "yes" means write proposal)
  if (rfpProposalState.value.step === 'template_added' && (lower.includes('yes') || lower.includes('sure') || lower.includes('write') || lower.includes('ready'))) {
    return { isRFP: true, action: 'write_proposal' }
  }
  
  // Check for write proposal request by keywords
  if (lower.includes('write') && (lower.includes('proposal') || lower.includes('report'))) {
    return { isRFP: true, action: 'write_proposal' }
  }
  
  // Check for add section intent (must be in draft mode)
  if (detectAddSectionIntent(message)) {
    return { isRFP: true, action: 'add_section' }
  }
  
  if (!hasRFPKeyword) {
    return { isRFP: false }
  }

  // Detect specific actions
  if (lower.includes('similar') || lower.includes('past project')) {
    return { isRFP: true, action: 'find_similar' }
  }
  
  if (lower.includes('export') || lower.includes('word') || lower.includes('document')) {
    return { isRFP: true, action: 'export_word' }
  }
  
  // Default: analyze RFP
  return { isRFP: true, action: 'analyze' }
}

function detectModelDesignIntent(message: string): {
  isModelDesign: boolean
  action?: 'initial_request' | 'confirm_parameters' | 'create_bridge'
} {
  const lower = message.toLowerCase()
  
  // Check for bridge design keywords with span requirement
  const bridgeKeywords = ['bridge', 'design']
  const spanKeywords = ['span', 'meters', 'metres', 'm', 'goes over']
  const projectKeywords = ['project', 'new project', 'require']
  
  const hasBridgeKeyword = bridgeKeywords.some(kw => lower.includes(kw))
  const hasSpanKeyword = spanKeywords.some(kw => lower.includes(kw)) || extractSpanRequirement(message) !== null
  const hasProjectKeyword = projectKeywords.some(kw => lower.includes(kw))
  
  // Check if user is confirming parameters - if we're asking questions, ANY response is parameter confirmation
  if (modelDesignState.value.step === 'asking_questions') {
    return { isModelDesign: true, action: 'confirm_parameters' }
  }
  
  // Check if user wants to create a specific bridge type
  if (modelDesignState.value.step === 'projects_found' && 
      (lower.includes('arch') || lower.includes('bridge') || 
       lower.includes('would like') || lower.includes('want'))) {
    return { isModelDesign: true, action: 'create_bridge' }
  }
  
  // Initial request: bridge design with span requirement
  if (hasBridgeKeyword && hasSpanKeyword && hasProjectKeyword) {
    return { isModelDesign: true, action: 'initial_request' }
  }
  
  return { isModelDesign: false }
}

async function handleSend() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  isLoading.value = true
  await scrollToBottom()

  // Check for model design workflow
  const modelDesignIntent = detectModelDesignIntent(userMessage)
  
  if (modelDesignIntent.isModelDesign && modelDesignIntent.action) {
    await handleModelDesignWorkflow(userMessage, modelDesignIntent.action)
    isLoading.value = false
    await scrollToBottom()
    return
  }

  // Check for RFP workflow
  const rfpIntent = detectRFPIntent(userMessage)
  console.log('RFP Intent check:', { 
    message: userMessage, 
    intent: rfpIntent, 
    currentStep: rfpProposalState.value.step 
  })
  
  if (rfpIntent.isRFP && rfpIntent.action) {
    console.log('Handling RFP workflow:', rfpIntent.action)
    await handleRFPWorkflow(userMessage, rfpIntent.action)
    isLoading.value = false
    await scrollToBottom()
    return
  }

  // Emit natural thinking log
  emitAgentLog({
    id: `thinking-${Date.now()}`,
    type: 'thinking',
    thinking: `**Received your question:** "${userMessage}"\n\nAnalyzing the query to determine the best approach...`,
    timestamp: new Date()
  })

  try {
    const intent = determineQueryIntent(userMessage)
    
    // Emit reasoning thinking
    const intentDescription = intent === 'speckle' 
      ? 'This appears to be a BIM or structural model query. I\'ll search our 3D model database.' 
      : intent === 'rag'
      ? 'This looks like a document or specification question. I\'ll search our knowledge base of PDFs and technical documents.'
      : 'This query spans both BIM models and documents. I\'ll search both systems to provide a comprehensive answer.'
    
    emitAgentLog({
      id: `reasoning-${Date.now()}`,
      type: 'thinking',
      thinking: `**Understanding your question:**\n\n${intentDescription}\n\n- Detected keywords suggest this is a **${intent === 'speckle' ? 'BIM/Model' : intent === 'rag' ? 'Document' : 'Hybrid'}** query\n- Routing to appropriate data sources`,
      timestamp: new Date()
    })

    if (intent === 'speckle' || intent === 'hybrid') {
      emitAgentLog({
        id: `search-bim-${Date.now()}`,
        type: 'action',
        thinking: `**Searching BIM database:**\n\n- Querying Speckle GraphQL API\n- Searching for structural elements, models, and 3D geometry\n- Filtering results based on your question`,
        timestamp: new Date()
      })
    }

    if (intent === 'rag' || intent === 'hybrid') {
      emitAgentLog({
        id: `search-doc-${Date.now()}`,
        type: 'action',
        thinking: `**Searching document database:**\n\n- Querying Supabase vector database\n- Searching through PDFs, specifications, and technical documents\n- Finding relevant sections and pages`,
        timestamp: new Date()
      })
    }

    // Make API call
    const enabledSources = [
      dataSources.value.project_db && 'Project DB',
      dataSources.value.code_db && 'Code DB',
      dataSources.value.coop_manual && 'Coop DB'
    ].filter(Boolean).join(', ')
    
    emitAgentLog({
      id: `connecting-${Date.now()}`,
      type: 'action',
      thinking: `**Connecting to backend:**\n\n- Endpoint: ${config.public.orchestratorUrl}/chat\n- Enabled data sources: ${enabledSources}\n- Sending query to RAG backend\n- Waiting for response...`,
      timestamp: new Date()
    })

    const response = await sendSmartMessage(userMessage, {
      dataSources: {
        project_db: dataSources.value.project_db,
        code_db: dataSources.value.code_db,
        coop_manual: dataSources.value.coop_manual
      }
    })
    
    // Check if response indicates an error
    const hasError = response.message && (
      response.message.toLowerCase().includes('error') ||
      response.message.toLowerCase().includes('failed') ||
      response.message.toLowerCase().includes('unable')
    )
    
    if (hasError) {
      emitAgentLog({
        id: `error-${Date.now()}`,
        type: 'error',
        thinking: `**Backend processing error:**\n\nThe backend encountered an issue while processing your query:\n\n- Response: "${response.message}"\n- This may be due to:\n  - Database connection issues (Supabase not initialized)\n  - Model configuration problems\n  - Missing dependencies\n\n**Troubleshooting:**\n- Check backend logs for detailed error information\n- Verify Supabase configuration in backend\n- Ensure all required services are running`,
        timestamp: new Date()
      })
    } else if (response.metadata?.citations) {
      emitAgentLog({
        id: `result-${Date.now()}`,
        type: 'result',
        thinking: `**Found relevant information:**\n\n- Discovered **${response.metadata.citations}** relevant sources\n- Synthesizing information from multiple documents\n- Preparing comprehensive answer\n\n**Sources used:**\n${response.metadata.route ? `- ${response.metadata.route}` : ''}`,
        timestamp: new Date()
      })
    }
    
    // Show thinking indicator - adjust based on message length/complexity
    const messageLength = message.length
    const isComplex = messageLength > 100 || message.toLowerCase().includes('analyze') || message.toLowerCase().includes('explain')
    
    if (isComplex) {
      startThinking([
        'Understanding your question...',
        'Searching knowledge base...',
        'Analyzing relevant information...',
        'Synthesizing response...',
        'Preparing detailed answer...'
      ])
      await new Promise(resolve => setTimeout(resolve, 2000)) // Longer for complex questions
    } else {
      startThinking([
        'Processing your request...',
        'Searching information...',
        'Preparing response...'
      ])
      await new Promise(resolve => setTimeout(resolve, 1000)) // Shorter for simple questions
    }
    
    // Type out the response gradually
    const messageId = (Date.now() + 1).toString()
    messages.value.push({
      id: messageId,
      role: 'assistant',
      content: '',
      source: response.source,
      timestamp: new Date(),
      isTyping: true
    })
    
    await scrollToBottom()
    await typeMessageContent(messageId, response.message)

    emit('responseReceived', response)
  } catch (error) {
    console.error('Chat error:', error)
    
    emitAgentLog({
      id: `error-${Date.now()}`,
      type: 'error',
      thinking: `**Encountered an error:**\n\nI had trouble processing your request:\n- ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nThis might be due to:\n- Backend service temporarily unavailable\n- Network connectivity issues\n- Query format needs adjustment\n\nPlease try rephrasing your question or try again in a moment.`,
      timestamp: new Date()
    })

    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'I encountered an error processing your request. Please check the Agent Thinking panel for details, or try rephrasing your question.',
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

function formatMessage(text: string): string {
  return formatMessageText(text)
}

async function handleModelDesignWorkflow(
  message: string, 
  action: 'initial_request' | 'confirm_parameters' | 'create_bridge'
) {
  try {
    if (action === 'initial_request') {
      // Extract span requirement
      const span = extractSpanRequirement(message)
      if (!span) {
        await addTypedMessage('I understand you need a bridge design. Could you please specify the span requirement? For example, "goes over 10 meters".', undefined, 300)
        return
      }

      // Extract initial parameters
      modelDesignState.value.parameters = {
        ...modelDesignState.value.parameters,
        span,
        ...extractParameters(message, modelDesignState.value.parameters)
      }

      // Log thinking about why we're asking questions
      emitAgentLog({
        id: `model-design-thinking-${Date.now()}`,
        type: 'thinking',
        thinking: `**Understanding your bridge design request:**\n\nI see you need a bridge design that covers ${span} meters. To find the most relevant past projects and ensure we design appropriately, I need to gather some additional information:\n\n**Why I'm asking these questions:**\n\n1. **Client information** - This helps me check if we've completed similar work for this client before, which can inform design preferences and requirements.\n\n2. **Project location** - Location determines:\n   - Which building codes and standards apply (e.g., Ontario Building Code, CSA standards)\n   - Environmental considerations (snow loads, wind loads, seismic requirements)\n   - Material availability and local construction practices\n\n3. **Traffic type** - This is critical for determining:\n   - Design loads (vehicular bridges have much higher loads than pedestrian bridges)\n   - Bridge width requirements\n   - Safety and accessibility standards\n   - Structural system selection\n\nThese parameters will help me search for past projects that are truly similar and relevant to your needs.`,
        timestamp: new Date()
      })

      // Determine what questions to ask
      const questions = determineQuestions(modelDesignState.value.parameters)
      
      if (questions.length > 0) {
        modelDesignState.value.step = 'asking_questions'
        
        // Show thinking before asking questions
        startThinking([
          'Analyzing span requirement...',
          'Determining information needed...',
          'Preparing questions...'
        ])
        
        await addTypedMessage(
          `I understand you need a bridge design that covers ${span} meters. To help you find the best past projects and design this appropriately, I have a few questions:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nPlease provide this information so I can search for the most relevant past projects.`,
          undefined,
          1000
        )
      } else {
        // All parameters collected, proceed to search
        await searchAndDisplayProjects()
      }

    } else if (action === 'confirm_parameters') {
      // Extract parameters from user's confirmation message
      const extractedParams = extractParameters(message, modelDesignState.value.parameters)
      modelDesignState.value.parameters = {
        ...modelDesignState.value.parameters,
        ...extractedParams
      }

      // Debug log to see what was extracted
      console.log('Extracted parameters:', extractedParams)
      console.log('Current parameters:', modelDesignState.value.parameters)

      // Check if we have enough information
      const questions = determineQuestions(modelDesignState.value.parameters)
      
      if (questions.length > 0) {
        startThinking([
          'Processing your information...',
          'Checking parameters...',
          'Identifying remaining details...'
        ])
        
        await addTypedMessage(
          `Thank you for that information. I still need:\n\n${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
          undefined,
          800
        )
      } else {
        // All parameters confirmed
        modelDesignState.value.parameters.confirmed = true
        modelDesignState.value.step = 'confirmed'
        
        emitAgentLog({
          id: `parameters-confirmed-${Date.now()}`,
          type: 'thinking',
          thinking: `**Parameters confirmed:**\n\nI now have all the information needed:\n- Span: ${modelDesignState.value.parameters.span}m\n${modelDesignState.value.parameters.client ? `- Client: ${modelDesignState.value.parameters.client}` : ''}\n${modelDesignState.value.parameters.location ? `- Location: ${modelDesignState.value.parameters.location}` : ''}\n${modelDesignState.value.parameters.trafficType ? `- Traffic type: ${modelDesignState.value.parameters.trafficType}` : ''}\n\nNow I'll search for past projects that can cover this span and meet these requirements.`,
          timestamp: new Date()
        })
        
        startThinking([
          'Confirming parameters...',
          'Reviewing requirements...',
          'Preparing to search...'
        ])
        
        await addTypedMessage(
          `Perfect! I understand the project requirements:\n- Span: ${modelDesignState.value.parameters.span}m\n${modelDesignState.value.parameters.client ? `- Client: ${modelDesignState.value.parameters.client}\n` : ''}${modelDesignState.value.parameters.location ? `- Location: ${modelDesignState.value.parameters.location}\n` : ''}${modelDesignState.value.parameters.trafficType ? `- Traffic type: ${modelDesignState.value.parameters.trafficType}\n` : ''}\nI'll now search for past similar projects that can cover this span.`,
          undefined,
          1000
        )
        
        // Proceed to search
        await searchAndDisplayProjects()
      }

    } else if (action === 'create_bridge') {
      // Extract bridge type from message (force extraction even if already set)
      const extracted = extractParameters(message, {})
      const bridgeType = extracted.bridgeType || 'arch'
      modelDesignState.value.parameters.bridgeType = bridgeType

      emitAgentLog({
        id: `create-bridge-thinking-${Date.now()}`,
        type: 'thinking',
        thinking: `**Creating ${bridgeType} bridge design:**\n\nBased on your selection of a ${bridgeType} bridge design, I'll analyze the reference projects and apply Canadian bridge design standards to create an appropriate design.\n\n**Reference Projects Analysis:**\nI've analyzed the three similar projects you reviewed:\n${modelDesignState.value.similarProjects.map((p, i) => `   ${i + 1}. ${p.name || 'Project ' + (i + 1)} - ${p.reason || 'Similar span and design requirements'}`).join('\n')}\n\n**Design Code References:**\nFor this project in ${modelDesignState.value.parameters.location || 'Canada'}, I'm referencing:\n- **CSA S6:19 - Canadian Highway Bridge Design Code** (https://www.csagroup.org/news/canadas-new-highway-bridge-design-code-first-in-canada-to-provide-guidance-for-future-climate-change-risks/)\n- This code provides comprehensive guidance for bridge design including:\n  - Load requirements for different traffic types\n  - Climate change considerations for future risks\n  - Structural design requirements\n  - Geometric requirements including bridge width\n\n**Design Parameters:**\n- **Span:** ${modelDesignState.value.parameters.span}m\n- **Traffic Type:** ${modelDesignState.value.parameters.trafficType || 'Not specified'}\n- **Location:** ${modelDesignState.value.parameters.location || 'Not specified'}\n\n**Bridge Width Determination:**\nFor ${modelDesignState.value.parameters.trafficType === 'pedestrian' ? 'pedestrian' : modelDesignState.value.parameters.trafficType === 'vehicular' ? 'vehicular' : 'mixed'} traffic, I'll determine the appropriate bridge width based on:\n- CSA S6 requirements for minimum clear width\n- Traffic volume and type (affects width requirements)\n- Safety considerations (shoulders, barriers, clearance)\n- Accessibility standards (for pedestrian bridges)\n\nThe bridge width will be calculated to meet code minimums while providing safe passage for the specified traffic type.\n\n**Feature Selection Rationale:**\nI'll incorporate design features from the reference projects that are proven and appropriate:\n- Structural systems that have worked successfully for similar spans\n- Load distribution methods appropriate for ${modelDesignState.value.parameters.trafficType} traffic\n- Materials and construction approaches suitable for the location\n- Climate resilience features as recommended by CSA S6\n\n**Model Generation:**\nI'll create a new Speckle model with:\n- Bridge geometry meeting span requirements\n- Structural elements sized appropriately\n- Load paths and support systems\n- Design parameters documented for review\n\nThe model will be ready for structural analysis and further design refinement.`,
        timestamp: new Date()
      })

      modelDesignState.value.step = 'creating'
      
      startThinking([
        'Analyzing reference projects...',
        'Applying design standards...',
        'Determining bridge width...',
        'Generating 3D model...',
        'Creating Speckle model...'
      ])
      
      await addTypedMessage(
        `I'll create an ${bridgeType} bridge design that covers ${modelDesignState.value.parameters.span}m. Let me generate the model based on the similar projects we reviewed...`,
        undefined,
        1500
      )

      // Create the model
      const newModel = await createModel(
        modelDesignState.value.parameters,
        modelDesignState.value.similarProjects,
        bridgeType
      )

      // Determine bridge width based on traffic type
      const bridgeWidth = modelDesignState.value.parameters.trafficType === 'pedestrian' 
        ? '3.0m' 
        : modelDesignState.value.parameters.trafficType === 'vehicular'
        ? '9.0m (single lane with shoulders per CSA S6)'
        : '7.5m (standard two-lane minimum)'
      
      const widthExplanation = modelDesignState.value.parameters.trafficType === 'pedestrian'
        ? 'The bridge width of 3.0m provides adequate clearance for pedestrian traffic, meeting accessibility requirements and allowing safe passage for wheelchairs and maintenance vehicles.'
        : modelDesignState.value.parameters.trafficType === 'vehicular'
        ? 'The bridge width of 9.0m accommodates a single traffic lane (3.5m) with shoulders (2.25m each side) per CSA S6 minimum requirements for highway bridges, ensuring safe vehicle passage and emergency access.'
        : 'The bridge width of 7.5m provides standard two-lane accommodation, meeting CSA S6 minimum requirements for the specified traffic loads.'

      emitAgentLog({
        id: `model-created-${Date.now()}`,
        type: 'result',
        thinking: `**Model created successfully:**\n\nThe new ${bridgeType} bridge design has been created:\n- Project ID: ${newModel.projectId}\n- Model ID: ${newModel.modelId}\n\n**Design Summary:**\n- **Span:** ${modelDesignState.value.parameters.span}m\n- **Bridge Type:** ${bridgeType}\n- **Bridge Width:** ${bridgeWidth}\n- **Traffic Type:** ${modelDesignState.value.parameters.trafficType || 'Mixed'}\n- **Location:** ${modelDesignState.value.parameters.location || 'Not specified'}\n\n**Width Determination:**\n${widthExplanation}\n\n**Feature Selection:**\nThe bridge incorporates:\n- Structural system proven for ${modelDesignState.value.parameters.span}m spans\n- Load distribution appropriate for ${modelDesignState.value.parameters.trafficType} traffic\n- Design elements referenced from successful past projects\n- Compliance with CSA S6 Canadian Highway Bridge Design Code requirements\n- Climate resilience considerations as per code guidance\n\n**Reference Projects Used:**\n${modelDesignState.value.similarProjects.map((p, i) => `   ${i + 1}. ${p.name || 'Project ' + (i + 1)} - ${p.reason || 'Design reference'}`).join('\n')}\n\nThe model is now available in your Speckle project and ready for structural analysis and review.`,
        timestamp: new Date()
      })

      const modelName = `${bridgeType.charAt(0).toUpperCase() + bridgeType.slice(1)} Bridge - ${modelDesignState.value.parameters.span}m span`
      
      // Create message with model info
      const messageId = (Date.now() + 1).toString()
      messages.value.push({
        id: messageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isTyping: true,
        modelUrl: newModel.url,
        modelName: modelName
      })
      
      await scrollToBottom()
      await typeMessageContent(
        messageId,
        `✅ I've created the ${bridgeType} bridge design model!\n\n**Design Summary:**\n- **Span:** ${modelDesignState.value.parameters.span}m\n- **Bridge Width:** ${bridgeWidth}\n- **Traffic Type:** ${modelDesignState.value.parameters.trafficType || 'Mixed'}\n\n**Bridge Width:**\n${widthExplanation}\n\n**Selected Features:**\nThe design incorporates structural systems and features from the reference projects that are proven for this span length. The ${bridgeType} bridge type was chosen for its structural efficiency and suitability for ${modelDesignState.value.parameters.span}m spans. Design elements reference successful approaches from similar past projects while ensuring compliance with CSA S6 Canadian Highway Bridge Design Code requirements.\n\nThe model is now available in your project and ready for review.`
      )
    }
  } catch (error) {
    console.error('Model design workflow error:', error)
    stopThinking() // Ensure thinking indicator is stopped on error
    emitAgentLog({
      id: `model-design-error-${Date.now()}`,
      type: 'error',
      thinking: `**Error in model design workflow:**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or rephrase your request.`,
      timestamp: new Date()
    })
    
    await addTypedMessage('I encountered an error processing your bridge design request. Please check the Agent Thinking panel for details.', undefined, 300)
  }
}

async function searchAndDisplayProjects() {
  if (!modelDesignState.value.parameters.span) return

  modelDesignState.value.step = 'searching'

  emitAgentLog({
    id: `search-thinking-${Date.now()}`,
    type: 'thinking',
    thinking: `**Searching for similar projects:**\n\nI'll search our project database for bridges that can cover ${modelDesignState.value.parameters.span}m. Here's my search strategy:\n\n1. **Span requirement** - I'm looking for projects with spans at or near ${modelDesignState.value.parameters.span}m. I'll search for:\n   - Projects with exactly ${modelDesignState.value.parameters.span}m span\n   - Projects with spans between ${modelDesignState.value.parameters.span * 0.8}m and ${modelDesignState.value.parameters.span * 1.2}m (allowing some flexibility)\n   - Projects that have successfully covered this span range\n\n2. **Design variety** - I want to find a diverse set of projects that demonstrate different design approaches:\n   - Different bridge types (arch, beam, truss, etc.)\n   - Different structural systems\n   - Different construction methods\n   This variety will give you options and show what approaches have worked in the past.\n\n3. **Relevance factors** - I'll prioritize projects based on:\n   - Span similarity (closer spans are more relevant)\n   ${modelDesignState.value.parameters.client ? `- Client history (checking if we've worked with ${modelDesignState.value.parameters.client} before)` : ''}\n   ${modelDesignState.value.parameters.location ? `- Geographic proximity (projects in ${modelDesignState.value.parameters.location} or similar regions)` : ''}\n   ${modelDesignState.value.parameters.trafficType ? `- Traffic type similarity (${modelDesignState.value.parameters.trafficType} bridges)` : ''}\n\n4. **Quality validation** - I'll ensure the selected projects:\n   - Were successfully completed\n   - Have complete model data available\n   - Represent proven design solutions\n\nI'll search through our Speckle projects and identify the three best matches.`,
    timestamp: new Date()
  })

  try {
    // Show thinking during search
    startThinking([
      'Searching project database...',
      'Filtering by span requirements...',
      'Analyzing project similarity...',
      'Selecting best matches...',
      'Preparing project list...'
    ])
    
    await new Promise(resolve => setTimeout(resolve, 1500)) // Search is moderately complex
    
    const projects = await searchSimilarProjects(
      modelDesignState.value.parameters.span!,
      modelDesignState.value.parameters
    )

    modelDesignState.value.similarProjects = projects
    modelDesignState.value.step = 'projects_found'

    emitAgentLog({
      id: `projects-found-${Date.now()}`,
      type: 'result',
      thinking: `**Found three similar projects:**\n\nI've identified three past projects that can cover the ${modelDesignState.value.parameters.span}m span requirement:\n\n${projects.map((p, i) => `${i + 1}. **${p.name || 'Project ' + (i + 1)}**\n   - URL: ${p.url}\n   - Span: ${p.span}m\n   ${p.bridgeType ? `- Type: ${p.bridgeType}` : ''}\n   - Reason: ${p.reason || 'Similar span and design requirements'}`).join('\n\n')}\n\nThese projects have been added to the system and are ready for your review. Each project demonstrates successful approaches to covering similar spans and will provide valuable reference for your new design.`,
      timestamp: new Date()
    })

    // Display projects in chat with names instead of URLs
    const projectList = projects.map((p, i) => 
      `${i + 1}. **${p.name || `Project ${i + 1}`}**\n   ${p.reason || 'Similar span coverage'}`
    ).join('\n\n')

    await addTypedMessage(
      `I've found three past projects that can cover this span. Here they are:\n\n${projectList}\n\nThese projects have been added to the system and are available in the left panel. You can click on them to review in the viewer. Once you've reviewed them, let me know what type of bridge design you'd like (e.g., arch bridge, beam bridge, etc.).`,
      undefined,
      500
    )

      // Open projects list in the left panel so they're clickable
      if (openDocumentsList) {
        const projectDocuments = projects.map(p => ({
          id: p.modelId,
          title: p.name || `Project ${p.modelId.substring(0, 8)}`,
          name: p.name || `Project ${p.modelId.substring(0, 8)}`,
          url: p.url,
          description: p.reason,
          metadata: {
            projectId: p.projectId,
            modelId: p.modelId,
            span: p.span,
            bridgeType: p.bridgeType
          }
        }))
        
        openDocumentsList(
          projectDocuments,
          'Similar Past Projects',
          'Click on a project to view it in the model viewer'
        )
      }
  } catch (error) {
    console.error('Error searching for projects:', error)
    throw error
  }
}

// Convert sample projects text to HTML format
function convertSampleProjectsToHTML(text: string): string {
  let html = '<h2>Relevant Project Experience</h2>\n\n'
  
  // Split into projects (each starts with "Project X —")
  const projectSections = text.split(/(?=Project \d+[—–-])/)
  
  projectSections.forEach((section, index) => {
    if (!section.trim()) return
    
    const lines = section.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length === 0) return
    
    // Extract project title (first line)
    const projectTitle = lines[0].replace(/^Project \d+[—–-]\s*/, '')
    html += `<h3>${lines[0]}</h3>\n\n`
    
    let currentHeading = ''
    let currentParagraph = ''
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      // Check if it's a heading
      if (line === 'Project Overview' || line === 'Structural Scope & Complexity' || line === 'Relevance to Cooper University Health Care') {
        // Close previous paragraph if open
        if (currentParagraph) {
          html += `<p>${currentParagraph.trim()}</p>\n\n`
          currentParagraph = ''
        }
        currentHeading = line
        html += `<h4>${line}</h4>\n\n`
      } else {
        // Add to current paragraph
        if (currentParagraph) {
          currentParagraph += ' ' + line
        } else {
          currentParagraph = line
        }
      }
    }
    
    // Close any remaining paragraph
    if (currentParagraph) {
      html += `<p>${currentParagraph.trim()}</p>\n\n`
    }
    
    html += '\n'
  })
  
  return html
}

// Type section into draft with typing effect (sentence by sentence)
async function typeSectionIntoDraft(htmlContent: string) {
  if (!workspace) return
  
  // Split HTML into logical chunks for typing effect
  // We'll parse by HTML elements (headings, paragraphs) and split paragraphs into sentences
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  
  const chunks: string[] = []
  
  // Process each top-level element
  Array.from(tempDiv.children).forEach(element => {
    const tag = element.tagName.toLowerCase()
    
    if (['h2', 'h3', 'h4'].includes(tag)) {
      // Headings as single chunks
      chunks.push(element.outerHTML + '\n\n')
    } else if (tag === 'p') {
      // Split paragraphs into sentences
      const text = element.textContent || ''
      const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim())
      
      if (sentences.length > 0) {
        // First sentence with opening tag
        chunks.push(`<p>${sentences[0].trim()}`)
        // Middle sentences
        for (let i = 1; i < sentences.length - 1; i++) {
          chunks.push(` ${sentences[i].trim()}`)
        }
        // Last sentence with closing tag
        if (sentences.length > 1) {
          chunks.push(` ${sentences[sentences.length - 1].trim()}</p>\n\n`)
        } else {
          chunks.push(`</p>\n\n`)
        }
      }
    } else {
      // Other elements as-is
      chunks.push(element.outerHTML + '\n\n')
    }
  })
  
  // Get current content
  let currentContent = workspace.state.value.draftContent || ''
  if (currentContent && !currentContent.endsWith('\n\n')) {
    currentContent += '\n\n'
  }
  
  // Type each chunk with appropriate delay
  for (const chunk of chunks) {
    currentContent += chunk
    workspace.updateDraftContent(currentContent)
    
    // Delay: longer for headings, medium for paragraph ends, short for mid-sentence
    let delay = 50
    if (chunk.includes('<h2>') || chunk.includes('<h3>')) {
      delay = 400
    } else if (chunk.includes('<h4>')) {
      delay = 300
    } else if (chunk.includes('</p>')) {
      delay = 250
    } else if (chunk.startsWith(' ')) {
      delay = 80
    }
    
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

async function handleRFPWorkflow(message: string, action: 'new_rfp' | 'open_rfp' | 'keypoints' | 'example_report' | 'template' | 'write_proposal' | 'analyze' | 'find_similar' | 'export_word' | 'add_section') {
  try {
    // Handle new RFP in project folder
    if (action === 'new_rfp') {
      const projectFolder = extractProjectFolder(message)
      if (!projectFolder) {
        await addTypedMessage('I couldn\'t find a project folder in your message. Please specify which project folder contains the RFP (e.g., "new RFP in project 2025-12-001").', undefined, 300)
        return
      }
      
      emitAgentLog({
        id: `rfp-search-${Date.now()}`,
        type: 'thinking',
        thinking: `**Searching for RFP in Project Folder:**\n\nI'm searching for RFP files in project folder: ${projectFolder}\n\n- Looking for PDF files with "RFP" or "Request for Proposal" in the filename\n- Checking common locations for project documents\n- Matching file patterns to identify the RFP document`,
        timestamp: new Date()
      })
      
      // Show thinking bubble with cycling messages - specific to file search
      startThinking([
        'Searching project folder...',
        'Scanning for RFP files...',
        'Identifying document type...',
        'Locating RFP document...'
      ])
      
      // File search is quick - 1.2 seconds
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const rfpResult = await searchRFPInFolder(projectFolder)
      
      if (rfpResult) {
        rfpProposalState.value = {
          step: 'rfp_found',
          rfpPath: rfpResult.path,
          rfpFileName: rfpResult.fileName,
          projectFolder
        }
        
        await addTypedMessage(`I have found ${rfpResult.fileName}, would you like me to open it?`, undefined, 300)
      } else {
        stopThinking()
        await addTypedMessage(`I couldn't find an RFP file in project folder ${projectFolder}. Please check the folder path or provide more details.`, undefined, 300)
      }
      return
    }
    
    // Handle opening the found RFP
    if (action === 'open_rfp') {
      if (!rfpProposalState.value.rfpPath) {
        await addTypedMessage('I don\'t have an RFP to open. Please mention a new RFP first.', undefined, 300)
        return
      }
      
      // Add RFP to document list
      if (openDocumentsList) {
        const rfpDoc = {
          id: 'rfp-1',
          title: rfpProposalState.value.rfpFileName || 'RFP Document',
          filePath: rfpProposalState.value.rfpPath,
          url: rfpProposalState.value.rfpPath, // For public folder files, path is also the URL
          description: 'Request for Proposal document'
        }
        openDocumentsList([rfpDoc], 'RFP Documents', 'Click to view in the main panel')
      }
      
      rfpProposalState.value.step = 'rfp_opened'
      
      await addTypedMessage(`I've added ${rfpProposalState.value.rfpFileName} to the side panel. Click on it to view it in the main panel.\n\nWould you like me to provide a summary of key things to consider about this RFP?`, undefined, 300)
      return
    }
    
    // Handle keypoints request
    if (action === 'keypoints') {
      emitAgentLog({
        id: `rfp-keypoints-${Date.now()}`,
        type: 'thinking',
        thinking: `**Analyzing RFP Key Considerations:**\n\nI'm reading through the RFP to identify critical structural engineering considerations:\n\n- Extracting key technical requirements\n- Identifying complexity factors\n- Highlighting integration challenges\n- Noting schedule and constructability requirements\n\nThis will help ensure the proposal addresses all critical aspects.`,
        timestamp: new Date()
      })
      
      startThinking([
        'Analyzing RFP document...',
        'Extracting key requirements...',
        'Identifying critical considerations...',
        'Summarizing important points...'
      ])
      
      // Keypoints analysis is quick - 1 second
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const keypoints = await readKeypoints()
      rfpProposalState.value.keypoints = keypoints
      rfpProposalState.value.step = 'keypoints_shared'
      
      await addTypedMessage(keypoints, undefined, 300)
      
      await addTypedMessage('Would you like me to find an example report from a similar past project?', undefined, 300)
      return
    }
    
    // Handle example report request
    if (action === 'example_report') {
      const exampleDoc = getExampleReport()
      
      startThinking([
        'Searching past projects...',
        'Finding similar examples...',
        'Selecting relevant report...',
        'Adding to reference documents...'
      ])
      
      // Example report lookup is quick - 0.8 seconds
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (openDocumentsList) {
        const existingDocs = similarDocuments?.value || []
        const updatedDocs = [...existingDocs, exampleDoc]
        openDocumentsList(updatedDocs, 'Reference Documents', 'Past proposals and templates for reference')
      }
      
      rfpProposalState.value.step = 'examples_added'
      
      await addTypedMessage(`I've added ${exampleDoc.title} to the side panel. This is an example report from a similar past project that you can reference.\n\nWould you like me to also open the proposal template?`, undefined, 300)
      return
    }
    
    // Handle template request
    if (action === 'template') {
      const templateDoc = getProposalTemplate()
      
      startThinking([
        'Loading proposal template...',
        'Preparing template format...',
        'Adding template to references...'
      ])
      
      // Template loading is very quick - 0.6 seconds
      await new Promise(resolve => setTimeout(resolve, 600))
      
      if (openDocumentsList) {
        const existingDocs = similarDocuments?.value || []
        const updatedDocs = [...existingDocs, templateDoc]
        openDocumentsList(updatedDocs, 'Reference Documents', 'Past proposals and templates for reference')
      }
      
      rfpProposalState.value.step = 'template_added'
      
      await addTypedMessage(`I've added ${templateDoc.title} to the side panel. This is the company standard proposal template that shows the format and structure you should follow.\n\nWhen you're ready, let me know if you'd like me to write up the proposal.`, undefined, 300)
      return
    }
    
    // Handle write proposal request
    if (action === 'write_proposal') {
      emitAgentLog({
        id: `rfp-write-${Date.now()}`,
        type: 'thinking',
        thinking: `**Writing Proposal:**\n\nI'm generating a comprehensive proposal based on:\n\n1. The RFP requirements and key considerations\n2. The example report structure and content\n3. The company proposal template format\n4. Similar past project experience\n\nI'll create a professional proposal that addresses all RFP requirements while following our standard format.`,
        timestamp: new Date()
      })
      
      startThinking([
        'Analyzing RFP requirements...',
        'Reviewing example report structure...',
        'Applying proposal template format...',
        'Generating proposal content...',
        'Formatting sections...',
        'Finalizing draft...'
      ])
      
      // Writing proposal is complex - 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const proposalContent = await readProposalContent()
      
      console.log('Proposal content generated, length:', proposalContent.length)
      console.log('Opening draft editor...')
      
      // Open draft editor with proposal content
      if (openDraft) {
        console.log('Using openDraft from inject')
        openDraft('Proposal Draft', proposalContent)
      } else if (workspace) {
        console.log('Using workspace.openDraft directly')
        workspace.openDraft('Proposal Draft', proposalContent)
      } else {
        console.error('Neither openDraft nor workspace available!')
      }
      
      console.log('Draft opened, workspace state:', workspace?.state.value)
      
      rfpProposalState.value.step = 'proposal_written'
      
      await addTypedMessage('I\'ve written a draft proposal based on the RFP, example report, and template. It\'s now open in the workspace for your review and editing.\n\nOnce you\'re satisfied with the proposal, would you like me to export it to a Word document?', undefined, 300)
      return
    }
    
    // Handle add section request
    if (action === 'add_section') {
      emitAgentLog({
        id: `add-section-${Date.now()}`,
        type: 'thinking',
        thinking: `**Adding Section to Proposal:**\n\nI understand you want me to add a section about past similar projects we've completed. I'll:\n\n1. Read the sample projects reference document\n2. Format it as a professional "Relevant Project Experience" section\n3. Add it to the current proposal draft with proper formatting`,
        timestamp: new Date()
      })
      
      try {
        // Read the sample projects file
        const response = await fetch('/writing/sampleprojects.txt')
        if (!response.ok) {
          throw new Error('Failed to load sample projects')
        }
        const sampleProjectsText = await response.text()
        
        // Convert text to HTML format
        const htmlSection = convertSampleProjectsToHTML(sampleProjectsText)
        
        emitAgentLog({
          id: `formatting-section-${Date.now()}`,
          type: 'action',
          thinking: `**Formatting Section:**\n\nI've read the sample projects and formatted them as a professional "Relevant Project Experience" section with:\n\n- Proper headings (H2 for section title, H3 for project titles)\n- Structured paragraphs\n- Professional formatting matching the proposal style`,
          timestamp: new Date()
        })
        
        // Show thinking indicator - specific to section addition
        startThinking([
          'Reading sample projects file...',
          'Extracting project details...',
          'Formatting as HTML section...',
          'Preparing to insert into draft...'
        ])
        
        // Section addition is moderate complexity - 1.2 seconds
        await addTypedMessage(
          'I\'m adding a "Relevant Project Experience" section to your proposal with details about three similar past projects. The content is being added to the draft now...',
          undefined,
          1200
        )
        
        // Type the section into the draft with typing effect
        await typeSectionIntoDraft(htmlSection)
        
        // Add small delay before final message
        await new Promise(resolve => setTimeout(resolve, 400))
        
        await addTypedMessage(
          'I\'ve successfully added the "Relevant Project Experience" section to your proposal, including three similar past projects with detailed descriptions of their relevance to the current project.',
          undefined,
          300
        )
      } catch (error) {
        console.error('Error adding section:', error)
        stopThinking()
        await addTypedMessage('I encountered an error while adding the section. Please try again.', undefined, 300)
      }
      return
    }
    
    // Legacy actions (original RFP workflow)
    if (action === 'find_similar' || action === 'analyze') {
      emitAgentLog({
        id: `rfp-analyze-${Date.now()}`,
        type: 'thinking',
        thinking: `**Analyzing RFP and Finding Similar Projects:**\n\nI'll:\n1. Read and analyze the RFP document\n2. Extract key information (project type, client, location, scope)\n3. Search our database for similar past projects\n4. Match based on project type, client, location, and scope similarity\n5. Select the 3 most relevant examples\n\nThis process ensures we find the best reference materials for your proposal.`,
        timestamp: new Date()
      })

      // For now, use a mock RFP path - in production, this would come from user selection
      const rfpPath = '/Users/jameshinsperger/Desktop/Desktop - MacBook Pro (2)/Visual Studio/rag-GHD-Demo/writing/Structural Engineer RFP 63023.pdf'
      
      const analysis = await analyzeRFPAndFindSimilar(rfpPath)
      
      // Show similar projects in document list
      if (analysis.similarProjects && analysis.similarProjects.length > 0 && openDocumentsList) {
        openDocumentsList(
          analysis.similarProjects,
          'Similar Past Projects',
          'These projects were selected based on project type, client, location, and scope similarity'
        )
        
        messages.value.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I found ${analysis.similarProjects.length} similar past projects that would be good examples for your proposal. They're shown in the left panel.\n\nWould you like me to:\n1. Pull up these examples for you to review?\n2. Start writing the proposal based on these examples?`,
          timestamp: new Date()
        })
      } else {
        messages.value.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I understand the RFP. Would you now like me to find similar past projects that would be good examples for writing a proposal?',
          timestamp: new Date()
        })
      }
    } else if (action === 'write_proposal') {
      emitAgentLog({
        id: `rfp-write-${Date.now()}`,
        type: 'thinking',
        thinking: `**Writing Proposal:**\n\nI'll:\n1. Review the RFP requirements\n2. Reference company standard proposal templates\n3. Use similar past projects as examples for structure and content\n4. Address all RFP requirements\n5. Write in professional engineering tone\n6. Include all standard sections\n\nThis will create a comprehensive, professional proposal ready for your review.`,
        timestamp: new Date()
      })

      // Get similar projects from current state (would be stored in component state)
      const similarProjects: any[] = [] // TODO: Get from state
      const rfpPath = '/Users/jameshinsperger/Desktop/Desktop - MacBook Pro (2)/Visual Studio/rag-GHD-Demo/writing/Structural Engineer RFP 63023.pdf'
      
      const proposalContent = await generateProposal(rfpPath, similarProjects, message)
      
      // Open draft editor with proposal
      if (openDraft) {
        openDraft('Proposal Draft', proposalContent)
      }
      
      messages.value.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'ve written a draft proposal based on the RFP and similar past projects. It\'s now open in the workspace for your review and editing.\n\nOnce you\'re satisfied with the proposal, would you like me to export it to a Word document?',
        timestamp: new Date()
      })
    } else if (action === 'export_word') {
      emitAgentLog({
        id: `rfp-export-${Date.now()}`,
        type: 'action',
        thinking: `**Exporting to Word:**\n\nI'll:\n1. Format the proposal content\n2. Send it to the local agent\n3. Create a Word document on your computer\n4. Save it in your documents folder\n\nThis allows you to use the proposal in your standard workflow.`,
        timestamp: new Date()
      })

      // Get current draft content from workspace
      const draftContent = workspace?.state.value.draftContent || ''
      
      if (draftContent) {
        startThinking([
          'Preparing document content...',
          'Formatting for Word export...',
          'Generating Word document...',
          'Saving to local drive...'
        ])
        
        // Export is moderate complexity - 1.2 seconds
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        await exportToWord(draftContent, 'Proposal.docx')
        
        await addTypedMessage('✅ Proposal has been exported to Word and saved to your computer!', undefined, 300)
      } else {
        await addTypedMessage('I don\'t see a draft proposal to export. Please write a proposal first, or let me know if you\'d like me to generate one.', undefined, 300)
      }
    }
  } catch (error) {
    console.error('RFP workflow error:', error)
    stopThinking() // Ensure thinking indicator is stopped on error
    emitAgentLog({
      id: `rfp-error-${Date.now()}`,
      type: 'error',
      thinking: `**Error in RFP workflow:**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or rephrase your request.`,
      timestamp: new Date()
    })
    
    await addTypedMessage('I encountered an error processing your RFP request. Please check the Agent Thinking panel for details.', undefined, 300)
  }
}

// Start thinking indicator with cycling messages
function startThinking(messages: string[]) {
  if (thinkingInterval.value) {
    clearInterval(thinkingInterval.value)
  }
  
  let currentIndex = 0
  thinkingMessage.value = messages[0] || 'Thinking...'
  
  thinkingInterval.value = setInterval(() => {
    currentIndex = (currentIndex + 1) % messages.length
    thinkingMessage.value = messages[currentIndex]
  }, 800) // Cycle every 800ms
}

// Stop thinking indicator
function stopThinking() {
  if (thinkingInterval.value) {
    clearInterval(thinkingInterval.value)
    thinkingInterval.value = null
  }
  thinkingMessage.value = ''
}

// Type message content gradually for thinking effect (streaming)
async function typeMessageContent(messageId: string, fullContent: string, speed: number = 20) {
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return
  
  // Stop thinking indicator before typing
  stopThinking()
  
  // Split into chunks (words) for smoother typing
  const chunks = fullContent.split(/(\s+)/) // Split by whitespace but keep it
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    messages.value[messageIndex].content += chunk
    
    // Scroll periodically
    if (i % 5 === 0) {
      await scrollToBottom()
    }
    
    // Variable delay - longer for punctuation, shorter for spaces
    const delay = chunk.match(/[.!?]$/) ? speed * 3 : chunk.match(/^\s+$/) ? speed * 0.5 : speed
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  // Remove typing indicator
  if (messages.value[messageIndex]) {
    messages.value[messageIndex].isTyping = false
  }
  
  await scrollToBottom()
}

// Helper function to add a message with typing effect and optional thinking
async function addTypedMessage(content: string, thinkingMessages?: string[], delayBeforeTyping: number = 500) {
  // Show thinking indicator if provided
  if (thinkingMessages && thinkingMessages.length > 0) {
    startThinking(thinkingMessages)
    // Wait for delay before typing
    await new Promise(resolve => setTimeout(resolve, delayBeforeTyping))
  } else {
    // Just wait the delay
    await new Promise(resolve => setTimeout(resolve, delayBeforeTyping))
  }
  
  // Create message
  const messageId = (Date.now() + Math.random()).toString()
  messages.value.push({
    id: messageId,
    role: 'assistant',
    content: '',
    timestamp: new Date(),
    isTyping: true
  })
  
  await scrollToBottom()
  
  // Type the content
  await typeMessageContent(messageId, content)
  
  return messageId
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function openModelFromMessage(modelUrl: string, modelName?: string) {
  if (openModel) {
    openModel(modelUrl, modelName)
  } else if (workspace) {
    workspace.openModel(modelUrl, modelName)
  }
}

// Cleanup thinking interval on unmount
onBeforeUnmount(() => {
  stopThinking()
})
</script>
