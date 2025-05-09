<template>
	<Container>
		<div class="flex flex-col items-center bg-gradient-to-b from-[#14191d] to-blueLogoLight w-full min-h-screen pt-40">
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

				<div>
					<form @submit.prevent="signIn"
						class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="login" class="text-sm text-[#e65edfaa] mx-4">Email</label>
							<input v-model="signInLogin" type="text" placeholder="Votre email ou username" name="email"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="password" class="text-sm text-[#e65edfaa] mx-4">Password</label>
							<input v-model="signInPassword" type="password" placeholder="Votre mot de passe" name="password"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<button
							class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300">
							Valider
						</button>
					</form>

					<div v-if="sessionStore.getErrors.length" class="text-red-600">
						<li v-for="(error, index) in sessionStore.getErrors" :key="index">{{ error }}</li>
					</div>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import Container from "@/components/Container.vue"

const router = useRouter()
const sessionStore = useSessionStore()
const signInPassword = ref("")
const signInLogin = ref("")

const signIn = async () => {
	const params = { login: signInLogin.value, password: signInPassword.value, }

	const isSignedIn = await sessionStore.loginUser(params)
	if (isSignedIn) {
		sessionStore.clearErrors()
		router.push({ name: "Home" })
	}
}
</script>
