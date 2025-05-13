<template>
	<button class="p-4 text-nowrap hover:w-full" :class="{
		'transition hover:text-orangeLogoDark hover:z-20 duration-300': !isActive,
		'text-blueLogoLight font-extrabold bg-blue-100 w-full': isActive
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
