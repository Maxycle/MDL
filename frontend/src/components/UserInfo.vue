<template>
	<div class="w-full text-orange-800">
		<div class="w-full flex justify-center text-6xl font-extrabold text-green-800 font-serif">
			{{ data.username }} {{ adminButtonText === 'Enlever status admin' ? '(admin)' : '' }}
		</div>
		<div class="w-full flex justify-center text-md">{{ data.certification_is_public ? `(${data.username} a rendu sa
			certification publique)` : `(${data.username}
			n'a
			pas rendu sa certification publique)` }}</div>
		<div class="pl-20 text-xl">
			<div class="flex space-x-4">
				<div>Prénom:</div>
				<div class="text-green-800">{{ data.first_name }}</div>
			</div>
			<div class="flex space-x-4">
				<div>Nom:</div>
				<div class="text-green-800">{{ data.last_name }}</div>
			</div>
			<div class="flex space-x-4">
				<div>email:</div>
				<div class="text-green-800 pb-8">{{ data.email }}</div>
			</div>
			<template v-for="score in data.scores" :key="score?.id" class="">
				<div v-if="score" class="flex items-center justify-between py-2 w-5/6 ">
					<div class="flex space-x-4 text-3xl">
						<div>"{{ fullWord(score.domain) }}":</div>
						<div class="text-green-800">{{ fullWord(score.level) }} <span class="text-sm">(fait le {{ formattedDate(score.updated_at) }})</span></div>
					</div>
					<div class="text-black">
						<button
							class="rounded bg-orange-300 p-1 hover:bg-red-600 hover:text-white hover:scale-105 transition duration-300 text-sm flex items-center shadow-lg shadow-stone-600"
							@click="handleScoreDelete(score.id)">
							Supprimer score "{{ fullWord(score.domain) }}"
						</button>
					</div>
				</div>
			</template>
			<div class="text-3xl pb-8">
				<div v-if="!hasDNScore" class="">"Droit Naturel": <span class="text-green-800">{{ data.username }} n'a pas
						encore
						répondu au questionnaire."</span></div>
				<div v-if="!hasEAScore">"Ecole Autrichienne": <span class="text-green-800">{{ data.username }} n'a pas
						encore
						répondu au questionnaire.</span></div>
			</div>
			<div class="flex space-x-4 text-3xl">
				<div>Statut:</div>
				<div class="text-green-800">{{ fullWord(data.certification) }}</div>
			</div>
		</div>
		<div class="w-full flex justify-center">

			<div class="w-1/12">
				<Logo :scores="scoresInitials" :certification="data.certification" />
			</div>
		</div>

		<div class="mt-4 flex flex-col items-center">
			<div v-if="dialogBoxOpen"
				class="flex justify-center items-center bg-yellow-200 rounded-lg p-2 shadow-lg shadow-stone-600">
				<div class="flex text-black items-center">
					<div>{{ sentenceForActionButton }}</div>
					<button
						class="rounded-lg bg-green-300 p-2 ml-4 hover:scale-105 hover:bg-orange-600 hover:text-white transition duration-300"
						@click="dialogBoxOpen = false">Annuler</button>
					<button
						class="rounded-lg bg-orange-300 p-2 ml-4 hover:scale-105 hover:bg-orange-600 hover:text-white transition duration-300"
						@click="updateUser">Valider</button>
				</div>
			</div>

			<div class="flex justify-center space-x-10 text-black mt-4">
				<button
					class="rounded-lg bg-orange-300 p-4 text-3xl hover:scale-105 hover:bg-red-600 hover:text-white transition duration-300 shadow-lg shadow-stone-600"
					@click="openButtonDialogBox('destruction')">Détruire
					compte</button>

				<div class="relative" @mouseover="showMenu()" @mouseout="hideMenu()">
					<div class="rounded-lg bg-green-700 text-white shadow-lg shadow-stone-600 text-3xl p-4">Changer
						certification</div>
					<Menu v-show="hovered" class="absolute -bottom-13 z-10"
						:options="{ content: [{ text: 'Simple Membre', symbol: 'SM' }, { text: 'Membre Certrifié', symbol: 'MC' }, { text: 'Porte Parole', symbol: 'PP' }] }"
						@optionSelected="newCertificationReceived" />
				</div>

				<button
					class="rounded-lg bg-blue-300 p-4 text-3xl hover:scale-105 hover:bg-orange-600 hover:text-white transition duration-300 shadow-lg shadow-stone-600"
					@click="openButtonDialogBox('admin')">
					{{ adminButtonText }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed } from "vue"
import { useScoreStore } from '@/stores/modules/scoreStore'
import { useSessionStore } from '@/stores/modules/sessionStore'
import Menu from '../components/Menu.vue'
import Logo from "@/components/Logo.vue"

const sessionStore = useSessionStore()
const scoreStore = useScoreStore()
const hovered = ref(false)
const newCertification = ref('')
const dialogBoxOpen = ref(false)
const sentenceForActionButton = ref('')
const actionToPerform = ref('')

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
})

const adminButtonText = computed(() => {
	return props.data.admin ? 'Enlever status admin' : 'Donner status admin'
})

const fullWord = ((initials) => {
	switch (initials) {
		case 'beginner':
			return 'débutant'
			break
		case 'BA':
			return 'Bases Acquises'
			break
		case 'SA':
			return 'Sait Analyser'
			break
		case 'SE':
			return 'Sait Extrapoler'
			break
		case 'DN':
			return 'Droit Naturel'
			break
		case 'EA':
			return 'Ecole Autrichienne'
			break
		case 'SM':
			return 'Simple Membre'
			break
		case 'MC':
			return 'Membre Certifié'
			break
		case 'PP':
			return 'Porte Parole'
			break
	}
})

const emit = defineEmits(['userUpdated'])

const hasDNScore = computed(() =>
	props.data.scores?.some(score => score?.domain === 'DN') || false
)

const hasEAScore = computed(() =>
	props.data.scores?.some(score => score?.domain === 'EA') || false
)

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

const handleScoreDelete = async (scoreId) => {
	await scoreStore.deleteScore(scoreId)

	emit('userUpdated', props.data.id) // Emit event to update parent
}

const newCertificationReceived = (option) => {
	newCertification.value = option
	openButtonDialogBox('certification')
}

const openButtonDialogBox = (actionOrNewCertification) => {
	actionToPerform.value = actionOrNewCertification
	dialogBoxOpen.value = true
	switch (actionOrNewCertification) {
		case 'destruction':
			sentenceForActionButton.value = `Detruire le compte de ${props.data.username}`
			break
		case 'admin':
			sentenceForActionButton.value = adminButtonText.value === 'Donner status admin' ? `Rendre ${props.data.username} admin` : `Enlever ${props.data.username} le statut admin`
			break
		case 'certification':
			sentenceForActionButton.value = `Changer la certification de ${props.data.username} à ${newCertification.value}`
			break
	}
}

const updateUser = async () => {
	if (actionToPerform.value === 'destruction') {
		await destroyAccount()
	} else if (actionToPerform.value === 'admin') {
		await changeAdminStatus()
	} else {
		await updateCertification()
	}
	dialogBoxOpen.value = false
}

const updateCertification = async () => {
	try {
		const response = await axios.patch(`/api/admin/users/${props.data.id}/update_certification`,
			{
				certification: newCertification.value
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			}).then(() => {
				emit('userUpdated', props.data.id)
				newCertification.value = ''
			})
	} catch (error) {
		console.error('Error updating certification:', error.message)
	}
}

const destroyAccount = async () => {
	try {
		await axios.delete(`/api/admin/users/${props.data.id}`,
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			}).then(() => {
				emit('userUpdated', 'no id')
			})
	} catch (error) {
		console.error('Error deleting account:', error)
	}
}

const changeAdminStatus = async () => {
	try {
		const action = adminButtonText.value === 'Enlever status admin' ? 'remove' : 'give'
		const response = await axios.patch(`/api/admin/users/${props.data.id}/${action}_admin_status`,
			{},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			}).then(() => {
				emit('userUpdated', props.data.id)
			})
	} catch (error) {
		console.error('Error updating certification:', error.message)
	}
}

const scoresInitials = computed(() => {
	// First check if selectedUserInfo.value and scores exist
	if (!props.data || !props.data.scores) {
		// Return a default value or empty string when scores are not available
		return 'beginner beginner';
	}

	// Initialize variables for domain levels
	let initialsDN = 'beginner';
	let initialsEA = 'beginner';

	// Loop through scores array to find DN and EA domains
	props.data.scores.forEach(score => {
		if (score && score.domain === 'DN') {
			initialsDN = score.level;
		} else if (score && score.domain === 'EA') {
			initialsEA = score.level;
		}
	});

	// Return the combined initials
	return initialsDN + ' ' + initialsEA;
});

const showMenu = () => {
	hovered.value = true
}

const hideMenu = () => {
	hovered.value = false
}
</script>