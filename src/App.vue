<template>
  <div class="unsubscriber-app">
    <h2>Gmail Auto Unsubscriber</h2>
    <button 
      @click="handleUnsubscribe" 
      :disabled="processing"
      :class="{ processing }"
    >
      {{ buttonText }}
    </button>
    <div class="status">
      <p v-if="status">{{ status }}</p>
      <p v-if="processedCount > 0">
        Successfully unsubscribed from {{ processedCount }} emails!
      </p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
    <div class="options">
      <label>
        <input type="checkbox" v-model="autoUnsubscribe" /> Auto unsubscribe every 10 minutes
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Reactive state variables
const processing = ref(false)
const status = ref('')
const error = ref('')
const processedCount = ref(0)
const autoUnsubscribe = ref(false)
let unsubscribeInterval: NodeJS.Timeout | null = null

// Computed property for button text
const buttonText = computed(() => 
  processing.value ? 'Processing...' : 'Start Unsubscribing'
)

// Function to handle the unsubscribe process
const handleUnsubscribe = async () => {
  processing.value = true
  status.value = 'Scanning emails...'
  error.value = ''

  try {
    // Send a message to the background script to initiate the unsubscribe process
    const response = await chrome.runtime.sendMessage({
      action: 'initiateUnsubscribe',
    })

    if (response?.success) {
      processedCount.value += response.count
      status.value = `Successfully unsubscribed from ${response.count} emails!`
    } else {
      error.value = response?.error || 'Failed to find unsubscribe links.'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred while unsubscribing.'
  } finally {
    processing.value = false
  }
}

// if (autoUnsubscribe.value) {
//   setInterval(() => {
//     if (!processing.value) {
//       handleUnsubscribe()
//     }
//   }, 10 * 60 * 1000) // 10 minutes
// }

// Watcher for auto-unsubscribe toggle
watch(autoUnsubscribe, (newVal) => {
  if (newVal) {
    // Start auto-unsubscribe interval
    unsubscribeInterval = setInterval(handleUnsubscribe, 600000) // Every 10 minutes
    handleUnsubscribe() // Run immediately when enabled
  } else if (unsubscribeInterval) {
    // Clear interval when auto-unsubscribe is disabled
    clearInterval(unsubscribeInterval)
    unsubscribeInterval = null
  }
})

// Cleanup interval on component unmount
onUnmounted(() => {
  if (unsubscribeInterval) {
    clearInterval(unsubscribeInterval)
  }
})
</script>

<style scoped>
.unsubscriber-app {
  width: 300px;
  padding: 20px;
  font-family: Arial, sans-serif;
}

button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.processing {
  background: #808080;
  cursor: not-allowed;
}

.status {
  margin-top: 15px;
  font-size: 0.9em;
}

.error {
  color: #ff4444;
}

.options {
  margin-top: 20px;
}
</style>
