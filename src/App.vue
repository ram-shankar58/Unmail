<template>
  <div class="unsubscriber-app">
    <h2>Gmail Unsubscriber Pro</h2>
    <div class="control-panel">
      <button 
        @click="handleUnsubscribe" 
        :disabled="processing"
        :class="{ processing }"
      >
        {{ buttonText }}
      </button>
      
      <label class="auto-toggle">
        <input type="checkbox" v-model="autoUnsubscribe" />
        Auto-scan every 10 min
      </label>
    </div>
    
    <div class="status-area">
      <div v-if="status" class="status-message">{{ status }}</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div v-if="processedCount > 0" class="success-message">
        Processed {{ processedCount }} unsubscribe links
      </div>
      
      <div v-if="processedUrls.length > 0" class="results">
        <h4>Processed URLs:</h4>
        <ul>
          <li v-for="(url, index) in processedUrls" :key="index">
            <a :href="url" target="_blank" rel="noopener">{{ url }}</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const processing = ref(false)
const status = ref('')
const error = ref('')
const processedCount = ref(0)
const processedUrls = ref([])
const autoUnsubscribe = ref(false)
let unsubscribeInterval = null

const buttonText = computed(() => 
  processing.value ? 'Scanning Email...' : 'Find Unsubscribe Links'
)

const handleUnsubscribe = async () => {
  processing.value = true
  status.value = 'Searching for unsubscribe options...'
  error.value = ''
  processedUrls.value = []

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'initiateUnsubscribe'
    })

    if (response?.success) {
      processedCount.value += response.count
      processedUrls.value = response.processed
      status.value = response.count > 0
        ? `Found ${response.count} unsubscribe links!`
        : 'No unsubscribe links found'
    } else {
      error.value = response?.error || 'Failed to scan email'
    }
  } catch (err) {
    error.value = err.message || 'Extension communication error'
    console.error('Popup error:', err)
  } finally {
    processing.value = false
  }
}

watch(autoUnsubscribe, (newVal) => {
  if (newVal) {
    unsubscribeInterval = setInterval(handleUnsubscribe, 600000) // 10 min
    handleUnsubscribe() // Run immediately
  } else if (unsubscribeInterval) {
    clearInterval(unsubscribeInterval)
    unsubscribeInterval = null
  }
})

onUnmounted(() => {
  if (unsubscribeInterval) {
    clearInterval(unsubscribeInterval)
  }
})
</script>

<style scoped>
.unsubscriber-app {
  width: 400px;
  padding: 16px;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.control-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

button {
  padding: 8px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

button:hover:not(.processing) {
  background: #1765cc;
}

button.processing {
  background: #5f6368;
  cursor: wait;
}

.auto-toggle {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-area {
  margin-top: 12px;
  font-size: 13px;
}

.status-message {
  color: #5f6368;
  margin-bottom: 8px;
}

.error-message {
  color: #d93025;
  margin: 8px 0;
}

.success-message {
  color: #0b8043;
  margin: 8px 0;
  font-weight: 500;
}

.results {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 12px;
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
}

.results h4 {
  margin: 8px 0;
  font-size: 13px;
  color: #202124;
}

.results ul {
  padding-left: 20px;
  margin: 4px 0;
}

.results li {
  margin-bottom: 4px;
  word-break: break-all;
}

.results a {
  color: #1a73e8;
  text-decoration: none;
}

.results a:hover {
  text-decoration: underline;
}
</style>