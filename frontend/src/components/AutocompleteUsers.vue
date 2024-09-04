<template>
	<div>
		<div class="relative">
			<input type="text" id="autocomplete" :placeholder="placeholder" v-model="inputData" @input="onInput"
				class="py-2 px-4 flex justify-between items-center rounded w-full shadow-md shadow-black bg-orange-100 focus:bg-green-200" />
			<ul v-if="filteredItems.length" class="absolute z-10 mt-2 bg-white border rounded shadow-md w-96">
				<li v-for="(item, itemIndex) in filteredItems" :key="itemIndex" @click="selectItem(item)"
					class="p-4 rounded hover:bg-blue-500 cursor-pointer">
					<div>{{ item.username }}</div>
				</li>
			</ul>
		</div>
	</div>
</template>


<script setup>
import { ref } from 'vue'

const props = defineProps({
	options: {
		type: Array,
		required: true
	}
})

const emit = defineEmits(['user-selected']);
const inputData = ref('')
const filteredItems = ref([])

const placeholder = ref('ta gueule')
const selectionMade = ref(false)

const filterItems = () => {
	selectionMade.value = false
	const query = inputData.value.toLowerCase()
	filteredItems.value = query === ''
		? []
		: props.options.filter(item => item.username.toLowerCase().includes(query))
}

const selectItem = (item) => {
	emit('user-selected', item)
	filteredItems.value = []
	inputData.value = ''
}

const onInput = () => {
	if (inputData.value === '') {
		filteredItems.value = []
	} else {
		filterItems()
	}
}
</script>
