<template>
  <Container>
    <div class="flex flex-col items-center bg-gradient-to-b from-[#14191d] to-blueLogoLight w-full min-h-screen pt-40">
      <div class="w-[450px] text-center">
        <h2 class="text-2xl bg-[#42b883] rounded-t-lg px-4 pt-4 shadow-md text-orange-700 shadow-black/50">
          Réinitialisation du mot de passe
        </h2>
        <!-- Same SVG wave -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#42b883" fill-opacity="1"
                d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
        </svg>
        <div>
          <form @submit.prevent="resetPassword"
                class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">
            <div class="px-4 py-4 text-left">
              <p class="text-sm mb-4">Définissez votre nouveau mot de passe</p>
              
              <div class="flex flex-col gap-1.5 py-2.5">
                <label for="password" class="text-sm text-[#e65edfaa]">Nouveau mot de passe</label>
                <input v-model="password" type="password" placeholder="Entrez un nouveau mot de passe" name="password" required
                       class="bg-transparent border-b border-transparent py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
              </div>
              
              <div class="flex flex-col gap-1.5 py-2.5">
                <label for="password_confirmation" class="text-sm text-[#e65edfaa]">Confirmation du mot de passe</label>
                <input v-model="passwordConfirmation" type="password" placeholder="Confirmez votre nouveau mot de passe" 
                       name="password_confirmation" required
                       class="bg-transparent border-b border-transparent py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
              </div>
            </div>
            <button
              class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300"
              :disabled="loading">
              {{ loading ? 'Chargement...' : 'Réinitialiser le mot de passe' }}
            </button>
          </form>
          <div v-if="errors.length" class="text-red-600 mt-2">
            <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
          </div>
          <div v-if="success" class="text-green-500 mt-2">{{ success }}</div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import Container from "@/components/Container.vue"
import { useSessionStore } from '@/stores/modules/sessionStore'
import axios from "axios"

const router = useRouter()
const route = useRoute()
const sessionStore = useSessionStore();
const token = ref("")
const email = ref("")
const password = ref("")
const passwordConfirmation = ref("")
const errors = ref([])
const success = ref("")
const loading = ref(false)

onMounted(() => {
  // Get the token and email from the URL
  token.value = route.query.token
  email.value = route.query.email
})

const resetPassword = async () => {
  try {
    errors.value = []
    success.value = ""
    loading.value = true
    
    // Validations
    if (password.value !== passwordConfirmation.value) {
      errors.value.push("Les mots de passe ne correspondent pas.")
      loading.value = false
      return
    }
    
    if (password.value.length < 6) {
      errors.value.push("Le mot de passe doit contenir au moins 6 caractères.")
      loading.value = false
      return
    }
    
    const response = await axios.post('/api/passwords/reset', {
      token: token.value,
      email: email.value || sessionStore.getUserEmail,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
			not_forgotten: token.value ? false : true
    })
    
    if (response.status === 200) {
      success.value = "Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion..."
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push({ name: 'Login' })
      }, 2000)
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      if (Array.isArray(err.response.data.error)) {
        errors.value = err.response.data.error
      } else {
        errors.value.push(err.response.data.error)
      }
    } else {
      errors.value.push("Une erreur s'est produite lors de la réinitialisation du mot de passe.")
    }
  } finally {
    loading.value = false
  }
}
</script>