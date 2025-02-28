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

				<div v-if="isRegistered">
					<div class="border-2 border-red-500 rounded-lg bg-green-400 p-4 mb-4">
						Votre compte a été créé avec gros succès. Attendez maintenant qu'il soit validé par un admin peu scrupuleux.
						Allez manger un kebab ou faire caca en attendant.
					</div>
					<div class="flex justify-center space-x-4">
						<button class="border-2 border-red-500 rounded-lg bg-blue-400 p-4"
							@click="router.push('/')">Acceuil
						</button>
						<button class="border-2 border-red-500 rounded-lg bg-blue-400 p-4" @click="router.push('/')">Blog</button>
					</div>
				</div>
				<div v-if="!accountConfirmed" class="border-2 border-red-500 rounded-lg bg-green-400 p-4 mb-4">
					Votre compte n'a pas encore été validé.
				</div>

				<div v-else-if="signingIn">
					<form @submit.prevent="signIn"
						class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="email" class="text-sm text-[#e65edfaa] mx-4">Email</label>
							<input v-model="signInEmail" type="text" placeholder="Please enter your email" name="email"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="password" class="text-sm text-[#e65edfaa] mx-4">Password</label>
							<input v-model="signInPassword" type="password" placeholder="Please enter your password" name="password"
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

					<p class="text-green-200 text-sm mt-5">
						No account ? <span
							class="text-[#fac208aa] hover:text-[#42b883] cursor-pointer relative z-10 transition-colors duration-300"
							@click="signingIn = false">Sign up</span>
					</p>
				</div>

				<div v-else-if="!isRegistered">
					<form @submit.prevent="signUp"
						class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="username" class="text-sm text-[#e65edfaa] mx-4">Identifiant</label>
							<input v-model="username" type="text" placeholder="Votre identifiant..." name="username"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#fa7ffaaa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="firstname" class="text-sm text-[#e65edfaa] mx-4">Prénom</label>
							<input v-model="firstname" type="text" placeholder="Votre prénom..." name="firstname"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="lastname" class="text-sm text-[#e65edfaa] mx-4">Nom</label>
							<input v-model="lastname" type="text" placeholder="Votre nom..." name="lastname"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="signUpEmail" class="text-sm text-[#e65edfaa] mx-4">Email</label>
							<input v-model="signUpEmail" type="text" placeholder="Votre email..." name="signUpEmail"
								class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
						</div>

						<!-- Password field with eye icon -->
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="password" class="text-sm text-[#e65edfaa] mx-4">Mot de passe</label>
							<div class="flex flex-row items-center">
								<input v-model="signUpPassword" :type="isHidden ? 'password' : 'text'"
									placeholder="Votre mot de passe..." name="password"
									class="bg-transparent border-b border-transparent flex-grow py-2  ml-4 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
								<FontAwesomeIcon :icon="isHidden ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" @click="toggleHidden"
									class="text-xs cursor-pointer text-white pr-2" />
								<!-- <div class="bg-red-500 p-2">kloug</div> -->
							</div>
						</div>

						<!-- Textarea for intro -->
						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<label for="intro" class="text-sm text-[#e65edfaa] mx-4">Intro</label>
							<textarea v-model="intro" name="intro" placeholder="Expliquez-nous ce que vous foutez là..."
								class="bg-transparent border-b border-transparent mx-4 py-2 min-h-[100px] focus:border-[#42b883aa] focus:outline-none transition-colors duration-300 resize-y"></textarea>
						</div>

						<div class="flex flex-col gap-1.5 py-2.5 text-left">
							<div class="relative mx-4">
								<AdminSelect v-model="selectedAdmin"/>
							</div>
						</div>

						<button
							class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300">
							Valider
						</button>
					</form>

					<div v-if="sessionStore.getErrors.length" class="text-red-600">
						<li v-for="(error, index) in sessionStore.getErrors" :key="index">{{ error }}</li>
					</div>

					<p class="text-green-200 text-sm mt-5">
						Already registered ? <span
							class="text-[#fac208aa] hover:text-[#42b883] cursor-pointer relative z-10 transition-colors duration-300"
							@click="signingIn = true">Sign in</span>
					</p>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import AdminSelect from '@/components/AdminSelect.vue'
import Container from "@/components/Container.vue"

const router = useRouter()
const sessionStore = useSessionStore()
const signInEmail = ref("")
const signInPassword = ref("")
const signUpEmail = ref("")
const signUpPassword = ref("")
const username = ref("")
const firstname = ref("")
const lastname = ref("")
const signingIn = ref(true)
const isHidden = ref(true)
const isRegistered = ref(false)
const intro = ref("")
const selectedAdmin = ref("")
// const admins = ref([])
const accountConfirmed = ref(true)

// watch(signingIn, (newValue) => {
// 	if (!newValue) {  // When signingIn becomes false (switching to signup form)
// 		fetchAdmins()
// 	}
// })

// const fetchAdmins = async () => {
// 	try {
// 		const response = await axios.get('/api/users/index_admin', {
// 			withCredentials: false
// 		})
// 		admins.value = response.data
// 	} catch (error) {
// 		console.error('Error fetching admin users:', error)
// 	}
// }

const signIn = async () => {
	const params = { email: signInEmail.value, password: signInPassword.value, }

	const isSignedIn = await sessionStore.loginUser(params)
	accountConfirmed.value = sessionStore.getUserDetails.confirmed_by_admin_id !== null
	if (isSignedIn && accountConfirmed.value) {
		sessionStore.clearErrors()
		router.push({ name: "Home" })
	}
}

const signUp = async () => {
	const params = {
		email: signUpEmail.value,
		password: signUpPassword.value,
		username: username.value,
		first_name: firstname.value,
		last_name: lastname.value,
		intro: intro.value,  // Changed from bio to intro to match your template
		selected_admin_id: selectedAdmin.value
	}

	isRegistered.value = await sessionStore.registerUser(params)
}

const toggleHidden = () => {
	isHidden.value = !isHidden.value
}
</script>
