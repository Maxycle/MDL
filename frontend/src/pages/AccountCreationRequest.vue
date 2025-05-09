<template>
	<Container>
		<div class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full min-h-screen pt-40">
			<div class="w-[450px] text-center">
				<h2 class="text-2xl bg-[#42b883] rounded-t-lg px-4 pt-4 shadow-md text-orange-700 shadow-black/50">Mouvement des
					Libertariens
				</h2>

				<!-- Keep your SVG as is since it's a decorative element -->
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<!-- eslint-disable-next-line max-len -->
					<path fill="#42b883" fill-opacity="1"
						d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
				</svg>

				<div v-if="errorMessage">{{ errorMessage }}</div>
				<div v-else-if="!sessionStore.getUserId && fullname">
					<div class="border-2 border-red-500 rounded-lg bg-green-600 p-4 mb-4">
						{{ fullname }}, veuillez valider votre demande d'ouverture de compte en cliquant le lien qui vous a été envoyé par email.
					</div>
				</div>
				<div v-else-if="sessionStore.getUserId && fullname">
					<div>
						Une demande d'ouverture de compte a été créée pour {{ fullname }}.
					</div>
					<button class="rounded-lg bg-green-700 p-4 mt-10" @click="resetForm">
						Nouvelle demande
					</button>
				</div>

				<div v-else-if="!isRegistered">
					<form @submit.prevent="sendRequest"
						class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="firstname" class="text-sm text-[#e65edfaa] mx-4">Prénom</label>
							<input v-model="firstname" type="text"
								:placeholder="sessionStore.getUserId ? 'Prénom du coopté' : 'Votre prénom...'" name="firstname"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="lastname" class="text-sm text-[#e65edfaa] mx-4">Nom</label>
							<input v-model="lastname" type="text"
								:placeholder="sessionStore.getUserId ? 'Nom du coopté' : 'Votre nom...'" name="lastname"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="signUpEmail" class="text-sm text-[#e65edfaa] mx-4">Email</label>
							<input v-model="email" type="text"
								:placeholder="sessionStore.getUserId ? 'email du coopté' : 'Votre email...'" name="email"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<!-- Textarea for intro -->
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="intro" class="text-sm text-[#e65edfaa] mx-4">Motivations</label>
							<textarea v-model="motivations" name="Motivations"
								:placeholder="sessionStore.getUserId ? `Quelles sont vos motivations pour coopter ${firstname} ${lastname} ?` : 'Quelles sont vos motivations pour rejoindre MDL ?'"
								class="bg-transparent border-b border-transparent mx-4 py-2 min-h-[100px] focus:border-[#42b883aa] focus:outline-none transition-colors duration-300 resize-y"></textarea>
						</div>

						<button
							class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300">
							Valider
						</button>
					</form>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref } from "vue"
import Container from "@/components/Container.vue"
import axios from 'axios'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore()
const email = ref("")
const firstname = ref("")
const lastname = ref("")
const motivations = ref("")
const isRegistered = ref(false)
const fullname = ref("")
const errorMessage = ref('')

const sendRequest = async () => {
	const params = {
		email: email.value,
		first_name: firstname.value,
		last_name: lastname.value,
		motivations: motivations.value,
		referencer: sessionStore.getUserId ? sessionStore.getUserId : null,
		validated: sessionStore.getUserId ? true : false
	}

	axios.post('/api/account_creation_request', {
		account_creation_request: params
	}).then(response => {
		fullname.value = `${response.data.first_name} ${response.data.last_name}`
		console.log('account creation request response', response)
	})
		.catch(error => {
			console.error('account creation request failed', error)
			errorMessage.value = error.response.data.email[0] === 'has already been taken' ? 'Une demande d\'ouverture de compte avec cet email existe déjà.' : error.response.data.email[0]
		})
}

const resetForm = () => {
	fullname.value = ''
	firstname.value = ''
	lastname.value = ''
	email.value = ''
	motivations.value = ''
}
</script>
