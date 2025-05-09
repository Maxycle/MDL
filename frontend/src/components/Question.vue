<template>
	<div class="p-4">
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