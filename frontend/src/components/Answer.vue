<template>
	<div class="flex text-2xl font-bold p-1 items-center hover:bg-blueLogoLight hover:text-yellowLogo rounded-full cursor-pointer transition duration-300 px-4">
		<div v-if="!showTick" class="border-2 border-black w-4 h-4 mr-2" />
		<AnarcapTick v-else class="mr-2" />
		{{ data.content }}
	</div>
</template>

<script setup>
import AnarcapTick from './AnarcapTick.vue';
import { computed } from 'vue';
import { useAnswerStore } from '@/stores/modules/answerStore';

const props = defineProps({
	data: {
		type: Object,
		required: true
	}
})

const answerStore = useAnswerStore();
const showTick = computed(() => {
	return answerStore.getAnswers[props.data.question_id] ? answerStore.getAnswers[props.data.question_id].answer_id === props.data.id : false
})
</script>