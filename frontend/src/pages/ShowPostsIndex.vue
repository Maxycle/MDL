<template>
	<Container>
		<div class="flex flex-col grow text-orangeLogo px-8">
			<div class="flex justify-center w-full mb-4">
				<div
					class="text-center text-yellowLogo text-xl sm:text-5xl p-4 border-2 border-orangeLogo bg-blueLogoDark font-extrabold italic rounded-lg mt-2">
					Derniers articles</div>
			</div>
			<div v-if="posts.length" class="">
				<div v-for="(post, postIndex) in posts" :key="postIndex" class="">
					<div class="px-4 sm:px-20 text-orangeLogo">
						<div v-if="!post.showFullContent" @click="expandPost(postIndex)" class="flex items-center">
							<PostCard :data="processContent(post.content_html)" :title="post.title" :author="post.author"
								:created="formattedDate(post.created)" class="cursor-pointer hover:shadow-lg hover:shadow-yellowLogo" />
							<div v-if="sessionStore.isAdmin" class="space-y-2">
								<div
									class="rounded-lg p-2 ml-8 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="confirmDelete(post.id, postIndex)">
									Détruire "{{ post.title }}"
								</div>
								<div v-if="post.author.id === sessionStore.getUserId"
									class="rounded-lg p-2 ml-8 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="editArticle(post.id)">
									Modifier "{{ post.title }}"
								</div>
							</div>
						</div>
						<div v-else class="prose prose-lg max-w-none hover:prose-a:text-green-500 prose-a:text-blue-500 prose-h1:text-orangeLogo prose-h2:text-orangeLogo prose-h3:text-orangeLogo text-orangeLogo">
							<div class="text-3xl text-center font-bold font-plain">{{ post.title }}</div>
							<div class="text-xs italic text-center font-plain py-2 pl-1">{{ formattedDate(post.created) }}, par {{
								post.author.username }}</div>
							<div v-html="post.content_html" class="font-plain"></div>
							<button @click="reducePost(postIndex)" class="text-blueLogoLight mt-2">
								Fermer l'article
							</button>
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				Loading post...
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePostStore } from "@/stores/modules/postStore"
import { useSessionStore } from "@/stores/modules/sessionStore"
import PostCard from "@/components/PostCard.vue"
import Container from "@/components/Container.vue"
import axios from 'axios'
import { useRouter } from "vue-router"

// Manage posts and expand state
const posts = ref([])
const postStore = usePostStore()
const sessionStore = useSessionStore()
const router = useRouter()

// Truncate function
const processContent = (html) => {
	// Create a DOM parser
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, 'text/html')

	// Extract first image and text
	const firstImage = doc.querySelector('img')
	const text = doc.body.textContent

	// Create return object
	const processedContent = {
		text: text.length > 200 ? `${text.slice(0, 150)}...` : text,
		image: firstImage ? firstImage.getAttribute('src') : null
	}
	return processedContent
}

const expandPost = (index) => {
	// Close all other posts first
	posts.value.forEach((post, i) => {
		if (i !== index) {
			post.showFullContent = false
		}
	})
	// Open the clicked post
	posts.value[index].showFullContent = true
	posts.value[index].content_html = postStore.getPosts[index].content_html // Full content
}

const reducePost = (index) => {
	posts.value[index].showFullContent = false
}

onMounted(async () => {
	await postStore.fetchPosts()
	posts.value = postStore.getPosts.map(post => ({
		...post,
		showFullContent: false, // Add a flag for showing full content
	}))
})

const formattedDate = (date) => {
	return new Date(date).toLocaleDateString('fr-FR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

const editArticle = (id) => {
  router.push(`/posts/${id}/edit`)
}

const confirmDelete = (id, postIndex) => {
	if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
		destroyPost(id, postIndex)
	}
}

const destroyPost = async (id, postIndex) => {
	try {
		await axios.delete(`/api/posts/${id}`, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})

		// Remove the post from local state
		posts.value = posts.value.filter((_, index) => index !== postIndex)

		// Optionally refresh posts from the store
		await postStore.fetchPosts()

	} catch (error) {
		console.error('Error deleting post:', error)
		alert('Une erreur est survenue lors de la suppression de l\'article')
	}
}
</script>
