<template>
	<div>
		<div class="relative">
			<input
				type="text"
				id="autocomplete"
				:placeholder="placeholder"
				v-model="selectedItem"
				@input="onInput"
				class="py-2 px-4 flex justify-between items-center rounded w-full shadow-md shadow-black bg-neutral-300 focus:bg-green-200"
			/>
			<ul v-if="dropdownOptions.length" class="absolute z-10 mt-2 bg-white border rounded shadow-md w-full">
				<li
					v-for="item in dropdownOptions"
					:key="item.content"
					@click="selectItem(item.content)"
					class="p-4 rounded hover:bg-blue-500"
				>
					<div>{{ item.content }}</div>
				</li>
			</ul>
		</div>
	</div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '@/stores/modules/sessionStore'

const props = defineProps({
	options: {
		type: Array,
		required: true
	}
})

const selectedItem = ref('')
const filteredItems = ref([])

const placeholder = ref('ta gueule')
const selectionMade = ref(false)
const urlToFetch = ref('/questions')

const sessionStore = useSessionStore()

const dropdownOptions = computed(() => filteredItems.value)


const filterItems = () => {
	selectionMade.value = false
	const query = selectedItem.value.toLowerCase()
	filteredItems.value = query === ''
		? []
		: props.options.filter(item => item.content.toLowerCase().includes(query))
}

const selectItem = (item) => {
	selectedItem.value = item
}

const onInput = () => {
	if (selectedItem.value === '') {
		filteredItems.value = []
	} else {
		filterItems()
	}
}
</script>
