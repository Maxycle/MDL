<template>
	<div
		class="w-full h-fit lg:flex lg:justify-start sm:w-2/3 md:w-1/2 rounded-lg m-4 bg-stone-600 text-yellowLogo font-plain hover:scale-105 transition duration-300">
			<div class="flex items-center justify-center">
				<img v-if="data.image" :src="data.image" alt="Italian Trulli"
					class="h-20 sm:h-24 md:h-36 lg:h-48 w-20 sm:w-24 md:w-36 lg:w-48 rounded-lg">
			</div>

			<div class="pl-4">
				<div class="text-xs italic py-2 pl-1">{{ props.created }}, par {{ author.first_name }} {{ author.last_name }}</div>
				<p class="text-center text-lg md:text-3xl font-medium pb-4 pt-2 wrap-break-word">{{ title }}</p>
				<p class="italic text-xs sm:text-md md:text-base pr-1">{{ data.text }}</p>
				<div class="text-orangeLogo pt-4 text-center">Lire l'article</div>
			</div>
	</div>
</template>

<script setup>

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