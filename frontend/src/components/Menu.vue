<template>
	<div
		class="bg-green-100 text-black flex flex-col divide-y divide-orange-700 divide-solid rounded-lg w-max border-2 border-orange-500">
		<div v-for="(option, index) in props.options.content" :key="option.text"
			class="cursor-pointer p-2 first:rounded-t last:rounded-b"
			:class="[{ 'bg-orange-700 text-white font-extrabold': option.symbol === selectedOption || option.symbol === selected }, { 'hover:bg-green-200': option.symbol !== selected && option.symbol !== selectedOption}]"
			@click="select(option.symbol)">
			{{ option.text }}
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['optionSelected']);
const selected = ref('')
const props = defineProps({
	options: {
		type: Object,
		required: true
	},
	selectedOption: {
		type: String,
		default: ''
	}
})

const select = (option) => {
	if (selected.value === option) {
		emit('optionSelected', '')
		selected.value = ''
	} else {
		emit('optionSelected', option)
		selected.value = option
	}
}
</script>
