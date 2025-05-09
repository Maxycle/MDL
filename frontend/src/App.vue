<template>
  <div class="flex flex-col h-screen font-lora" v-cloak>
    <!-- Header section with Hero and NavBar -->
    <header class="flex-none">
			<NavBar v-if="sessionStore.isLoggedIn" class="z-50"/>
      <Hero />
      <!-- <NavBar v-if="sessionStore.isLoggedIn" class="z-50"/> -->
    </header>
    
    <!-- Main content area that takes remaining space -->
    <main class="flex-1 overflow-auto">
      <router-view v-slot="{ Component }">
        <transition name="fade-to-black" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import Hero from '@/components/Hero.vue'
import NavBar from '@/components/NavBar.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();

</script>
