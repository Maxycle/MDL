<template>
  <div class="flex flex-col h-screen">
    <div class="flex flex-col sticky top-0 h-1/4">
      <Hero class="grow"/>
			<NavBar />
    </div>
    <div class="grow overflow-hidden">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import Hero from '@/components/Hero.vue'
import NavBar from '@/components/NavBar.vue'
</script>
