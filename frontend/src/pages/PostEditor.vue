<template>
	<div class="pt-4 px-8 bg-gradient-to-b from-black to-blue-900 min-h-screen">
		<h2 class="text-2xl font-semibold mb-4 text-white text-center">
			{{ isEditMode ? "Modifier l'article" : "Créer un nouvel article" }}
		</h2>

		<input v-model="title" type="text" class="w-full p-2 border rounded mb-4 text-white text-center" placeholder="Titre de l'article" />

		<Editor v-model="content" api-key="rswtyqhzskmtotpree0s4snu5gez565mcte77w2c0iv9o73v" :init="editorConfig" />

		<div class="flex justify-center mt-4">
			<button @click="savePost" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
				{{ isEditMode ? 'Mettre à jour' : 'Publier' }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"
import Editor from "@tinymce/tinymce-vue"
import { useSessionStore } from "@/stores/modules/sessionStore"

const route = useRoute()
const router = useRouter()

const title = ref("")
const content = ref("")
const isEditMode = ref(false)
const postId = route.params.id
const sessionStore = useSessionStore()

// Modified image upload handler
const imageUploadHandler = (blobInfo, progress) => {
	return new Promise((resolve, reject) => {
		const formData = new FormData()
		formData.append('image', blobInfo.blob(), blobInfo.filename())

		axios.post('/api/posts/upload_image',
			formData, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`,
				'Content-Type': 'multipart/form-data'
			},
			withCredentials: true,
			onUploadProgress: (progressEvent) => {
				progress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
			}
		})
			.then(response => {
				const imageUrl = `${response.data.location}`
				resolve(imageUrl)
			})
			.catch(error => {
				console.error('Image upload failed', error)
				reject('Image upload failed: ' + error.message)
			})
	})
}

// Modified TinyMCE configuration
const editorConfig = {
	height: 500,
	toolbar_mode: 'sliding',
	plugins: [
		'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
		'preview', 'anchor', 'searchreplace', 'visualblocks',
		'fullscreen', 'insertdatetime', 'media', 'table',
		'wordcount'
	],
	toolbar: 'undo redo | blocks fontfamily fontsize | ' +
		'bold italic underline strikethrough | ' +
		'link image media | ' +
		'align lineheight | ' +
		'bullist numlist indent outdent',

	// Image handling configuration
	images_upload_handler: imageUploadHandler,
	automatic_uploads: true,
	images_reuse_filename: true,
	paste_data_images: true,

	// Remove the URL converter to prevent URL modification
	convert_urls: false,  // Empêche TinyMCE de modifier l'URL de l'image
	relative_urls: false,  // S'assure que l'URL est absolue
	remove_script_host: false, // Conserve l'hôte dans l'URL
	// Modified image handling settings
	file_picker_types: 'image',
	file_picker_callback: (cb, value, meta) => {
		const input = document.createElement('input')
		input.setAttribute('type', 'file')
		input.setAttribute('accept', 'image/*')

		input.addEventListener('change', (e) => {
			const file = e.target.files[0]
			const reader = new FileReader()

			reader.addEventListener('load', () => {
				const id = 'blobid' + (new Date()).getTime()
				const blobCache = tinymce.activeEditor.editorUpload.blobCache
				const base64 = reader.result.split(',')[1]
				const blobInfo = blobCache.create(id, file, base64)
				blobCache.add(blobInfo)

				cb(blobInfo.blobUri(), { title: file.name })
			})
			reader.readAsDataURL(file)
		})

		input.click()
	}
}

onMounted(async () => {
	if (postId) {
		isEditMode.value = true
		try {
			const response = await axios.get(`/api/posts/${postId}`)
			title.value = response.data.title
			content.value = response.data.content
		} catch (error) {
			console.error("Erreur de chargement :", error)
			alert("Article introuvable")
			router.push("/blog")
		}
	}
})

const savePost = async () => {
	try {
		const payload = {
			post: {
				title: title.value,
				content: content.value
			}
		}

		if (isEditMode.value) {
			await axios.put(`/api/posts/${postId}`, payload, {
				headers: {
					Authorization: `${sessionStore.getAuthToken}`,
					'Content-Type': 'application/json'
				}
			})
			alert("Article mis à jour avec succès")
		} else {
			await axios.post("/api/posts", payload, {
				headers: {
					Authorization: `${sessionStore.getAuthToken}`,
					'Content-Type': 'application/json'
				}
			})
			alert("Article créé avec succès")
		}

		router.push("/blog")
	} catch (error) {
		console.error("Erreur d'enregistrement :", error)
		alert("Impossible d'enregistrer l'article")
	}
}
</script>
