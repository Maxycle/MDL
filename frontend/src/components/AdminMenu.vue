<template>
	<div
		class="bg-orange-100 text-black flex flex-col divide-y divide-orange-700 border-4 border-orange-700 divide-solid rounded-lg w-max">
		<div v-for="(item, index) in items" class="first:rounded-t-lg last:rounded-b-lg">
			<NavBarButton :isActive="isRouteActive(item.route)"
				:class="[{ 'bg-orange-800 text-white': isRouteActive(item.route) }, { 'rounded-t': index === 0 }, { 'rounded-b': index === 2 }]">
				<span class="relative"><router-link :to=item.route>{{ item.text }}
					</router-link></span>
			</NavBarButton>
		</div>
	</div>
</template>

<script setup>
import NavBarButton from "@/components/buttons/NavBarButton.vue"
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
const route = useRoute();

const sessionStore = useSessionStore();
const items = ref([{ route: '/nouvelle-question', text: 'Créer une nouvelle question' },
{ route: '/modifier-question', text: 'Modifier une question' }, 
{ route: '/upload-nouvelles-questions', text: 'Upload nouvelle liste de questions' },
{ route: '/utilisateurs', text: 'Scores des utilisateurs' },
{ route: '/utilisateurs-non-confirmes', text: 'Utilisateurs non confirmés' },
{ route: '/questionnaire-paramètres', text: 'Changer les paramèetres de questionnaire' },
{ route: '/new-post', text: 'Ecrire un article' }
])
const isRouteActive = (path) => {
	return route.path === path;
}

</script>
