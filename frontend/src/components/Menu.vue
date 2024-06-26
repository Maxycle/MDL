<template>
	<div class="bg-green-100 text-black flex flex-col divide-y divide-orange-700 divide-solid rounded-lg w-max border-2 border-orange-500">
		<div v-for="(option, index) in props.options" :key="option.text"
			class="cursor-pointer p-2 first:rounded-t-lg last:rounded-b-lg"
			:class="[{'bg-orange-700 text-white': index === selectedIndex }, {'hover:bg-green-200': index !== selectedIndex}]"
			@click="select(option, index)">
			{{ option }}
		</div>
	</div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
const emit = defineEmits(['optionSelected']);
const selectedIndex = ref(666)
const props = defineProps({
	options: {
		type: Array,
		required: true
	}
})

const select = (option, index) => {
	emit('optionSelected', option)
	selectedIndex.value = index
}
</script>
