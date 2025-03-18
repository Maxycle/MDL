<template>
	<div class="w-full text-orange-800">
		<div class="w-full flex justify-center text-6xl font-extrabold text-green-800 font-serif">
			{{ data.username }}
		</div>
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
				<div class="text-green-800">{{ data.email }}</div>
			</div>
			<template v-for="score in data.scores" :key="score?.id">
				<div v-if="score" class="flex items-center space-x-4 space-y-4">
					<div class="flex space-x-4 text-3xl">
						<div>"{{ fullWord(score.domain) }}":</div>
						<div class="text-green-800">{{ fullWord(score.level) }}</div>
					</div>
					<button class="rounded bg-red-600 p-1 text-black text-sm flex items-center"
						@click="handleScoreDelete(score.id)">
						Supprimer score "{{ fullWord(score.domain) }}"
					</button>
				</div>
			</template>
			<div class="flex space-x-4 text-3xl">
				<div>certification:</div>
				<div class="text-green-800">{{ data.certification }}</div>
			</div>
			<div>{{ data.certification_is_public ? `${data.username} a rendu sa certification publique` : `${data.username}
				n'a
				pas rendu sa certification publique` }}</div>
		</div>
	</div>
</template>

<script setup>
import axios from 'axios';
import { useScoreStore } from '@/stores/modules/scoreStore'
import { useSessionStore } from '@/stores/modules/sessionStore'

const sessionStore = useSessionStore()
const scoreStore = useScoreStore()

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
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
		case 'DN':
			return 'Droit Naturel'
			break
		case 'EA':
			return 'Ecole Autrichienne'
			break
	}
})

const emit = defineEmits(['userUpdated'])

const handleScoreDelete = async (scoreId) => {
	await scoreStore.deleteScore(scoreId)
	await updateCertification('lalalallalaalal')

	emit('userUpdated', props.data.id) // Emit event to update parent
}

const updateCertification = async (newCertification) => {
	try {
		const userId = sessionStore.getUserId

		await axios.patch(`/api/admin/users/${props.data.id}/update_certification`,
			{
				certification: newCertification
			},
			{
				headers: {
					Authorization: `${sessionStore.getAuthToken}`
				}
			})
	} catch (error) {
		console.error('Error updating certification:', error.message)
	}
}
</script>