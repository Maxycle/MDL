<template>
	<Container>
		<div class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full min-h-screen pt-40">
			<div class="w-[450px] text-center">
				<h2 class="text-2xl bg-[#42b883] rounded-t-lg px-4 pt-4 shadow-md text-orange-700 shadow-black/50">
					Mouvement des Libertariens
				</h2>

				<!-- SVG Wave -->
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<path fill="#42b883" fill-opacity="1"
						d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
				</svg>

				<div class="bg-[#242d36] text-white rounded-b-lg shadow-lg p-8 flex flex-col items-center">
					<div v-if="status === 'success'" class="text-center">
						<div class="text-5xl mb-4 text-green-500">✓</div>
						<h3 class="text-xl mb-4 text-[#42b883]">Demande d'ouverture de compte active</h3>
						<p class="mb-6">
							Votre demande d'ouverture de compte va être étudiée par les membres du comité. Si elle est acceptée, un
							email vous sera envoyé avec un lien pour créer un compte.
						</p>
						<router-link to="/"
							class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 px-4 rounded-lg text-shadow hover:brightness-110 transition-all duration-300">
							Accueil
						</router-link>
					</div>

					<div v-else-if="status === 'error'" class="text-center">
						<div class="text-5xl mb-4 text-red-500">✗</div>
						<h3 class="text-xl mb-4 text-red-400">Validation Failed</h3>
						<p class="mb-6">
							{{ errorMessage }}
							<br><br>
							Votre lien de validation a expiré ou a déjà été utilisé.
						</p>
						<router-link to="/"
							class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 px-4 rounded-lg text-shadow hover:brightness-110 transition-all duration-300">
							Accueil
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Container from '@/components/Container.vue'

const route = useRoute()
const status = ref('')
const errorMessage = ref('Invalid or expired token')

onMounted(() => {
	// Get parameters from URL
	status.value = route.query.status || 'error'

	if (route.query.message) {
		errorMessage.value = decodeURIComponent(route.query.message)
	}
})
</script>