<template>
	<div class="bg-[#14191d] w-full relative h-full" v-cloak>
		<div class="absolute top-2 right-10 flex flex-col items-center">
			<div class="text-white pb-2">Votre profile est {{ sessionStore.getUserDetails.certification_is_public ? 'publique'
				:
				'privé' }}</div>
			<button class="rounded bg-blue-200 p-2 text-blue-900" @click="onPrivacyOrPPdemandClick('privacy')">Rendre profil
				{{
					!sessionStore.getUserDetails.certification_is_public ? 'publique' :
						'privé' }}</button>
			<div v-if="privacyBoxOpen" class="bg-orange-200 rounded px-2 py-1 mt-2">
				<div v-if="isHidden" class="password">
					<input v-model="currentPassword" type="password" placeholder="mot de passe" name="password">
					<font-awesome-icon icon="fa-solid fa-eye" @click="toggleHidden" class="text-white" />
				</div>

				<div v-else class="password">
					<input v-model="currentPassword" type="text" placeholder="your current password" name="password">
					<font-awesome-icon icon="fa-solid fa-eye-slash" @click="toggleHidden" class="text-white" />
				</div>
			</div>
		</div>
		<div class="flex flex-col items-center w-full">
			<p class=" w-2/3 text-white pt-4 px-8 text-center">{{ storeParams.getParams.intro }}
			</p>
			<div v-if="hasScoreData('droitNaturel')" class="text-2xl text-green-500 pt-12">En
				<span class="font-extrabold italic">"Droit
					Naturel"</span> vous avez le niveau <span class="font-extrabold">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.droitNaturel.level) }}"</span>
			</div>
			<div v-else class="text-2xl text-red-600 pt-12">Vous n'avez pas encore répondu au questionnaire "Droit Naturel"
			</div>
			<div v-if="hasScoreData('ecoleAutrichienne')" class="text-2xl text-green-500">
				En <span class="font-extrabold italic">"Ecole
					Autrichienne"</span> vous avez le niveau <span class="font-extrabold">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.ecoleAutrichienne.level)
					}}"</span></div>
			<div v-else class="text-2xl text-red-600">Vous n'avez pas encore répondu au questionnaire "Ecole Autrichienne"
			</div>
			<div class="w-1/6">
				<Logo :certification="scoresInitials" />
			</div>
			<div class="font-extrabold italic text-5xl text-orange-700 mb-10">Vous êtes certifié "{{
				sessionStore.getUserDetails.certification }}"</div>
			<p v-if="sessionStore.getUserCertification === 'MC' && sessionStore.getUserDetails.wantsToBecomePP === false"
				class="text-white pb-10">
				Vous pouvez maintenant demander à devenir un porte parole du mouvement des libertariens. En cliquant sur le
				bouton, le comité en sera avertit et vous contactera par mail.
			</p>
			<div class="grid grid-cols-2 gap-4 w-1/2">
				<div
					class="rounded-2xl cursor-pointer p-4 font-bold text-white text-center hover:scale-105 transition duration-300 hover:border-green-500 hover:border-2 bg-blue-800 hover:bg-blue-900"
					:class="{ 'col-span-2': sessionStore.getUserCertification !== 'MC' }" @click="router.push('/questionnaire')">
					Aller au questionnaire
				</div>
				<div v-if="sessionStore.getUserCertification === 'MC'"
					class="rounded-2xl cursor-pointer p-4 font-bold text-white text-center hover:scale-105 transition duration-300 hover:border-green-500 hover:border-2 bg-orange-800 hover:bg-orange-900"
					@click="onPrivacyOrPPdemandClick('PPdemand')">
					{{ sessionStore.getUserDetails.wantsToBecomePP === false ? 'Devenir porte parole' : 'annuler la demande de certification porte parole' }}
				</div>
				<div></div>
				<div v-if="PPdemandBoxOpen" class="bg-orange-200 rounded px-2 py-1 mt-2">
					<div v-if="isHidden" class="password flex justify-between items-center">
						<input v-model="currentPassword" type="password" placeholder="mot de passe" name="password">
						<font-awesome-icon icon="fa-solid fa-eye" @click="toggleHidden" class="text-white" />
					</div>
					<div v-else class="password flex justify-between items-center">
						<input v-model="currentPassword" type="text" placeholder="mot de passe" name="password">
						<font-awesome-icon icon="fa-solid fa-eye-slash" @click="toggleHidden" class="text-white" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useScoreStore } from "@/stores/modules/scoreStore"
import { useParamsStore } from "@/stores/modules/paramsStore"
import Logo from "@/components/Logo.vue"

const sessionStore = useSessionStore();
const scoreStore = useScoreStore()
const router = useRouter();
const storeParams = useParamsStore()
const privacyBoxOpen = ref(false)
const PPdemandBoxOpen = ref(false)
const isHidden = ref(true)
const currentPassword = ref("")

onMounted(async () => {
	if (sessionStore.isLoggedIn) {
		await scoreStore.fetchScores()
	}
	await storeParams.fetchParams()
})

const onPrivacyOrPPdemandClick = (field) => {
	if (field === 'privacy') {
		if (privacyBoxOpen.value === false) {
			privacyBoxOpen.value = true;
		} else {
			update(field);
			privacyBoxOpen.value = false;
			currentPassword.value = ''
			isHidden.value = true
		}
	} else if (field === 'PPdemand') {
		if (PPdemandBoxOpen.value === false) {
			PPdemandBoxOpen.value = true;
		} else {
			update(field);
			PPdemandBoxOpen.value = false;
			currentPassword.value = ''
			isHidden.value = true
		}
	}
}

const update = async (field) => {
	const params = field === "privacy" ? {
		certification_is_public: !sessionStore.getUserDetails.certification_is_public,
		current_password: currentPassword.value
	} : {
		wantsToBecomePP: sessionStore.getUserDetails.wantsToBecomePP === false ? true : false,
		current_password: currentPassword.value
	}

	const isUpdated = await sessionStore.updateUser(params)
	if (isUpdated) {
		router.push({ name: "Home" })
	} else {
		console.error("Failed to update user");
	}
}

const toggleHidden = () => {
	isHidden.value = !isHidden.value
}

const hasScoreData = (category) => {
	return scoreStore.getScore[category] &&
		Object.keys(scoreStore.getScore[category]).length !== 0
}

const translateInitialsIntoFullWords = (initials) => {
	let words = ""
	if (initials === "BA") { words = "Bases Acquises" }
	if (initials === "SA") { words = "Sait Analyser" }
	if (initials === "beginner") { words = "Débutant" }
	return words
}

const scoresInitials = computed(() => {
  // Use optional chaining (?.) to safely access nested properties
  const initialsDN = scoreStore.getScore?.droitNaturel?.level || 'beginner'
  const initialsEA = scoreStore.getScore?.ecoleAutrichienne?.level || 'beginner'
  return initialsDN + ' ' + initialsEA
})
</script>
