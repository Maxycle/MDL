<template>
	<button class="relative p-4 text-nowrap hover:w-full" :class="{
		'transition hover:text-orange-500 hover:font-extrabold hover:scale-110 hover:z-20 duration-300': !isActive,
		'text-white font-bold bg-orange-700 w-full': isActive
	}" @mouseover="showImage" @mouseout="hideImage">
		<img ref="imageRef" src="/img/Flag_of_Anarcho-capitalism.png"
		alt="yellow and black triangles"
			class="absolute inset-0 h-full w-full object-fill -z-10 md:object-center rounded-lg hidden" />
		<slot></slot>
	</button>
</template>

<script>

export default {
	props: {
		isActive: {
			type: Boolean,
			default: false
		}
	},
	methods: {
		showImage() {
			if (!this.isActive) this.$refs.imageRef.classList.remove("hidden")
		},
		hideImage() {
			this.$refs.imageRef.classList.add("hidden");
		}
	}
}
</script>
