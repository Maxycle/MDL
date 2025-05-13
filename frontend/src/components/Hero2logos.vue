<template>
	<div class="bg-blackLogo flex items-center justify-around">
		<img src="/MDLlogoPP.jpg" alt="yellow and black triangles" class="w-1/12 md:w-1/10 lg:w-1/12 rotate-180" />
		<div class="flex">
			<h1 v-for="(letter, index) in 'Mouvement&nbsp;des&nbsp;Libertariens'"
				class="flex z-10 text-7xl font-extrabold italic text-blueLogoLight hover:text-green-500 hover:animate-spin transition duration-700">
				{{ letter }}</h1>
		</div>
		<img src="/MDLlogoPP.jpg" alt="yellow and black triangles" class="w-1/12 md:w-1/10 lg:w-1/12" />
	</div>
</template>