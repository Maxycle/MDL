<template>
	<div
		class="flex text-sm md:text-xl lg:text-2xl font-bold p-4 items-center hover:bg-blueLogoLight rounded-full cursor-pointer transition duration-300">
		<div v-if="!showTick" class="border-2 border-yellowLogo w-4 h-4 mr-2 hover:rotate-spin" />
		<div v-else class="w-12 mr-2 hover:animate-spin flex-shrink-0">
			<Logo />
		</div>
		{{ data.content }}
	</div>
</template>

<script setup>
import { computed } from 'vue';
import { useAnswerStore } from '@/stores/modules/answerStore';
import Logo from "@/components/Logo.vue"

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