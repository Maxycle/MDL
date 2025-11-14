<template>
	<Container>
		<div class="flex flex-col grow text-orangeLogo px-8">
			<div class="flex justify-center w-full mb-4">
				<div class="text-center text-yellowLogo text-xl sm:text-5xl p-4 border-2 border-orangeLogo bg-blueLogoDark font-extrabold italic rounded-lg mt-2">
					Derniers articles
				</div>
			</div>
			<div v-if="posts.length" class="">
				<div v-for="post in posts" :key="post.id" class="">
					<div class="px-4 sm:px-20 text-orangeLogo">
						<div v-if="!isPostExpanded(post.id)" @click="expandPost(post.id)" class="flex items-center">
							<PostCard 
								:data="processContent(post.content_html)" 
								:title="post.title" 
								:author="post.author"
								:created="formattedDate(post.created)" 
								class="cursor-pointer hover:shadow-lg hover:shadow-yellowLogo" 
							/>
							<!-- ... admin buttons ... -->
						</div>
						<div v-else class="prose prose-lg max-w-none hover:prose-a:text-green-500 prose-a:text-blue-500 prose-h1:text-orangeLogo prose-h2:text-orangeLogo prose-h3:text-orangeLogo text-orangeLogo">
							<div class="text-3xl text-center font-bold font-plain">{{ post.title }}</div>
							<div class="text-xs italic text-center font-plain py-2 pl-1">
								{{ formattedDate(post.created) }}, par {{ post.author.username }}
							</div>
							<div v-html="post.content_html" class="font-plain"></div>
							<button @click="reducePost(post.id)" class="text-blueLogoLight mt-2">
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
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from "@/stores/modules/postStore"
import { useSessionStore } from "@/stores/modules/sessionStore"
import PostCard from "@/components/PostCard.vue"
import Container from "@/components/Container.vue"
import axios from 'axios'
import { useRouter } from "vue-router"

const postStore = usePostStore()
const sessionStore = useSessionStore()
const router = useRouter()

// Use computed to make posts reactive to store changes
const posts = computed(() => 
	postStore.getPosts.map(post => ({
		...post,
		showFullContent: post.showFullContent ?? false
	}))
)

// Move showFullContent tracking to the store or use a separate ref
const expandedPostIds = ref(new Set())

const processContent = (html) => {
	const parser = new DOMParser()
	const doc = parser.parseFromString(html, 'text/html')
	const firstImage = doc.querySelector('img')
	const text = doc.body.textContent

	return {
		text: text.length > 200 ? `${text.slice(0, 150)}...` : text,
		image: firstImage ? firstImage.getAttribute('src') : null
	}
}

const expandPost = (postId) => {
	expandedPostIds.value.clear()
	expandedPostIds.value.add(postId)
}

const reducePost = (postId) => {
	expandedPostIds.value.delete(postId)
}

const isPostExpanded = (postId) => {
	return expandedPostIds.value.has(postId)
}

onMounted(async () => {
	// Only fetch if we don't have data yet
	if (postStore.getPosts.length === 0) {
		await postStore.fetchPosts()
	}
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

