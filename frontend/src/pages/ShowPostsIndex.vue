<template>
	<Container>
		<div class="flex flex-col grow text-orangeLogo px-8">
			<div class="flex justify-center w-full mb-4">
				<div
					class="text-center text-yellowLogo text-xl sm:text-5xl p-4 border-2 border-orangeLogo bg-blueLogoDark font-extrabold italic rounded-lg mt-2">
					Derniers articles</div>
			</div>
			<div v-if="posts.length">
				<div v-for="(post, postIndex) in posts" :key="post.id" :id="'post-' + post.id" class="">
					<div class="px-4 sm:px-20 text-orangeLogo">
						<div v-if="!expandedPosts.has(post.id)" @click="expandPost(post.id)" class="flex items-center">
							<PostCard :data="processContent(post.content_html)" :title="post.title" :author="post.author"
								:created="formattedDate(post.created)" class="cursor-pointer hover:shadow-lg hover:shadow-yellowLogo" />
							<div v-if="sessionStore.isAdmin" class="space-y-2">
								<div
									class="rounded-lg p-2 ml-8 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="confirmDelete(post.id)">
									Détruire "{{ post.title }}"
								</div>
								<div v-if="post.author.id === sessionStore.getUserId"
									class="rounded-lg p-2 ml-8 text-yellowLogo bg-red-700 h-1/3 hover:scale-105 transition duration-300 cursor-pointer"
									@click.stop="editArticle(post.id)">
									Modifier "{{ post.title }}"
								</div>
							</div>
						</div>
						<div v-else>
							<div
								class="prose prose-lg [&_*]:text-blueLogoLight max-w-none hover:prose-a:text-green-500">
								<div class="text-5xl text-center font-bold font-plain">{{ post.title }}</div>
								<div class="text-xs italic text-center font-plain py-2 pl-1">{{ formattedDate(post.created) }}, par {{
									post.author.first_name }} {{ post.author.last_name }}</div>
								<div v-html="post.content_html" class="font-plain"></div>
							</div>

							<button @click="reducePost(post.id)" class="text-orangeLogo mt-2">
								Fermer l'article
							</button>
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				Loading posts...
			</div>
		</div>
	</Container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { usePostStore } from "@/stores/modules/postStore"
import { useSessionStore } from "@/stores/modules/sessionStore"
import PostCard from "@/components/PostCard.vue"
import Container from "@/components/Container.vue"
import axios from 'axios'
import { useRouter } from "vue-router"
import { useRoute } from 'vue-router'

const postStore = usePostStore()
const sessionStore = useSessionStore()
const router = useRouter()
const route = useRoute()

// Track which posts are expanded (UI state stays in component)
const expandedPosts = ref(new Set())

// Get posts directly from store (reactive)
const posts = computed(() => postStore.getPosts)

onMounted(() => {
  const expandId = Number(route.query.expand)

  if (expandId) {
    // Expand it
    expandedPosts.value.clear()
    expandedPosts.value.add(expandId)

    // Scroll after DOM updates
    nextTick(() => scrollToPost(expandId))
  }
})

const scrollToPost = (postId) => {
  const el = document.getElementById(`post-${postId}`)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

// Truncate function
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
	expandedPosts.value.clear()
	expandedPosts.value.add(postId)
	nextTick(() => scrollToPost(postId))
}

const reducePost = (postId) => {
	expandedPosts.value.delete(postId)
}

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

const confirmDelete = (id) => {
	if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
		destroyPost(id)
	}
}

const destroyPost = async (id) => {
	try {
		await axios.delete(`/api/posts/${id}`, {
			headers: {
				Authorization: `${sessionStore.getAuthToken}`
			}
		})

		// Refresh the posts from the store
		await postStore.fetchPosts()

	} catch (error) {
		console.error('Error deleting post:', error)
		alert('Une erreur est survenue lors de la suppression de l\'article')
	}
}
</script>
