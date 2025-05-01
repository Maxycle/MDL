<template>
	<div class="">
		<label v-if="props.context !== 'non confirmed users'">
			Qui vous a parlé de libertarien.net ?
		</label>
		<div class="relative mt-1">
			<select v-model="selectedAdmin" class="w-full bg-transparent border-b border-transparent py-2 pr-8
          text-[#e65edfaa] appearance-none cursor-pointer
          focus:border-[#42b883aa] focus:outline-none
          transition-colors duration-300">
				<option :value=null class="">
				</option>
				<option v-for="admin in admins" :key="admin.id" :value="admin.id" class="text-black">
					{{ admin.first_name }} {{ admin.last_name }} ({{ admin.username }})
				</option>
			</select>

			<!-- Placeholder text that shows when no selection -->
			<div v-if="selectedAdmin === null"
				class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-gray-500 pl-1">
				{{ props.context === "non confirmed users" ? 'Filtrer les comptes par admin' : 'Choisissez un admin...' }}
			</div>

			<!-- Down arrow indicator -->
			<div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500"
				:class="{ 'text-[#e65edfaa]': props.context !== 'non confirmed users' }">
				<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
					<path
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
				</svg>
			</div>
		</div>
	</div>
</template>
<script setup>
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'

// Emits definition
const emit = defineEmits(['update:modelValue'])

// Component state
const selectedAdmin = ref(null)
const admins = ref([])

const props = defineProps({
	context: {
		type: String,
		required: false
	}
})

onMounted(() => {
	fetchAdmins()
})

const fetchAdmins = async () => {
	try {
		const response = await axios.get('/api/users/index_admin', {
			withCredentials: false
		})
		admins.value = response.data
	} catch (error) {
		console.error('Error fetching admin users:', error)
	}
}

watch(selectedAdmin, (newValue) => {
	emit('update:modelValue', newValue)
})
</script>