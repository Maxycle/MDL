<template>
	<div class="flex flex-col items-center justify-center bg-neutral-600 h-full">
		<div class="border-2 anarcap-border bg-green-500 p-2 rounded mb-4 cursor-pointer" @click="downloadQuestions">
			Download les questions/réponses</div>
		<div v-if="deletedResponseMessage" class="text-3xl text-red-500 pb-4">{{ deletedResponseMessage }}</div>
		<div v-else class="border-2 anarcap-border bg-red-500 p-2 rounded mb-4 cursor-pointer" @click="destroyAllQuestions">
			Effacer
			TOUTES les questions existantes</div>
		<FileUpload class="border-2 anarcap-border rounded p-4" @questions-uploaded="deletedResponseMessage = ''" />
	</div>
</template>

<script setup>
import axios from 'axios'
import { ref } from "vue"
import FileUpload from '@/components/FileUpload.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();
const deletedResponseMessage = ref('')

const destroyAllQuestions = async () => {
	try {
		const response = await axios.delete('/api/questions/destroy_all', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
		deletedResponseMessage.value = `${response.data.message}, ${response.data.deleted_count} questions deleted`
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}

const downloadQuestions = async () => {
	try {
		const response = await axios.get('/api/questions/export', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			},
			responseType: 'blob'
		})
		console.log('ze Excdel !!', response.data)

		// Create a new Blob object using the response data
		const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
		const url = URL.createObjectURL(blob)

		// Create a link element
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `questions-${new Date().toISOString().split('T')[0]}.xlsx`);

		// Append the link to the body
		document.body.appendChild(link);

		// Programmatically click the link to trigger the download
		link.click()

		// Clean up
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}
</script>
