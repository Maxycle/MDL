<template>
	<div class="text-white p-4">
	 {{ text }}
	</div>	
 </template>
 
 <script setup>
const props = defineProps({
	text: {
		type: String,
		required: true
	}
});
 </script>