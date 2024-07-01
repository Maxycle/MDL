<template>
	<div class="bg-neutral-500">
		<input type="file" @change="onFileChange" accept=".csv" />
		<button @click="uploadFile">
			<div class="border-2 anarcap-border bg-blue-500 rounded p-2">Upload CSV</div></button>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();

const file = ref(null);

const onFileChange = (event) => {
	file.value = event.target.files[0];
};

const uploadFile = async () => {
	if (!file.value) return;

	const formData = new FormData();
	formData.append('file', file.value);

	try {
		const response = await axios.post('/csv_uploads', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: `${sessionStore.getAuthToken}`
			},
		});
		console.log('CSV upload error', response)
		alert(response.data.message);
	} catch (error) {
		alert('Error uploading file');
	}
};
</script>
