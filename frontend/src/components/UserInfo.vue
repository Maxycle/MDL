<template>
	<div class="w-full text-orange-800">
		<div class="w-full flex justify-center text-6xl font-extrabold font-serif">
			{{ data.username }}
		</div>
		<div class="pl-20 text-xl">
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
			<div v-if="data.scores[0]" class="flex space-x-4">
				<div>"{{ fullWord(data.scores[0].domain) }}":</div>
				<div>{{ fullWord(data.scores[0].level) }}</div>
			</div>
			<div v-if="data.scores[1]" class="flex space-x-4">
				<div>"{{ fullWord(data.scores[1].domain) }}":</div>
				<div>{{ fullWord(data.scores[1].level) }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>

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
</script>