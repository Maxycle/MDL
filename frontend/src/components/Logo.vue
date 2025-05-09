<!-- Logo.vue -->
<template>
	<img ref="imageRef" :src="logoSource" alt="MDL logo" class="h-full w-full object-fill rounded" />
 </template>
 
 <script setup>
 import { computed } from 'vue'
 
 const props = defineProps({
	 certification: {
		 type: String,
		 default: 'PP'
	 }
 })
 
 const logoSource = computed(() => {
	 switch (props.certification) {
		 case 'beginner beginner':
			 return 'MDLlogo1.jpg'
		 case 'beginner BA':
			 return 'MDLlogo2.jpg'
		 case 'BA beginner':
			 return 'MDLlogo3.jpg'
		 case 'BA BA':
			 return 'MDLlogo4.jpg'
		 case 'BA SA':
			 return 'MDLlogo5.jpg'
		 case 'SA BA':
			 return 'MDLlogo6.jpg'
		 case 'SA SA':
			 return 'MDLlogo7.jpg'
		 case 'SA SE':
			 return 'MDLlogo8.jpg'
		 case 'SE SA':
			 return 'MDLlogo9.jpg'
		 default:
			 return 'MDLlogoPP.jpg'
	 }
 })
 </script>
