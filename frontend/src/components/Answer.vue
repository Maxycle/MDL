<template>
	<div class="flex bg-green-100 p-1 items-center">
		<div class="border-2 border-black w-4 h-4 mr-2"></div>
	 {{ text }}
	</div>	
 </template>
 
 <script setup>
const props = defineProps({
	text: {
		type: String,
		required: true
	},
	value: {
		type: Number,
		required: true
	}
});
 </script>