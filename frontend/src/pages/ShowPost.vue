<template>
  <div class="post-container">
    <div v-if="post" class="post">
      <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
      
      <div class="post-content bg-red-500 px-20 py-10" v-html="post.content_html"></div>
      
      <!-- <div v-if="post.images && post.images.length" class="post-images mt-4">
        <h2 class="text-xl font-semibold mb-2">Images</h2>
        <div class="grid grid-cols-3 gap-4">
          <img 
            v-for="(image, index) in post.images" 
            :key="index" 
            :src="image" 
            alt="Post image" 
            class="w-full h-auto object-cover rounded"
          />
        </div>
      </div> -->
    </div>
    <div v-else>
      Loading post...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { useSessionStore } from "@/stores/modules/sessionStore"

const post = ref(null)
const route = useRoute()
const sessionStore = useSessionStore()

onMounted(async () => {
  try {
    const response = await axios.get(`/api/posts/${route.params.id}`, {
      headers: {
        Authorization: `${sessionStore.getAuthToken}`
      }
    })
    post.value = response.data
  } catch (error) {
    console.error('Error fetching post:', error)
    // Handle error (e.g., show error message)
  }
})
</script>