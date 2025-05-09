<template>
	<div class="bg-[#14191d] flex items-center justify-around">
		<img ref="imageRef" src="/MDLlogoPP.jpg" alt="yellow and black triangles" class="w-1/12 md:w-1/10 lg:w-1/12" />
		<div class="flex">
			<h1 v-for="(letter, index) in 'Mouvement&nbsp;des&nbsp;Libertariens'"
				class="flex z-10 text-5xl font-extrabold text-blueLogoLight hover:text-green-500 hover:animate-spin transition duration-700 ">
				{{ letter }}</h1>
		</div>
		<img ref="imageRef" src="/MDLlogoPP.jpg" alt="yellow and black triangles" class="w-1/12 md:w-1/10 lg:w-1/12" />
	</div>
	<div class="bg-gradient-to-r from-orangeLogo to-yellowLogo h-1 w-full"></div>
</template>