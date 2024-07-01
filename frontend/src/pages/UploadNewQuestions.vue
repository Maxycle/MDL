<template>
	<div class="flex flex-col items-center justify-center bg-neutral-600 h-full">
		<div class="border-2 anarcap-border bg-red-600 p-2 rounded mb-4 cursor-pointer" @click="destroyAllQuestions">Effacer
			TOUTES les questions existantes</div>
		<FileUpload class="border-2 anarcap-border rounded p-4" />
	</div>
</template>

<script setup>
import axios from 'axios'
import FileUpload from '@/components/FileUpload.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();

const destroyAllQuestions = async() => {
	try {
		await axios.delete('/questions/destroy_all', {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})
	} catch (error) {
		console.error(`Error creating:`, error);
	}
}
</script>
