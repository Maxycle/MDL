<template>
	<div class="flex flex-col items-center bg-gradient-to-b from-[#14191d] to-blueLogoLight w-full min-h-screen pt-40">
		<div class="w-[450px] text-center">
			<h2 class="text-2xl bg-[#42b883] rounded-t-lg px-4 pt-4 shadow-md text-orange-700 shadow-black/50">
				Création de compte
			</h2>

			<!-- Wave SVG -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
				<path fill="#42b883" fill-opacity="1"
					d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
			</svg>

			<div v-if="loading" class="text-white text-center p-4">
				<p>Chargement...</p>
			</div>

			<div v-else-if="error" class="border-2 border-red-500 rounded-lg bg-red-400 p-4 mb-4 text-white">
				<p>{{ error }}</p>
				<button @click="goToHome" class="border-2 border-red-500 rounded-lg bg-blue-400 p-4 mt-4">
					Retour à l'accueil
				</button>
			</div>

			<form v-else @submit.prevent="register"
				class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="email" class="text-sm text-[#e65edfaa] mx-4">Email</label>
					<input type="email" id="email" v-model="user.email" :disabled="!!token" placeholder="Votre email..."
						class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
						required>
					<small v-if="token" class="text-sm text-gray-400 mx-4">Votre email est prérempli et ne peut pas être
						modifié.</small>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="username" class="text-sm text-[#e65edfaa] mx-4">Identifiant</label>
					<input type="text" id="username" v-model="user.username" placeholder="Votre identifiant..."
						class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
						required>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="first_name" class="text-sm text-[#e65edfaa] mx-4">Prénom</label>
					<input type="text" id="first_name" v-model="user.first_name" placeholder="Votre prénom..."
						class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
						required>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="last_name" class="text-sm text-[#e65edfaa] mx-4">Nom</label>
					<input type="text" id="last_name" v-model="user.last_name" placeholder="Votre nom..."
						class="bg-transparent border-b border-transparent mx-4 py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
						required>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="intro" class="text-sm text-[#e65edfaa] mx-4">Présentation (optionnel)</label>
					<textarea id="intro" v-model="user.intro" placeholder="Expliquez-nous ce que vous foutez là..."
						class="bg-transparent border-b border-transparent mx-4 py-2 min-h-[100px] focus:border-[#42b883aa] focus:outline-none transition-colors duration-300 resize-y"></textarea>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="password" class="text-sm text-[#e65edfaa] mx-4">Mot de passe</label>
					<div class="flex flex-row items-center">
						<input type="password" id="password" v-model="user.password" placeholder="Votre mot de passe..."
							class="bg-transparent border-b border-transparent flex-grow py-2 ml-4 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
							required minlength="8">
						<span @click="togglePasswordVisibility" class="text-xs cursor-pointer text-white pr-4">
							<font-awesome-icon :icon="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
						</span>
					</div>
				</div>

				<div class="flex flex-col gap-1.5 py-2.5 text-left">
					<label for="confirmPassword" class="text-sm text-[#e65edfaa] mx-4">Confirmer le mot de passe</label>
					<div class="flex flex-row items-center">
						<input type="password" id="confirmPassword" v-model="confirmPassword"
							placeholder="Confirmer votre mot de passe..."
							class="bg-transparent border-b border-transparent flex-grow py-2 ml-4 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300"
							required minlength="8">
						<span @click="toggleConfirmPasswordVisibility" class="text-xs cursor-pointer text-white pr-4">
							<font-awesome-icon :icon="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'" />
						</span>
					</div>
					<div v-if="passwordsNotMatching" class="text-red-500 text-sm mx-4 mt-1">
						Les mots de passe ne correspondent pas.
					</div>
				</div>

				<button type="submit"
					class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300"
					:disabled="isSubmitting || passwordsNotMatching">
					Créer le compte
				</button>

				<div v-if="registrationError" class="text-red-500 p-4 text-center">
					{{ registrationError }}
				</div>
			</form>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '@/stores/modules/sessionStore';
import axios from 'axios';

// Props
const props = defineProps({
	token: {
		type: String,
		required: false,
		default: null
	}
});

// Router and store
const router = useRouter();
const sessionStore = useSessionStore();

// Reactive data
const user = reactive({
	email: '',
	username: '',
	password: '',
	first_name: '',
	last_name: '',
	intro: ''
});
const confirmPassword = ref('');
const registrationError = ref(null);
const isSubmitting = ref(false);
const loading = ref(false);
const error = ref(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Computed properties
const passwordsNotMatching = computed(() => {
	return user.password !== confirmPassword.value && confirmPassword.value !== '';
});

// Methods
const register = async () => {
	if (user.password !== confirmPassword.value) {
		registrationError.value = 'Les mots de passe ne correspondent pas.';
		return;
	}

	isSubmitting.value = true;
	registrationError.value = null;

	const isRegistered = await sessionStore.registerUser(user, props.token)
	if (isRegistered) {
		 sessionStore.clearErrors()
		 router.push({ name: "Login" })
	 }
};

const togglePasswordVisibility = () => {
	showPassword.value = !showPassword.value;
	const passwordInput = document.getElementById('password');
	passwordInput.type = showPassword.value ? 'text' : 'password';
};

const toggleConfirmPasswordVisibility = () => {
	showConfirmPassword.value = !showConfirmPassword.value;
	const confirmPasswordInput = document.getElementById('confirmPassword');
	confirmPasswordInput.type = showConfirmPassword.value ? 'text' : 'password';
};

const goToHome = () => {
	router.push('/');
};

// Check token validity on mount
onMounted(async () => {
	if (props.token) {
		loading.value = true;
		try {
			const response = await axios.get(`/api/validate_signup_token/${props.token}`);
			console.log('la réponse', response)
			if (response.data && response.data.email) {
				user.email = response.data.email;
			}
			console.log('user.email', user.email)
		} catch (err) {
			console.error('Token validation error:', err);
			error.value = 'Lien d\'inscription invalide ou expiré.';
		} finally {
			loading.value = false;
		}
	}
});
</script>