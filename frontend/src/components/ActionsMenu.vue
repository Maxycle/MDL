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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
const route = useRoute();

const sessionStore = useSessionStore();

const items = ref([])

onMounted(() => {
	if (sessionStore.getUserCertification === 'PP') {
		items.value.push({ route: '/utilisateurs', text: 'Membres' },
			{ route: '/utilisateurs-non-confirmes', text: 'Demandes d\'ouverture de compte' },
			{ route: '/account-creation-request', text: 'Coopter un candidat' },
			{ route: '/new-post', text: 'Ecrire un article' },
			{ route: '/reset-password', text: 'Changer votre mot de passe' },
			{ route: '/edit-profile', text: 'Modifier votre profile' })
	} else if (sessionStore.getUserCertification === 'MC') {
		items.value.push({ route: '/account-creation-request', text: 'Coopter un candidat' },
		{ route: '/reset-password', text: 'Changer votre mot de passe' },
		{ route: '/edit-profile', text: 'Modifier votre profile' })
	} else if (sessionStore.getUserCertification === 'SM') {
		items.value.push({ route: '/reset-password', text: 'Changer votre mot de passe' },
		{ route: '/edit-profile', text: 'Modifier votre profile' })
	}

	if (sessionStore.isAdmin) {
		items.value.push({ route: '/upload-nouvelles-questions', text: 'Upload nouvelle liste de questions' }, { route: '/questionnaire-paramètres', text: 'Changer les paramèetres de questionnaire' })
	}
})

const isRouteActive = (path) => {
	return route.path === path;
}
</script>
