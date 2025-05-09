<template>
	<div v-if="isVisible" class="fixed inset-0 bg-[#14191d] bg-opacity-100 flex justify-center items-center z-10">
		<div class="relative bg-gradient-to-r from-orangeLogo to-yellowLogo rounded-lg max-w-lg w-full text-blue-900">
			<div class=" bg-white/30 backdrop-invert backdrop-opacity-20 rounded-lg p-8">
				<h2 class="text-2xl mb-4 text-center">{{ title }}</h2>
				<div class="modal-body">
					<slot></slot> <!-- This is where the modal content will go -->
				</div>
				<div class="absolute top-2 right-2 border-2 border-blue-900 p-1 rounded-lg">
					<button @click="handleClose">X</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	title: String,
	isVisible: Boolean,
})
const emit = defineEmits(['close'])

const handleClose = (event) => {
	event.stopPropagation()
	emit('close')
}
</script>