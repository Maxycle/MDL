<template>
	<div class="font-extrabold text-3xl text-red-500 rounded-lg p-4">
		{{ formattedTime }}
		<div v-if="store.user.admin" class="buttons">
      <button @click="start">Start</button><br/>
      <button @click="stop">Stop</button><br/>
      <button @click="reset">Reset</button>
    </div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSessionStore } from '@/stores/modules/sessionStore'
import { useParamsStore } from '@/stores/modules/paramsStore'

const paramsStore = useParamsStore()
const store = useSessionStore();
const emit = defineEmits(['jump', 'time-is-up']);
const initialTime = paramsStore.getParams.questionnaire_time_limit * 60 * 1000; // 30 minutes in milliseconds
const remainingTime = ref(initialTime);
let intervalId = null;
let intervalId2 = null;

const formattedTime = computed(() => formatTime(remainingTime.value));

onMounted(() => {
	start()
});

function formatTime(ms) {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const milliseconds = ms % 1000;

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

function updateStopwatch() {
	remainingTime.value -= 10;
	if (remainingTime.value <= 0) {
		clearInterval(intervalId);
		intervalId = null;
		remainingTime.value = 0;
		emit('time-is-up')
	}
}

function start() {
	if (!intervalId) {
		intervalId = setInterval(updateStopwatch, 10);
		setInterval(() => emit('jump'), 4000)
	}
}

function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function reset() {
  clearInterval(intervalId);
  intervalId = null;
	remainingTime.value = initialTime;
}
</script>
