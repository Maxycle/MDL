<template>
	<div
		class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full h-full pt-40 text-orange-500 text-3xl">
		<p v-if="message">{{ message }}</p>
		<p v-else>Confirming your email...</p>
		<button v-if="isConfirmed" class="border-2 border-orange-500 rounded-lg p-4 bg-orange-300 text-black mt-6"
			@click="goToLogin">Aller à la page de connection</button>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/modules/sessionStore'

const router = useRouter()
const message = ref(null)
const isConfirmed = ref(false)
const sessionStore = useSessionStore()

const confirmEmail = async () => {
	const params = new URLSearchParams(window.location.search)
	const confirmationToken = params.get('confirmation_token')
	console.log('Sending confirmation token:', confirmationToken);
	try {
		isConfirmed.value = await sessionStore.confirmEmail(confirmationToken)
		if (isConfirmed.value) {
			message.value = 'Email confirmé, vous pouvez vous connecter.'
		} else {
			message.value = 'Email pas confirmé. Réessayez.'
		}
	} catch (error) {
		message.value = 'Erreur pendant la confirmation.'
	}
}

const goToLogin = () => {
	router.push('/Login')
}

onMounted(confirmEmail)
</script>
