<template>
	<Container>
		<div class="">
			C'est ici qu'on essplique tout
		</div>
	</Container>
</template>

<script setup>
import Container from "@/components/Container.vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
</script>
