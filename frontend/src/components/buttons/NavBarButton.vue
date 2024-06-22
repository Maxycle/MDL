<template>
	<button class="relative rounded-lg p-4" :class="{
		'transition hover:text-red-500 hover:font-extrabold hover:scale-110 duration-300': !isActive,
		'text-white font-bold bg-orange-700 scale-110': isActive
	}" @mouseover="showImage" @mouseout="hideImage">
		<img ref="imageRef" src="/img/Flag_of_Anarcho-capitalism.png"
		alt="yellow and black triangles"
			class="absolute inset-0 h-full w-full object-fill md:object-center rounded-lg hidden" />
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
