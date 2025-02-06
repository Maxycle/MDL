<template>
	<div class="w-1/2 rounded-lg m-4 bg-stone-700 font-plain hover:scale-105 transition duration-300">
		<div class="flex">
			<img v-if="data.image" :src="data.image" alt="Italian Trulli" width="150" height="100" class="rounded-l-lg">
			<div class="pl-4 w-full">
				<div class="text-xs italic py-2 pl-1">{{ props.created }}, par {{ author.username }}</div>
				<div class="text-center text-3xl font-medium pb-4 pt-2">{{ title }}</div>
				<p class="italic">{{ data.text }}</p>
				<div class="text-blue-400 pt-4 text-center">Lire l'article</div>
			</div>
		</div>

	</div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
	title: {
		type: String,
		required: true
	},
	data: {
		type: Object,
		required: true
	},
	author: {
		type: Object,
		required: true
	},
	created: {
		type: String,
		required: true
	}
})
</script>