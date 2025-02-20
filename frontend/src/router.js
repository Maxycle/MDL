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
import UnconfirmedUsers from '@/pages/UnconfirmedUsers.vue'
import EditProfile from '@/pages/EditProfile.vue'
import NewPost from '@/pages/NewPost.vue'
import ShowPostsIndex from '@/pages/ShowPostsIndex.vue'
import HomePublic from '@/pages/HomePublic.vue'
import { useSessionStore } from '@/stores/modules/sessionStore'

const routes = [
  // Public routes
  { 
    path: '/Login', 
    name: 'Login', 
    component: Login, 
    meta: { requiresAuth: false } 
  },
	{ 
    path: '/HomePublic', 
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
    component: EmailConfirmation 
  },
  { 
    path: '/', 
    name: 'Blog', 
    component: ShowPostsIndex, 
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

	// Admin-only routes
  { 
    path: '/new-post', 
    name: 'NewPost', 
    component: NewPost, 
    meta: { requiresAuth: true, requiresAdmin: true } 
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
    path: '/utilisateurs', 
    name: 'UsersScores', 
    component: UsersScores, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/utilisateurs-non-confirmes', 
    name: 'UnconfirmedUsers', 
    component: UnconfirmedUsers, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  },
  { 
    path: '/upload-nouvelles-questions', 
    name: 'UploadNewQuestions', 
    component: UploadNewQuestions, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const store = useSessionStore();
  const isAuthenticated = store.getAuthToken !== null;
  const isAdmin = store.isAdmin;

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/Login');
    return;
  }

  // Check if route requires admin privileges
  if (to.meta.requiresAdmin && !isAdmin) {
    // Redirect to home or show unauthorized page
    next('/');
    return;
  }

  // If all checks pass, proceed to route
  next();
})

export default router