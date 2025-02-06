<template>
	<button class="relative text-white hover:text-orange-500  hover:font-extrabold rounded-lg shadow-red-400 p-4 shadow-lg"
		@mouseover="showImage" @mouseout="hideImage">
		<img ref="imageRef" src="/Flag_of_Anarcho-capitalism.png" alt="yellow and black triangles"
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
