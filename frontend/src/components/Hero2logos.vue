<template>
	<div class="bg-blackLogo flex items-center justify-around text-2xl md:text-3xl lg:text-5xl xl:text-6xl w-full">
		<div class="w-8 md:w-10 lg:w-20 xl:w-28 rounded-full rotate-180">
			<Logo class="h-full w-full" />
		</div>
		<div class="text-blueLogoLight font-extrabold italic">Mouvement des Libertariens</div>
		<div class="w-8 md:w-10 lg:w-20 xl:w-28 rounded-full">
			<Logo class="h-full w-full" />
		</div>
	</div>
</template>

<script setup>
import Logo from "@/components/Logo.vue"
</script>
