<template>
	<Container>
		<div class="px-12">
			<div v-if="resources.length" class="text-yellowLogo">
				<div v-for="resource in resources">
					<div class="p-2 my-2 rounded-2xl bg-stone-600 text-center">
						<div class="text-orangeLogo">
							{{ resource.content }}
						</div>
						 <a :href="resource.url" class="text-blue-400">{{ resource.url }}</a> 
						<div v-if="sessionStore.isAdmin" class="flex items-center justify-center mt-2 space-x-2">
								<div
									class="rounded-lg p-2 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="confirmDelete(resource.id)">
									Détruire
								</div>
								<div v-if="resource.author.id === sessionStore.getUserId"
									class="rounded-lg p-2 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="editResource(resource.id)">
									Modifier
								</div>
							</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</template>

<script setup>
import Container from "@/components/Container.vue"
import { useRouter } from "vue-router"
import { useResourceStore } from "@/stores/modules/resourceStore"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { computed } from 'vue'
import axios from 'axios'

const resourceStore = useResourceStore()
const sessionStore = useSessionStore()

const router = useRouter()

// Get posts directly from store (reactive)
const resources = computed(() => resourceStore.getResources)

const editResource = (id) => {
	router.push(`/resources/${id}/edit`)
}

const confirmDelete = (id) => {
	if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
		destroyResources(id)
	}
}

const destroyResources = async (id) => {
	try {
		await axios.delete(`/api/resources/${id}`, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})

		// Refresh the posts from the store
		await resourceStore.fetchResources()

	} catch (error) {
		console.error('Error deleting resource:', error)
		alert('Une erreur est survenue lors de la suppression du lien')
	}
}
</script>
