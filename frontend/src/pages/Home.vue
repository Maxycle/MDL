<template>
	<div class="flex flex-col items-center w-full bg-neutral-500 h-full">
		<p class=" w-2/3 text-white pt-12 px-8 text-center">
			Salut les gars, ici on vérifie si vous êtes un communiste de mes deux, un pseudo-communiste à la mord moi le
			noeud,
			un démocrate mielleux et sans intérêt, un minarchiste qui comprends des trucs mais pas tout, un anarchiste qui
			n'est
			plus très loin du bout du tunnel, un austrolapithèque qui brille même quand il dort. Yaura des questions, faudra
			donner des réponses et vous pourrez pas y passer toute la journée passqu'on a d'autres choses à foutre.
		</p>
		<div class="border-2 anarcap-border p-4 bg-red-500 rounded mt-16 cursor-pointer shadow-lg shadow-neutral-700">
			<div v-if="!sessionStore.isLoggedIn" @click="router.push('/Login')">Il va falloir commencer par vous identifier
			</div>
			<div v-else @click="router.push('/questionnaire')">Aller au questionnaire</div>
		</div>
	</div>

</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();
const router = useRouter();

</script>
