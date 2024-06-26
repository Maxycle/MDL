<template>
	<div
		class="bg-orange-100 text-black flex flex-col divide-y divide-orange-700 border border-8 border-orange-700 divide-solid rounded-lg w-max">
		<div>
			<NavBarButton :isActive="isRouteActive('/nouvelle-question')" :class="{'bg-orange-800':isRouteActive('/nouvelle-question')}"><span
					class="relative"><router-link to="/nouvelle-question">Créer une nouvelle
						question<br>
						<p class="text-xs">(avec les ptites réponses)</p>
					</router-link></span></NavBarButton>
		</div>
		<div>
			<NavBarButton class="w-full">02</NavBarButton>
		</div>
		<div>
			<NavBarButton class="w-full">03</NavBarButton>
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

const isRouteActive = (path) => {
	return route.path === path;
}

</script>
