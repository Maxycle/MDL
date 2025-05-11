<template>
	<div class="flex flex-col h-screen font-lora" v-cloak>
		<!-- Header section with randomly selected Hero -->
		<header class="flex-none">
			<NavBar v-if="sessionStore.isLoggedIn && randomNavbar" class="z-50" />
			<component :is="randomHero" />
			<NavBar v-if="sessionStore.isLoggedIn && !randomNavbar" class="z-50" />
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
import Hero2logos from '@/components/Hero2logos.vue'
import NavBar from '@/components/NavBar.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const sessionStore = useSessionStore();
const route = useRoute();

// Create a ref to hold the randomly selected hero component
const randomHero = ref(null);
const randomNavbar = ref(null);

// Function to randomly select a hero component
const selectRandomHero = () => {
	// Generate a random number (0 or 1)
	const random1 = Math.floor(Math.random() * 2);
	const random2 = Math.floor(Math.random() * 2);

	// Set the hero component based on the random number
	randomHero.value = random1 === 0 ? Hero : Hero2logos;
	randomNavbar.value = random2 === 0
};

// Select a random hero initially
onMounted(() => {
	selectRandomHero();
});

// Watch for route changes and select a new random hero each time
watch(
	() => route.path,
	() => {
		selectRandomHero();
	}
);
</script>