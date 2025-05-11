<template>
	<div class="bg-[#14191d] flex items-center justify-center text-7xl text-yellowLogo py-6 font-extrabold">
			<div class="text-orangeLogo italic">M</div>
				<img ref="imageRef" src="/MDLlogoPP.jpg" alt="yellow and black triangles" class="size-20" />
			<div v-for="letter in ['ouvement&nbsp;des&nbsp;Libertariens']" class="pb-2 mr-4 italic tracking-wider">{{ letter }}</div>
	</div>
	<div class="bg-gradient-to-r from-orangeLogo to-yellowLogo h-1 w-full"></div>
</template>