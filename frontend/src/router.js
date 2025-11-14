import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/modules/sessionStore'
import { usePostStore } from '@/stores/modules/postStore'
import { useScoreStore } from '@/stores/modules/scoreStore'
import { useUserStore } from '@/stores/modules/userStore'

// Import all route components
const Home = () => import('@/pages/Home.vue')
const Questionnaire = () => import('@/pages/Questionnaire.vue')
const Login = () => import('@/pages/authentication/Login.vue')
const SignUp = () => import('@/pages/authentication/SignUp.vue')
const AccountCreationRequest = () => import('@/pages/AccountCreationRequest.vue')
const NewQuestion = () => import('@/pages/NewQuestion.vue')
const ModifyQuestion = () => import('@/pages/ModifyQuestion.vue')
const QuestionnaireParams = () => import('@/pages/QuestionnaireParams.vue')
const UploadNewQuestions = () => import('@/pages/UploadNewQuestions.vue')
const EmailConfirmation = () => import('@/pages/EmailConfirmation.vue')
const UsersScores = () => import('@/pages/UsersScores.vue')
const UnconfirmedUsers = () => import('@/pages/UnconfirmedUsers.vue')
const EditProfile = () => import('@/pages/EditProfile.vue')
const ShowPostsIndex = () => import('@/pages/ShowPostsIndex.vue')
const HomePublic = () => import('@/pages/HomePublic.vue')
const UsersResults = () => import('@/pages/UsersResults.vue')
const ForgotPassword = () => import('@/pages/authentication/ForgotPassword.vue')
const ResetPassword = () => import('@/pages/authentication/ResetPassword.vue')
const PostEditor = () => import('@/pages/PostEditor.vue')

const routes = [
	// Public routes
	{
		path: '/Login',
		name: 'Login',
		component: Login,
		meta: { requiresAuth: false }
	},
	{
		path: '/signup/:token',  // Token-based signup path
		name: 'SignUp',
		component: SignUp,
		props: true,
		meta: { requiresAuth: false }
	},
	{
		path: '/SignUp', // Original signup path now redirects to home
		redirect: '/',
		meta: { requiresAuth: false }
	},
	{
		path: '/forgot-password',
		name: 'ForgotPassword',
		component: ForgotPassword,
		meta: { requiresAuth: false }
	},
	{
		path: '/reset-password',
		name: 'ResetPassword',
		component: ResetPassword,
		meta: { requiresAuth: false }
	},
	{
		path: '/account-creation-request',
		name: 'AccountCreationRequest',
		component: AccountCreationRequest,
		meta: { requiresAuth: false }
	},
	{
		path: '/',
		name: 'HomePublic',
		component: HomePublic,
		meta: { requiresAuth: false }
	},
	{
		path: '/questionnaire',
		name: 'Questionnaire',
		component: Questionnaire,
		meta: { requiresAuth: false }
	},
	{
		path: '/confirmation',
		name: 'EmailConfirmation',
		component: EmailConfirmation,
		meta: { requiresAuth: false }
	},
	{
		path: '/Blog',
		name: 'Blog',
		component: ShowPostsIndex,
		meta: { requiresAuth: false }
	},
	{
		path: '/users-results',
		name: 'UsersResults',
		component: UsersResults,
		meta: { requiresAuth: false }
	},

	// Authenticated user routes
	{
		path: '/home-questionnaire',
		name: 'Home',
		component: Home,
		meta: { requiresAuth: true }
	},
	{
		path: '/edit-profile',
		name: 'EditProfile',
		component: EditProfile,
		meta: { requiresAuth: true }
	},
	{
		path: '/utilisateurs-non-confirmes',
		name: 'UnconfirmedUsers',
		component: UnconfirmedUsers,
		meta: { requiresAuth: true }
	},
	// PP-only routes
	{
		path: '/utilisateurs',
		name: 'UsersScores',
		component: UsersScores,
		meta: { requiresAuth: true, requiresPP: true }
	},
	// Admin-only routes
	{
		path: "/posts/new",
		name: "PostNew",
		component: PostEditor,
		meta: { requiresAuth: true, requiresAdmin: true },
	},
	{
		path: "/posts/:id/edit",
		name: "PostEdit",
		component: PostEditor,
		meta: { requiresAuth: true, requiresAdmin: true },
	},
	{
		path: '/nouvelle-question',
		name: 'NewQuestion',
		component: NewQuestion,
		meta: { requiresAuth: true, requiresAdmin: true }
	},
	{
		path: '/modifier-question',
		name: 'ModifyQuestion',
		component: ModifyQuestion,
		meta: { requiresAuth: true, requiresAdmin: true }
	},
	{
		path: '/questionnaire-paramètres',
		name: 'QuestionnaireParams',
		component: QuestionnaireParams,
		meta: { requiresAuth: true, requiresAdmin: true }
	},
	{
		path: '/upload-nouvelles-questions',
		name: 'UploadNewQuestions',
		component: UploadNewQuestions,
		meta: { requiresAuth: true, requiresAdmin: true }
	},

	// Catch-all route
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: HomePublic,
		meta: { requiresAuth: false }
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		// Always scroll to top on route change
		return { top: 0 }
	}
})

router.beforeEach(async (to, from, next) => {
	const sessionStore = useSessionStore();

	const isAuthenticated = sessionStore.getAuthToken !== null;
	const isAdmin = sessionStore.isAdmin;
	const isPP = sessionStore.getUserCertification === 'PP'

	// Check if route requires authentication
	if (to.meta.requiresAuth && !isAuthenticated) {
		console.warn('Unauthorized access attempt, redirecting to Login')
		next('/Login');
		return;
	}

	// Check if route requires admin privileges
	if (to.meta.requiresAdmin && !isAdmin) {
		console.warn('Unauthorized admin access attempt, redirecting to home')
		next('/');
		return;
	}

	// Check if route requires PP privileges
	if (to.meta.requiresPP && !isPP) {
		console.warn('Unauthorized PP access attempt, redirecting to home')
		next('/');
		return;
	}

	// For signup route with token, validate token first
	if (to.name === 'SignUp' && to.params.token) {
		try {
			const response = await fetch(`/api/validate_signup_token/${to.params.token}`);

			if (!response.ok) {
				console.error('Invalid signup token')
				next('/');
				return;
			}
		} catch (error) {
			console.error('Error validating token:', error);
			next('/');
			return;
		}
	}

	// Prefetch data for Blog route
	if (to.path === '/Blog') {
		const postStore = usePostStore();
		await postStore.fetchPosts();
	}

	// Prefetch data for home route
	if (to.path === '/home-questionnaire' || to.path === '/questionnaire') {
		const scores = useScoreStore()
		await scores.fetchScores()
	}

	if (to.path === '/users-results' || to.path === '/utilisateurs') {
		const users = useUserStore()
		await users.fetchUsers()
	}

	// If all checks pass, proceed to route
	next();
})

// Global error handler for async route components
router.onError((error) => {
	console.error('Router navigation error:', error)
	// Optionally redirect to an error page or home
	router.push('/')
})

export default router
