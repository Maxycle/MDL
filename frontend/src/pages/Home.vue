<template>
	<div class="w-full relative bg-blackLogo h-screen px-2">
		<div class="flex flex-col items-center w-full">
			<p class=" w-3/4 text-sm sm:text-lg text-orangeLogo pt-4 px-8 text-center">{{ storeParams.getParams.intro }}
			</p>
			<div v-if="hasScoreData('droitNaturel')" class="text-md sm:text-lg md:text-2xl pt-20 text-orangeLogo mb-4">
				<span class="font-extrabold italic text-yellowLogo">
					{{ formattedDate(scoreStore.getScore.droitNaturel.updated_at)}}</span> vous avez fait le questionnaire <span class="font-extrabold italic text-yellowLogo">"Droit
					Naturel"</span>. Votre niveau est <span class="font-extrabold text-yellowLogo">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.droitNaturel.level) }}"</span>.
			</div>
			<div v-else class="text-md sm:text-lg md:text-2xl text-blueLogoLight pt-20">Vous n'avez pas encore répondu au questionnaire "Droit Naturel"
			</div>

			<div v-if="hasScoreData('ecoleAutrichienne')" class="text-md sm:text-lg md:text-2xl pt-2 text-orangeLogo mb-4">
				<span class="font-extrabold italic text-yellowLogo">
					{{ formattedDate(scoreStore.getScore.ecoleAutrichienne.updated_at)}}</span> vous avez fait le questionnaire <span class="font-extrabold italic text-yellowLogo">"Ecole
					Autrichienne"</span>. Votre niveau est <span class="font-extrabold text-yellowLogo">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.ecoleAutrichienne.level) }}"</span>.
			</div>
			<div v-else class="text-md sm:text-lg md:text-2xl text-blueLogoLight pt-2">Vous n'avez pas encore répondu au questionnaire "Ecole
					Autrichienne"
			</div>
			<div class="flex w-1/6 justify-center">
				<Logo :scores="scoresInitials" :certification="sessionStore.getUserCertification" class="hover:animate-spin"/>
			</div>
			<div class="font-extrabold italic text-md sm:text-2xl md:text-5xl text-yellowLogo mb-10">{{ certificationSentence }}</div>
			<p v-if="sessionStore.getUserCertification === 'MC' && sessionStore.getUserDetails.wantsToBecomePP === false"
				class="text-white pb-10">
				Vous pouvez maintenant demander à devenir un porte parole du mouvement des libertariens. En cliquant sur le
				bouton, le comité en sera avertit et vous contactera par mail.
			</p>
			<div class="grid grid-cols-2 gap-4 w-1/2">
				<div
					class="rounded-2xl text-xs sm:text-3xl p-4 cursor-pointer font-bold text-blueLogoDark text-center hover:scale-105 transition duration-300 hover:border-green-500 hover:border-2 bg-gradient-to-r from-orangeLogo to-yellowLogo hover:bg-blue-900"
					:class="{ 'col-span-2': sessionStore.getUserCertification !== 'MC' }"
					@click="router.push('/questionnaire')">
					Aller au questionnaire
				</div>
				<div v-if="sessionStore.getUserCertification === 'MC'"
					class="rounded-2xl text-xs sm:text-3xl cursor-pointer p-4 font-bold text-blueLogoDark text-center hover:scale-105 transition duration-300 hover:border-green-500 hover:border-2 bg-gradient-to-l from-orangeLogo to-yellowLogo hover:bg-orange-900"
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
			<div class="flex flex-col items-center">
			<div class="text-white pb-2">Votre profil est {{ sessionStore.getUserDetails.certification_is_public ?
				'publique'
				:
				'privé' }}</div>
			<button class="rounded bg-blueLogoDark p-2 text-yellowLogo" @click="onPrivacyOrPPdemandClick('privacy')">rendre 
				<span :class="{'font-extrabold': !sessionStore.getUserDetails.certification_is_public }">publique</span>/<span :class="{'font-extrabold': sessionStore.getUserDetails.certification_is_public }">privé</span>
			</button>
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
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from "vue"
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


const formattedDate = (dateString) => {
  const date = new Date(dateString);

  const formatted = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
	return formatted.charAt(0).toUpperCase() + formatted.slice(1)
};

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

const certificationSentence = computed(() => {
	switch (sessionStore.getUserCertification) {
		case 'SM':
			return `Vous êtes un Simple Membre`
		case 'MC':
			return `Vous êtes un Membre Certifié`
		case 'PP':
			return `Vous êtes un Porte Parole`
		default:
			return `Vous êtes une chèvre`
	}
})
</script>
