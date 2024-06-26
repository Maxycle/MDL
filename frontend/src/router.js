import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'

const routes = [
	{ path: '/Login', name: 'Login', component: Login, meta: { requiresAuth: false } },
	{ path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach((to, from, next) => {
	const store = useSessionStore();

	const isAuthenticated = store.getAuthToken !== null/* Check if user is authenticated (e.g., token exists) */;

	if (to.meta.requiresAuth && !isAuthenticated) {
		// Redirect to login page if authentication is required and user is not authenticated
		next('/');
	} else {
		// Continue to requested route
		next();
	}
})

export default router

