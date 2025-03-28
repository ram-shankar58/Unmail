<script setup lang="ts">
import { handleUnsubscribe } from './lib/unsubscribeHelper';

</script>

<template>
  <div class="unsubscriber-app">
    <h2>AUto unsubscriber</h2>
    <button 
      @click="handleUnsubscribe"
      :disabled="processing"
      :class="{ processing }""
      >
      {{  buttonText  }}
    </button>

    <div class="status">
      <p v-if=""status">{{  status  }}</p>
      <p v-if ="processedCount > 0 "> Successfully unsubscribed from  {{  processedCount  }} emails!</p>
      <p v-if="error" class="error"> {{  error  }}</p>

    </div>

    <div class="options">
      <label>
        <input type="checkbox" v-model="autoUnsubscribe" > AUto unsubscribe every 10 min </label>
        </div>
  </div>
</template>

<script setup lang="ts">
import  ref, computed, onMounted  from 'vue';
const processing=ref(false)
const status=ref('')
const error=ref('')
const processedCount=ref(0)
const autoUnsubscribe=ref(false)

const buttonText = computed(()=>
processing.value ? 'Processing...' : 'Start Unsubscribing'
)

const handleUnsubscribe = async () =>{
  processing.value=true
  status.value='Scanning emails...'

  try{ 
    const response = await chrome.runtime.senddMessage({
      action:'initaiteUnsubscribe'
    })
    if(response?>success){
      processedCount.value+=response.count
      status.value=`Found ${response.count} unsubscribe targets`
    }
    else{ 
      error.value=response?.error || 'No unsubscribe links found'
    }
  }
  catch (err){
    error.value= err instanceof Error ? err.message: 'Failed to unsubscribe'
  }
  finally{ 
    processing.value=false
    setTimeout(() => {
        status.value=''
        error.value=''
    }, 3000);
  }
}

//auto unsubscribing logic

onMounted(()=>{
  if(autoUnsubscribe.value){
    const interval = setInterval(handleUnsubscribe, 10*60*1000)
    onUnmounted(()=> clearInterval(interval))
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
  font-size: 0.8em;
}
</style>