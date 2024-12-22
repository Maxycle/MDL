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
import { ref } from 'vue'
import axios from 'axios'
import Editor from '@tinymce/tinymce-vue'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useRouter } from "vue-router"

// Reactive state
const title = ref('')
const content = ref('')
const uploadedImages = ref([])
const sessionStore = useSessionStore()
const router = useRouter()

// Custom image upload handler for TinyMCE
// Custom image upload handler for TinyMCE
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
			withCredentials: true,  // Add this line
			onUploadProgress: (progressEvent) => {
				progress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
			}
		})
			.then(response => {
				const imageUrl = response.data.location
				console.log('Image URL:', imageUrl)
				resolve(imageUrl)
			})
			.catch(error => {
				console.error('Image upload failed', error)
				reject('Image upload failed: ' + error.message)
			})
	})
}

// TinyMCE configuration
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

	// Configure image upload
	images_upload_url: '/api/posts/upload_image', // Your backend upload endpoint
	images_upload_credentials: true,
	images_reuse_filename: true,

	// Optional: Add custom headers to image requests
	images_upload_handler: imageUploadHandler,

	// Add a custom URL filter to append auth token to image URLs
	urlconverter_callback: (url, node, on_save, name) => {
		// Only modify Active Storage URLs
		if (url.includes('active_storage')) {
			return `${url}?auth_token=${sessionStore.getAuthToken}`
		}
		return url
	},

	// Allow paste and drop of images
	paste_data_images: true,
	images_reuse_filename: true,

	// Image handling settings
	file_picker_types: 'image',
	file_picker_callback: (cb) => {
		const input = document.createElement('input')
		input.setAttribute('type', 'file')
		input.setAttribute('accept', 'image/*')

		input.addEventListener('change', (e) => {
			const file = e.target.files[0]

			const reader = new FileReader()
			reader.addEventListener('load', () => {
				// Create a unique blob ID
				const id = 'blobid' + (new Date()).getTime()

				// Use built-in TinyMCE blob cache
				const blobCache = tinymce.activeEditor.editorUpload.blobCache
				const base64 = reader.result.split(',')[1]
				const blobInfo = blobCache.create(id, file, base64)
				blobCache.add(blobInfo)

				// Call the callback with the blob URI and file name
				cb(blobInfo.blobUri(), { title: file.name })
			})

			reader.readAsDataURL(file)
		})

		input.click()
	}
}

// Post creation method
const createPost = async () => {
	// Validate inputs
	if (!title.value || !content.value) {
		alert('Please fill in all fields')
		return
	}

	const formData = new FormData()
	formData.append('post[title]', title.value)
	formData.append('post[content]', content.value)

	// Append uploaded images if any
	uploadedImages.value.forEach((imageUrl, index) => {
		formData.append(`post[images][${index}]`, imageUrl)
	})

	try {
		const response = await axios.post('/api/posts', formData, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`,
				'Content-Type': 'multipart/form-data'
			}
		})

		// Handle successful post creation
		console.log('Post created successfully', response.data)
		router.push(`/`)
		// router.push(`/posts/${response.data.id}`)
		// Optional: Reset form or navigate to another page
	} catch (error) {
		// Handle error
		console.error('Error creating post', error)
		alert('Failed to create post')
	}
}
</script>
