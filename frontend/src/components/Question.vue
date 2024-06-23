<template>
	<div class="border-4 rounded-lg text-black anarcap-border bg-orange-100 p-4">
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