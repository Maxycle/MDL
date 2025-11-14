<template>
	<div class="flex flex-col h-screen font-lora w-screen max-w-full overflow-x-hidden">
		<header class="flex-none">
			<Hero2logos />
			<NavBar v-if="sessionStore.isLoggedIn" class="z-50" />
			<div v-else class="flex">
				<div class="w-1/2 h-1 bg-gradient-to-l from-orangeLogo to-yellowLogo"></div>
				<div class="w-1/2 h-1 bg-gradient-to-r from-orangeLogo to-yellowLogo"></div>
			</div>
		</header>

		<main class="flex-1 overflow-auto">
			<router-view v-slot="{ Component }">
				<Suspense>
					<template #default>
						<component :is="Component" />
					</template>

					<template #fallback>
						<div class="flex justify-center items-center h-full">
							<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
						</div>
					</template>
				</Suspense>
			</router-view>
		</main>
	</div>
</template>

<script setup>
import { Suspense } from 'vue'
import NavBar from '@/components/NavBar.vue'
import Hero2logos from '@/components/Hero2logos.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();
</script>
