<template>
	<div class="bg-gradient-to-b from-black to-blue-900 w-full h-full relative" v-cloak>

		<div class="absolute top-2 right-10 flex flex-col items-center">
			<div class="text-white pb-2">Votre profile est {{ sessionStore.getUserDetails.certification_is_public ? 'publique'
				:
				'privé' }}</div>
			<button class="rounded bg-blue-200 p-2 text-blue-900" @click="onPrivacyProfileClick()">Rendre profil {{
				!sessionStore.getUserDetails.certification_is_public ? 'publique' :
					'privé' }}</button>
			<div v-if="privacyBoxOpen" class="bg-orange-200 rounded px-2 py-1 mt-2">

				<!-- <label for="password">Current password</label> -->

				<div v-if="isHidden" class="password">
					<input v-model="currentPassword" type="password" placeholder="your current password" name="password">
					<font-awesome-icon icon="fa-solid fa-eye" @click="toggleHidden" class="text-white" />
				</div>

				<div v-else class="password">
					<input v-model="currentPassword" type="text" placeholder="your current password" name="password">
					<font-awesome-icon icon="fa-solid fa-eye-slash" @click="toggleHidden" class="text-white" />
				</div>

			</div>
		</div>
		<div class="flex flex-col items-center">
			<p class=" w-2/3 text-white pt-12 px-8 text-center">{{ storeParams.getParams.intro }}
			</p>
			<div v-if="sessionStore.isLoggedIn" class="text-2xl text-green-500 pt-12">
				<div v-if="scoreStore.getScore.droitNaturel && Object.keys(scoreStore.getScore.droitNaturel).length !== 0">En
					<span class="font-extrabold italic">"Droit
						Naturel"</span> vous avez le niveau <span class="font-extrabold">"{{
							translateInitialsIntoFullWords(scoreStore.getScore.droitNaturel.level) }}"</span>
				</div>
				<div v-else class="text-red-600">Vous n'avez pas encore répondu au questionnaire "Droit Naturel"</div>
				<div
					v-if="scoreStore.getScore.ecoleAutrichienne && Object.keys(scoreStore.getScore.ecoleAutrichienne).length !== 0">
					En <span class="font-extrabold italic">"Ecole
						Autrichienne"</span> vous avez le niveau <span class="font-extrabold">"{{
							translateInitialsIntoFullWords(scoreStore.getScore.ecoleAutrichienne.level)
						}}"</span></div>
				<div v-else class="text-red-600">Vous n'avez pas encore répondu au questionnaire "Ecole Autrichienne"</div>
			</div>
			<div class="font-extrabold italic text-3xl text-orange-700 pt-16">Vous êtes certifié "{{ sessionStore.getUserDetails.certification }}"</div>
			<div class="p-4 bg-blue-700 rounded-2xl mt-16 cursor-pointer font-bold text-white">
				<div v-if="!sessionStore.isLoggedIn" @click="router.push('/Login')">Il va falloir commencer par vous identifier
				</div>
				<div v-else @click="router.push('/questionnaire')">Aller au questionnaire</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useScoreStore } from "@/stores/modules/scoreStore"
import { useParamsStore } from "@/stores/modules/paramsStore"

const sessionStore = useSessionStore();
const scoreStore = useScoreStore()
const router = useRouter();
const storeParams = useParamsStore()
const privacyBoxOpen = ref(false)
const isHidden = ref(true)
const currentPassword = ref("")

onMounted(async () => {
	if (sessionStore.isLoggedIn) {
		await scoreStore.fetchScores()
	}
	await storeParams.fetchParams()
})

const onPrivacyProfileClick = () => {
	if (privacyBoxOpen.value === false) {
		privacyBoxOpen.value = true
	} else {
		update()
		privacyBoxOpen.value = false
	}
}

const update = async () => {
	const params = {
		certification_is_public: !sessionStore.getUserDetails.certification_is_public,
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

const translateInitialsIntoFullWords = (initials) => {
	let words = ""
	if (initials === "BA") { words = "Bases Acquise" }
	if (initials === "SA") { words = "Sait Analyser" }
	if (initials === "beginner") { words = "Débutant" }
	return words
}
</script>
