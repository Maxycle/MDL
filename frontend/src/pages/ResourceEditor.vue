<template>
	<div class="flex flex-col items-center pt-8 space-y-4 bg-gradient-to-b from-black to-blue-900 min-h-screen">
		<h2 class="text-2xl font-semibold mb-4 text-white text-center">
			{{ isEditMode ? "Modifier le lien" : "Créer un nouveau lien" }}
		</h2>

		<textarea rows="4" cols="50" v-model="content" placeholder="Description du lien"
			class="cursor-pointer placeholder:italic bg-orange-200 px-2 rounded w-2/3"></textarea>

		<input v-model="url" type="text" class="w-2/3 p-2 border rounded mb-4 text-blue-700 text-center bg-orange-200"
			placeholder="url" />

		<div class="flex justify-center mt-4 space-x-4">
			<button @click="saveResource" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
				{{ isEditMode ? 'Mettre à jour' : 'Publier' }}
			</button>
			<button @click="cancel" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
				Annuler
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useResourceStore } from "@/stores/modules/resourceStore"

const router = useRouter()
const route = useRoute()

const url = ref("")
const content = ref("")
const isEditMode = ref(false)
const sessionStore = useSessionStore()
const resourceStore = useResourceStore()
const resourceId = route.params.id

onMounted(async () => {
	if (resourceId) {
		isEditMode.value = true
		try {
			const response = await axios.get(`/api/resources/${resourceId}`)
			url.value = response.data.url
			content.value = response.data.content
		} catch (error) {
			console.error("Erreur de chargement :", error)
			alert("Liens introuvable")
			router.push("/Liens")
		}
	}
})

const saveResource = async () => {
	try {
		const payload = {
			resource: {
				url: url.value,
				content: content.value
			}
		}

		if (isEditMode.value) {
			await axios.put(`/api/resources/${resourceId}`, payload, {
				headers: {
					Authorization: `${sessionStore.getAuthToken}`,
					'Content-Type': 'application/json'
				}
			})
			alert("Lien mis à jour avec succès")
		} else {
			await axios.post("/api/resources", payload, {
				headers: {
					Authorization: `${sessionStore.getAuthToken}`,
					'Content-Type': 'application/json'
				}
			})
			alert("Lien créé avec succès")
		}
		resourceStore.fetchResources()
		router.push("/Liens")
	} catch (error) {
		console.error("Erreur d'enregistrement :", error)
		alert("Impossible d'enregistrer le lien")
	}
}

const cancel = () => {
	router.push("/Liens")
}
</script>
