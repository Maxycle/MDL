<template>
	<div class="w-full text-orange-800">
		<div class="w-full flex justify-center text-6xl font-extrabold font-serif">
			{{ data.username }}
		</div>
		<div class="pl-20 text-xl">
			<div class="flex space-x-4">
				<div>Username:</div>
				<div>{{ data.username }}</div>
			</div>
			<div class="flex space-x-4">
				<div>Prénom:</div>
				<div>{{ data.first_name }}</div>
			</div>
			<div class="flex space-x-4">
				<div>Nom:</div>
				<div>{{ data.last_name }}</div>
			</div>
			<div class="flex space-x-4">
				<div>email:</div>
				<div>{{ data.email }}</div>
			</div>
			<template v-for="score in data.scores" :key="score?.id">
				<div v-if="score" class="flex items-center space-x-4 space-y-4">
					<div class="flex space-x-4 text-3xl">
						<div>"{{ fullWord(score.domain) }}":</div>
						<div>{{ fullWord(score.level) }}</div>
					</div>
					<button class="rounded bg-red-600 p-1 text-black text-sm flex items-center"
						@click="handleScoreDelete(score.id)">
						Supprimer score "{{ fullWord(score.domain) }}"
					</button>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup>
import { useScoreStore } from '@/stores/modules/scoreStore'

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
	emit('userUpdated', props.data.id) // Emit event to update parent
}
</script>