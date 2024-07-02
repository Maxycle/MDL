import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Questionnaire from '@/pages/Questionnaire.vue'
import Login from '@/pages/Login.vue'
import NewQuestion from '@/pages/NewQuestion.vue'
import ModifyQuestion from '@/pages/ModifyQuestion.vue'
import UploadNewQuestions from '@/pages/UploadNewQuestions.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'

const routes = [
	{ path: '/Login', name: 'Login', component: Login, meta: { requiresAuth: false } },
	{ path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } },
	{ path: '/questionnaire', name: 'Questionnaire', component: Questionnaire, meta: { requiresAuth: false } },
	{ path: '/nouvelle-question', name: 'NewQuestion', component: NewQuestion, meta: { requiresAuth: false } },
	{ path: '/modifier-question', name: 'ModifyQuestion', component: ModifyQuestion, meta: { requiresAuth: false } },
	{ path: '/upload-nouvelles-questions', name: 'UploadNewQuestions', component: UploadNewQuestions, meta: { requiresAuth: false } }
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

