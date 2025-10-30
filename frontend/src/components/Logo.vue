<template>
	<img :src="logoSource" alt="MDL logo" class="object-fill rounded-full" />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	scores: {
		type: String,
		default: 'PP'
	},
	certification: {
		type: String,
		default: 'SM'
	}
})

const logoSource = computed(() => {
	if (props.certification === 'PP') return 'MDLlogoPP.jpg'
	switch (props.scores) {
		case 'beginner beginner':
			return 'MDLlogo1.jpg'
		case 'beginner BA':
			return 'MDLlogo2.jpg'
		case 'BA beginner':
			return 'MDLlogo3.jpg'
		case 'BA BA':
			return 'MDLlogo4.jpg'
		case 'BA SA':
			return 'MDLlogo5.jpg'
		case 'SA BA':
			return 'MDLlogo6.jpg'
		case 'SA SA':
			return 'MDLlogo7.jpg'
		case 'SA SE':
			return 'MDLlogo8.jpg'
		case 'SE SA':
			return 'MDLlogo9.jpg'
		default:
			return 'MDLlogoPP.jpg'
	}
})
</script>
