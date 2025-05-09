<!-- Logo.vue -->
<template>
	<img ref="imageRef" :src="logoSource" alt="MDL logo" class="h-full w-full object-fill" />
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
		 case 'beginner SA':
			 return 'MDLlogo3.jpg'
		 case 'BA beginner':
			 return 'MDLlogo4.jpg'
		 case 'BA BA':
			 return 'MDLlogo5.jpg'
		 case 'BA SA':
			 return 'MDLlogo6.jpg'
		 case 'SA beginner':
			 return 'MDLlogo7.jpg'
		 case 'SA BA':
			 return 'MDLlogo8.jpg'
		 case 'SA SA':
			 return 'MDLlogo9.jpg'
		 default:
			 return 'MDLlogo1.jpg'
	 }
 })
 </script>
