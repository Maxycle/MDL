<template>
	<div class="pt-4 bg-gradient-to-b from-black to-blue-900 min-h-screen">
		<h1 class="text-center text-3xl text-white">Nouvel article</h1>
		<main id="sample">
			<div class="mx-10">
				<form @submit.prevent="createPost">
					<input v-model="title" placeholder="Titre de l'article"
						class="my-10 text-center w-full text-white cursor-pointer" />
					<Editor api-key="rswtyqhzskmtotpree0s4snu5gez565mcte77w2c0iv9o73v" v-model="content" :init="editorConfig" />
					<div class="flex justify-center mt-4">
						<button type="submit"
							class="text-white bg-black/50 px-4 py-2 rounded cursor-pointer hover:bg-green-500 hover:text-red-500">
							Create Post
						</button>
					</div>
				</form>
			</div>
		</main>
	</div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import axios from 'axios'
import Editor from '@tinymce/tinymce-vue'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useRouter } from "vue-router"

const title = ref('')
const content = ref('')
const sessionStore = useSessionStore()
const router = useRouter()

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

// Modified post creation method
const createPost = async () => {
	if (!title.value || !content.value) {
		alert('Please fill in all fields')
		return
	}

	try {
		// Create post with content including embedded images
		const response = await axios.post('/api/posts', {
			post: {
				title: title.value,
				content: content.value // Content now includes properly authenticated image URLs
			}
		}, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`,
				'Content-Type': 'application/json'
			}
		})

		router.push('/')
	} catch (error) {
		console.error('Error creating post', error)
		alert('Failed to create post')
	}
}

// Clean up TinyMCE instance on component unmount
onUnmounted(() => {
	tinymce.remove()
})
</script>