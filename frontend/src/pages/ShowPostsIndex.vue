<template>
	<Container>
		<div class="h-screen">
			<div class="flex justify-center w-full mb-4">
				<div class="text-center text-blueLogoDark text-5xl p-4">Derniers articles</div>
			</div>
			<div v-if="posts.length" class="post">
				<div v-for="(post, postIndex) in posts" :key="postIndex" class="">
					<div class="post-content px-20">
						<div v-if="!post.showFullContent" @click="expandPost(postIndex)" class="flex items-center">
							<PostCard :data="processContent(post.content_html)" :title="post.title" :author="post.author"
								:created="formattedDate(post.created)" class="cursor-pointer " />
							<div v-if="sessionStore.isAdmin"
								class="rounded-lg p-2 bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
								@click.stop="confirmDelete(post.id, postIndex)">
								Détruire à tout jamais
							</div>
						</div>
						<div v-else>
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

// Manage posts and expand state
const posts = ref([])
const postStore = usePostStore()
const sessionStore = useSessionStore()

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
		text: text.length > 200 ? `${text.slice(0, 250)}...` : text,
		image: firstImage ? firstImage.getAttribute('src') : null
	}
	return processedContent
}

// Expand post
const expandPost = (index) => {
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
