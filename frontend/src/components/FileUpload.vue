<template>
	<div class="bg-neutral-500">
		<input type="file" @change="onFileChange" accept=".xlsx" />
		<button @click="uploadFile" :disabled="isLoading">
			<div class="border-2 anarcap-border bg-blue-500 rounded p-2">
				<span v-if="isLoading">Uploading...</span>
				<span v-else>Upload XLSX</span>
			</div>
		</button>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();

const file = ref(null);
const isLoading = ref(false);
const emit = defineEmits(['questions-uploaded'])

const onFileChange = (event) => {
	file.value = event.target.files[0];
};

const uploadFile = async () => {
	emit('questions-uploaded')
	if (!file.value || isLoading.value) return;

	const formData = new FormData();
	formData.append('file', file.value);

	isLoading.value = true;

	try {
		const response = await axios.post('/api/xlsx_uploads', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `${sessionStore.getAuthToken}` // Ensure this is correct for your app
				// Authorization: `Bearer ${sessionStore.getAuthToken()}` // Ensure this is correct for your app
			},
		});
		alert(response.data.message);
	} catch (error) {
		console.error('Upload error:', error.response?.data || error.message);
		alert('Error uploading file: ' + (error.response?.data.error || error.message));
	} finally {
		isLoading.value = false;
	}
};
</script>
