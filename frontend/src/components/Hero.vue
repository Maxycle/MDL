<template>
	<div class="relative bg-black flex items-center justify-center">
		<img ref="imageRef" src="/Flag_of_Anarcho-capitalism.png" alt="yellow and black triangles"
			class="absolute inset-0 h-full w-full object-fill md:object-center" />
		<h1 v-for="(letter, index) in 'Mouvement&nbsp;des&nbsp;Libertariens'" 
		class="z-10 text-5xl font-extrabold text-blue-500 hover:text-green-500 hover:animate-spin transition duration-700 " >{{ letter }}</h1>
	</div>
</template>