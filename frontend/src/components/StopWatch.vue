<template>
  <div class="font-extrabold text-3xl text-orangeLogo rounded-lg p-4">
    {{ formattedTime }}
    <div v-if="store.user.admin" class="buttons">
      <button @click="start">Start</button><br/>
      <button @click="stop">Stop</button><br/>
      <button @click="reset">Reset</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSessionStore } from '@/stores/modules/sessionStore'
import { useParamsStore } from '@/stores/modules/paramsStore'

const paramsStore = useParamsStore()
const store = useSessionStore();
const emit = defineEmits(['jump', 'time-is-up']);

const initialTime = paramsStore.getParams.questionnaire_time_limit * 60 * 1000;
const remainingTime = ref(initialTime);
const startTime = ref(null);
const running = ref(false);
const animationFrameId = ref(null);
const jumpIntervalId = ref(null);

// Store the last known remaining time in localStorage
const STORAGE_KEY = 'stopwatch_remaining_time';
const START_TIME_KEY = 'stopwatch_start_time';

const formattedTime = computed(() => formatTime(remainingTime.value));

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  // return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateStopwatch() {
  if (!running.value) return;
  
  const currentTime = performance.now();
  const elapsed = currentTime - startTime.value;
  remainingTime.value = Math.max(0, initialTime - elapsed);
  
  // Store current state
  localStorage.setItem(STORAGE_KEY, remainingTime.value.toString());
  localStorage.setItem(START_TIME_KEY, startTime.value.toString());
  
  if (remainingTime.value <= 0) {
    stop();
    emit('time-is-up');
    return;
  }
  
  // Store the animation frame ID so we can cancel it later
  animationFrameId.value = requestAnimationFrame(updateStopwatch);
}

function start() {
  if (running.value) return;
  
  running.value = true;
  startTime.value = performance.now() - (initialTime - remainingTime.value);
  localStorage.setItem(START_TIME_KEY, startTime.value.toString());
  
  // Start the jump emit interval
  jumpIntervalId.value = setInterval(() => emit('jump'), 4000);
  
  // Start the animation frame loop
  animationFrameId.value = requestAnimationFrame(updateStopwatch);
}

function stop() {
  running.value = false;
  localStorage.removeItem(START_TIME_KEY);
  
  // Cancel the animation frame and interval
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
    animationFrameId.value = null;
  }
  if (jumpIntervalId.value) {
    clearInterval(jumpIntervalId.value);
    jumpIntervalId.value = null;
  }
}

function reset() {
  stop();
  remainingTime.value = initialTime;
  localStorage.setItem(STORAGE_KEY, initialTime.toString());
}

// Handle visibility change
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, store the current state
    localStorage.setItem(STORAGE_KEY, remainingTime.value.toString());
    
    // Cancel the animation frame when hidden
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
  } else {
    // Page is visible again, recalculate the time
    const storedStartTime = localStorage.getItem(START_TIME_KEY);
    if (storedStartTime && running.value) {
      startTime.value = Number(storedStartTime);
      animationFrameId.value = requestAnimationFrame(updateStopwatch);
    }
  }
}

onMounted(() => {
  // Check if there was a running timer
  const storedStartTime = localStorage.getItem(START_TIME_KEY);
  const storedRemainingTime = localStorage.getItem(STORAGE_KEY);
  
  if (storedStartTime && storedRemainingTime) {
    startTime.value = Number(storedStartTime);
    remainingTime.value = Number(storedRemainingTime);
    running.value = true;
    animationFrameId.value = requestAnimationFrame(updateStopwatch);
  } else {
    start();
  }
  
  // Add visibility change listener
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  // Clean up all intervals and animation frames
  stop();
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>