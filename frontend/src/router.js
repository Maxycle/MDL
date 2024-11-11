import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Questionnaire from '@/pages/Questionnaire.vue'
import Login from '@/pages/Login.vue'
import NewQuestion from '@/pages/NewQuestion.vue'
import ModifyQuestion from '@/pages/ModifyQuestion.vue'
import QuestionnaireParams from '@/pages/QuestionnaireParams.vue'
import UploadNewQuestions from '@/pages/UploadNewQuestions.vue'
import EmailConfirmation from '@/pages/EmailConfirmation.vue'
import UsersScores from '@/pages/UsersScores.vue'
import EditProfile from '@/pages/EditProfile.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'

const routes = [
	{ path: '/Login', name: 'Login', component: Login, meta: { requiresAuth: false } },
	{ path: '/', name: 'Home', component: Home, meta: { requiresAuth: false } },
	{ path: '/questionnaire', name: 'Questionnaire', component: Questionnaire, meta: { requiresAuth: false } },
	{ path: '/nouvelle-question', name: 'NewQuestion', component: NewQuestion, meta: { requiresAuth: false } },
	{ path: '/modifier-question', name: 'ModifyQuestion', component: ModifyQuestion, meta: { requiresAuth: false } },
	{ path: '/questionnaire-paramètres', name: 'QuestionnaireParams', component: QuestionnaireParams, meta: { requiresAuth: false } },
	{ path: '/utilisateurs', name: 'UsersScores', component: UsersScores, meta: { requiresAuth: false } },
	{ path: '/upload-nouvelles-questions', name: 'UploadNewQuestions', component: UploadNewQuestions, meta: { requiresAuth: false } },
	{ path: '/edit-profile', name: 'EditProfile', component: EditProfile, meta: { requiresAuth: false } },
	{ path: '/email-confirmation', name: 'EmailConfirmation', component: EmailConfirmation }
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

