<template>
	<div class="p-2 sm:p-4 mx-2 sm:mx-4">
		{{ text }}
	</div>
</template>

<script setup>
const props = defineProps({
	text: {
		type: String,
		required: true
	}
});
</script>