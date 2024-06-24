<template>
	<button class="relative bg-black text-white hover:text-red-500  hover:font-extrabold rounded-lg shadow-lg 
			shadow-stone-400 p-4 shadow-lg shadow-zinc-600"
		@mouseover="showImage" @mouseout="hideImage">
		<img ref="imageRef" src="/img/Flag_of_Anarcho-capitalism.png" alt="yellow and black triangles"
			class="absolute inset-0 h-full w-full object-fill md:object-center rounded-lg hidden" />
		<slot></slot>
	</button>
</template>

<script>

export default {
	methods: {
		showImage() {
			this.$refs.imageRef.classList.remove("hidden");
		},
		hideImage() {
			this.$refs.imageRef.classList.add("hidden");
		}

	}
}
</script>
