<template>
	<div class="flex flex-col items-center w-full bg-neutral-500 h-full" v-cloak>
		<p class=" w-2/3 text-white pt-12 px-8 text-center">
			Salut les gars, ici on vérifie si vous êtes un communiste de mes deux, un pseudo-communiste à la mord moi le
			noeud,
			un démocrate mielleux et sans intérêt, un minarchiste qui comprends des trucs mais pas tout, un anarchiste qui
			n'est
			plus très loin du bout du tunnel, un austrolapithèque qui brille même quand il dort. Yaura des questions, faudra
			donner des réponses et vous pourrez pas y passer toute la journée passqu'on a d'autres choses à foutre.
		</p>
		<div class="text-2xl text-green-500 pt-12">
			<div v-if="droitNaturelInitails">En <span
					class="font-extrabold italic">"Droit Naturel"</span> vous avez le niveau <span class="font-extrabold">"{{
				translateInitialsIntoFullWords(scoreStore.getScore.droitNaturel.level) }}"</span></div>
			<div v-if="ecoleAutrichienneInitails">En <span
					class="font-extrabold italic">"Ecole Autrichienne"</span> vous avez le niveau <span
					class="font-extrabold">"{{ translateInitialsIntoFullWords(scoreStore.getScore.ecoleAutrichienne.level)
					}}"</span></div>
		</div>
		<div class="border-2 anarcap-border p-4 bg-red-500 rounded mt-16 cursor-pointer shadow-lg shadow-neutral-700">
			<div v-if="!sessionStore.isLoggedIn" @click="router.push('/Login')">Il va falloir commencer par vous identifier
			</div>
			<div v-else @click="router.push('/questionnaire')">Aller au questionnaire</div>
		</div>
	</div>

</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useScoreStore } from "@/stores/modules/scoreStore"

const sessionStore = useSessionStore();
const scoreStore = useScoreStore()
const router = useRouter();

const droitNaturelInitails = ref('')
const ecoleAutrichienneInitails = ref('')

onMounted(async () => {
	await scoreStore.fetchScores()
	droitNaturelInitails.value = scoreStore.getScore.droitNaturel.level
	ecoleAutrichienneInitails.value = scoreStore.getScore.ecoleAutrichienne.level
})

const translateInitialsIntoFullWords = (initials) => {
	let words = ""
	if (initials === "BA") { words = "Bases Aqccuize" }
	if (initials === "SA") { words = "Sait Analyser" }
	if (initials === "beginner") { words = "Gros Nul" }
	return words
}
</script>
