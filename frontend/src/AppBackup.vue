<template>
  <div class="flex flex-col h-screen font-lora" v-cloak>
    <!-- Header section with randomly selected Hero -->
    <header class="flex-none">
      <!-- <NavBar v-if="sessionStore.isLoggedIn && randomNavbar" class="z-50" />
      <component :is="randomHero" /> -->
			<Hero />
			<NavBar v-if="sessionStore.isLoggedIn" class="z-50" />

      <!-- <NavBar v-if="sessionStore.isLoggedIn && !randomNavbar" class="z-50" /> -->
    </header>
    <!-- Main content area that takes remaining space -->
    <main class="flex-1 overflow-auto">
      <!-- Debug information -->
      <div v-if="debugInfo" class="bg-yellow-100 p-4 text-black">
        <p>Current Route: {{ route.path }}</p>
        <p>Component Name: {{ componentName }}</p>
        <p>Is Authenticated: {{ sessionStore.getAuthToken !== null }}</p>
      </div>

      <!-- Fallback loading state -->
      <div v-if="isLoading" class="flex justify-center items-center h-full">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- Router view with enhanced rendering -->
      <router-view v-slot="{ Component }">
        <transition name="fade-to-black" mode="out-in">
          <KeepAlive>
            <ErrorBoundary>
              <component 
                :is="Component" 
                :key="route.fullPath"
                @error="handleComponentError"
                @mounted="onComponentMounted"
              />
            </ErrorBoundary>
          </KeepAlive>
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { markRaw, KeepAlive, ref, computed } from 'vue'
import Hero from '@/components/Hero.vue'
import Hero2logos from '@/components/Hero2logos.vue'
import NavBar from '@/components/NavBar.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { watch, onMounted, onErrorCaptured } from 'vue'
import { useRoute } from 'vue-router'

// Error Boundary Component
const ErrorBoundary = {
  template: `
    <div v-if="error" class="bg-red-100 text-red-800 p-4">
      <h2>Error Loading Component</h2>
      <p>{{ error.message }}</p>
    </div>
    <slot v-else />
  `,
  data() {
    return {
      error: null
    }
  },
  errorCaptured(err) {
    this.error = err
    return false
  }
}

const sessionStore = useSessionStore();
const route = useRoute();

// Debugging and loading state
const debugInfo = ref(false)
const isLoading = ref(false)
const componentName = ref('')

// Use shallowRef for components to avoid unnecessary reactivity
const randomHero = ref(null);
const randomNavbar = ref(false);

// Memoize hero components to prevent unnecessary re-renders
const heroComponents = [
  markRaw(Hero),
  markRaw(Hero2logos)
];

// Function to randomly select a hero component
const selectRandomHero = () => {
  // Generate random numbers for hero and navbar
  const randomHeroIndex = Math.floor(Math.random() * heroComponents.length);
  const randomNavbarBool = Math.random() < 0.5;

  // Set the hero component and navbar visibility
  randomHero.value = heroComponents[randomHeroIndex];
  randomNavbar.value = randomNavbarBool;
};

// Error handling method
const handleComponentError = (error) => {
  console.error('Component rendering error:', error);
  isLoading.value = false;
};

// Component mounted handler
const onComponentMounted = () => {
  isLoading.value = false;
};

// Select a random hero initially
onMounted(() => {
  selectRandomHero();
  
  // Enable debug mode (set to true to see debug info)
  debugInfo.value = true;
});

// Watch for route changes and select a new random hero each time
watch(
  () => route.path,
  (newPath) => {
    selectRandomHero();
    
    // Reset loading state and extract component name
    isLoading.value = true;
    componentName.value = newPath.split('/').pop() || 'Home';
  },
  { immediate: true }
);

// Global error captured hook
onErrorCaptured((error, instance, info) => {
  console.error('Global error captured:', error, info);
  return false;
});
</script>

<style>
[v-cloak] {
  display: none;
}

.fade-to-black-enter-active,
.fade-to-black-leave-active {
  transition: opacity 0.3s ease;
}

.fade-to-black-enter-from,
.fade-to-black-leave-to {
  opacity: 0;
}
</style>