<template>
	<div class="bg-blackLogo flex items-center justify-around text-2xl md:text-3xl lg:text-5xl xl:text-6xl w-full">
		<div class="w-10 lg:w-20 xl:w-28 rounded-full rotate-180 ml-4">
			<Logo class="h-full w-full" />
		</div>
		<div class="text-blueLogoLight font-extrabold italic text-center">Mouvement des Libertariens</div>
		<div class="w-10 lg:w-20 xl:w-28 rounded-full mr-4">
			<Logo class="h-full w-full" />
		</div>
	</div>
</template>

<script setup>
import Logo from "@/components/Logo.vue"
</script>
