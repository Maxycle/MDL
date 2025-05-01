<template>
	<div class="flex flex-col items-center justify-center bg-neutral-600 h-full">
		<div class="border-2 anarcap-border bg-green-500 p-2 rounded mb-4 cursor-pointer" @click="downloadQuestions">
			Download les questions/réponses</div>
			<div class="border-2 anarcap-border bg-green-500 p-2 rounded mb-4">
				<p class="text-center pb-2">Upload questions/réponses</p>
				<FileUpload class="border-2 anarcap-border rounded p-4" />
			</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import FileUpload from '@/components/FileUpload.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore()

const downloadQuestions = async () => {
	try {
		const response = await axios.get('/api/questions/export', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			},
			responseType: 'blob'
		})

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
