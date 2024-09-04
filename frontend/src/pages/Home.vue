<template>
	<div class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full h-full" v-cloak>
		<p class=" w-2/3 text-white pt-12 px-8 text-center">{{ storeParams.getParams.intro }}
		</p>
		<div v-if="sessionStore.isLoggedIn" class="text-2xl text-green-500 pt-12">
			<div v-if="scoreStore.getScore.droitNaturel">En <span class="font-extrabold italic">"Droit
					Naturel"</span> vous avez le niveau <span class="font-extrabold">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.droitNaturel.level) }}"</span></div>
			<div v-else class="text-red-600">Vous n'avez pas encore répondu au questionnaire "Droit Naturel"</div>
			<div v-if="scoreStore.getScore.ecoleAutrichienne">En <span class="font-extrabold italic">"Ecole
					Autrichienne"</span> vous avez le niveau <span class="font-extrabold">"{{
						translateInitialsIntoFullWords(scoreStore.getScore.ecoleAutrichienne.level)
					}}"</span></div>
			<div v-else class="text-red-600">Vous n'avez pas encore répondu au questionnaire "Ecole Autrichienne"</div>
		</div>
		<div class="p-4 bg-blue-700 rounded-2xl mt-16 cursor-pointer font-bold text-white">
			<div v-if="!sessionStore.isLoggedIn" @click="router.push('/Login')">Il va falloir commencer par vous identifier
			</div>
			<div v-else @click="router.push('/questionnaire')">Aller au questionnaire</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useScoreStore } from "@/stores/modules/scoreStore"
import { useParamsStore } from "@/stores/modules/paramsStore"

const sessionStore = useSessionStore();
const scoreStore = useScoreStore()
const router = useRouter();
const storeParams = useParamsStore()

onMounted(async () => {
	await storeParams.fetchParams()
	await scoreStore.fetchScores()
})

const translateInitialsIntoFullWords = (initials) => {
	let words = ""
	if (initials === "BA") { words = "Bases Aqccuize" }
	if (initials === "SA") { words = "Sait Analyser" }
	if (initials === "beginner") { words = "Débutant" }
	return words
}
</script>
