<template>
  <Container>
    <div class="flex flex-col items-center bg-gradient-to-b from-[#14191d] to-blueLogoLight w-full min-h-screen">
      <div class="w-2/3 md:w-1/3 text-center">
        <h2 class="text-lg sm:text-2xl bg-[#42b883] rounded-t-lg px-4 pt-4 shadow-md text-orange-700 shadow-black/50">
          Récupération de mot de passe
        </h2>
        <!-- Same SVG wave -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#42b883" fill-opacity="1"
                d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
        </svg>
        <div>
          <form @submit.prevent="requestReset"
                class="bg-[#242d36] text-white rounded-b-lg shadow-lg flex flex-col overflow-hidden">
            <div class="px-4 py-4 text-left">
              <p class="text-sm mb-4">Entrez votre adresse email pour recevoir les instructions de réinitialisation.</p>
              <div class="flex flex-col gap-1.5 py-2.5">
                <label for="email" class="text-sm text-[#e65edfaa]">Email</label>
                <input v-model="email" type="email" placeholder="Votre adresse email" name="email" required
                       class="text-xs sm:text-lg bg-transparent border-b border-transparent py-2 focus:border-[#42b883aa] focus:outline-none transition-colors duration-300">
              </div>
            </div>
            <button
              class="text-orange-700 bg-gradient-to-br from-[#229968] to-[#26634c] font-semibold py-2.5 text-shadow hover:brightness-110 transition-all duration-300">
              Envoyer les instructions
            </button>
            <div class="text-center py-3">
              <router-link 
                :to="{ name: 'Login' }" 
                class="text-[#42b883] hover:text-[#e65edf] text-sm transition-colors duration-300">
                Retour à la connexion
              </router-link>
            </div>
          </form>
          <div v-if="error" class="text-red-600 mt-2">{{ error }}</div>
          <div v-if="success" class="text-green-500 mt-2">{{ success }}</div>
        </div>
      </div>
    </div>
  </Container>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import Container from "@/components/Container.vue"
import axios from "axios"

const router = useRouter()
const email = ref("")
const error = ref("")
const success = ref("")

const requestReset = async () => {
  try {
    error.value = ""
    success.value = ""
    
    if (!email.value) {
      error.value = "L'adresse email est requise."
      return
    }
    
    const response = await axios.post('/api/passwords/forgot', { email: email.value })
    
    if (response.status === 200) {
      success.value = "Les instructions de réinitialisation ont été envoyées à votre adresse email."
      email.value = ""
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error
    } else {
      error.value = "Une erreur s'est produite lors de la demande de réinitialisation."
    }
  }
}
</script>