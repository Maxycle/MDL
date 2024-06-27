<template>
	<div
		class="bg-green-100 text-black flex flex-col divide-y divide-orange-700 divide-solid rounded-lg w-max border-2 border-orange-500">
		<div v-for="(option, index) in props.options.content" :key="option.text"
			class="cursor-pointer p-2 first:rounded-t last:rounded-b"
			:class="[{ 'bg-orange-700 text-white font-extrabold': index === selectedIndex }, { 'hover:bg-green-200': index !== selectedIndex }]"
			@click="select(option.symbol, index)">
			{{ option.text }}
		</div>
	</div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const emit = defineEmits(['optionSelected']);
const selectedIndex = ref(666)
const props = defineProps({
	options: {
		type: Object,
		required: true
	}
})

const select = (option, index) => {
	if (selectedIndex.value === index) {
		emit('optionSelected', '')
		selectedIndex.value = 666
	} else {
		emit('optionSelected', option)
		selectedIndex.value = index
	}
}
</script>
