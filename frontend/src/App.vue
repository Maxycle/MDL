<template>
  <div class="flex flex-col h-screen font-lora w-screen max-w-full overflow-x-hidden">
    <!-- Header section -->
    <header class="flex-none">
      <Hero2logos />
      <NavBar v-if="sessionStore.isLoggedIn" class="z-50" />
			<div v-else class="flex">
				<div class="w-1/2 h-1 bg-gradient-to-l from-orangeLogo to-yellowLogo"></div>
				<div class="w-1/2 h-1 bg-gradient-to-r from-orangeLogo to-yellowLogo"></div>
			</div>
    </header>
    
    <!-- Main content area -->
    <main class="flex-1 overflow-auto">
      <div id="router-view-container" class="h-full">
        <router-view v-slot="{ Component }">
          <template v-if="Component">
            <TransitionGroup 
              name="fade-to-black" 
              mode="out-in" 
              tag="div" 
              class="h-full"
            >
              <Suspense 
                key="suspense-container"
                @resolve="onSuspenseResolve" 
                @pending="onSuspensePending" 
                @fallback="onSuspenseFallback"
              >
                <template #default>
                  <component 
                    :is="Component" 
                    :key="route.fullPath" 
                    @error="handleComponentError"
                  />
                </template>
                <template #fallback>
                  <div 
                    key="fallback-spinner" 
                    class="flex justify-center items-center h-full"
                  >
                    <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                  </div>
                </template>
              </Suspense>
            </TransitionGroup>
          </template>
          <div v-else class="text-red-500 p-4">
            No Component Found for Route: {{ route.path }}
          </div>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onErrorCaptured, Suspense, TransitionGroup } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Hero2logos from '@/components/Hero2logos.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"
import { useRoute } from 'vue-router'

const sessionStore = useSessionStore();
const route = useRoute();

// Error handling method
const handleComponentError = (error) => {
  console.error('Component rendering error:', {
    route: route.path,
    error: error
  });
};

// Suspense lifecycle hooks for additional debugging
const onSuspenseResolve = () => {
  console.log('Suspense resolved:', route.path);
};

const onSuspensePending = () => {
  console.log('Suspense pending:', route.path);
};

const onSuspenseFallback = () => {
  console.log('Suspense fallback triggered:', route.path);
};

// Global error capture
onErrorCaptured((err, instance, info) => {
  console.error('Global error captured:', {
    error: err,
    instance: instance,
    info: info
  });
  return false;
});
</script>
