<template>
	<button class="p-4 text-nowrap hover:w-full" :class="{
		'transition hover:text-blue-300 hover:z-20 duration-300': !isActive,
		'text-blue-900 font-extrabold bg-blue-100 w-full': isActive
	}">
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
	}
}
</script>
