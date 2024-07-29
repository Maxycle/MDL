<template>
	<div class="flex flex-col h-screen" v-cloak>
		<div class="flex flex-col h-1/4">
			<Hero class="grow" />
			<NavBar v-if="sessionStore.isLoggedIn" class="z-10" />
		</div>
		<div class="grow overflow-hidden">
			<router-view v-slot="{ Component }">
				<transition name="fade-to-black" mode="out-in">
					<component :is="Component" />
				</transition>
			</router-view>
		</div>
	</div>
</template>

<script setup>
import Hero from '@/components/Hero.vue'
import NavBar from '@/components/NavBar.vue'
import { useSessionStore } from "@/stores/modules/sessionStore"

const sessionStore = useSessionStore();
</script>
