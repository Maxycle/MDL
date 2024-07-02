<template>
  <div class="relative font-extrabold text-xl text-red-500 rounded-lg flex items-center p-4 shadow-lg shadow-neutral-700 hover:animate-spin">
    <div class="z-10">{{ formattedTime }}</div>
		<img ref="imageRef" src="/img/Flag_of_Anarcho-capitalism.png" alt="yellow and black triangles"
			class="absolute inset-0 h-full w-full object-fill md:object-center rounded-lg" />
    <!-- <div class="buttons">
      <button @click="start">Start</button>
      <button @click="stop">Stop</button>
      <button @click="reset">Reset</button>
    </div> -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['jump']);
const initialTime = 30 * 60 * 1000; // 30 minutes in milliseconds
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
