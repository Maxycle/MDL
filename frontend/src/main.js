import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router.js'
import App from './App.vue'
import axios from 'axios'
import './assets/main.css'
import { useSessionStore } from "./stores/modules/sessionStore"
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faEyeSlash, faEye, faPaperPlane, faEnvelope, faPenFancy, faMusic, faArrowLeft } from "@fortawesome/free-solid-svg-icons"

// Set axios defaults
axios.defaults.withCredentials = true

// Create Pinia store
const pinia = createPinia()

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives
})

// Add FontAwesome icons to library
library.add(faEyeSlash, faEye, faPaperPlane, faEnvelope, faPenFancy, faMusic, faArrowLeft)

// Global error handler
const globalErrorHandler = (error, vm, info) => {
  console.error('Global Vue Error:', error)
  console.error('Component:', vm)
  console.error('Error Info:', info)
  
  // Optional: Send error to error tracking service
  // errorTrackingService.report(error, vm, info)
}

// Async function to load auth token and create app
const initializeApp = async () => {
  console.group('App Initialization')
  console.time('App Initialization Time')

  try {
    // Create Vue app
    const app = createApp(App)

    // Set global error handler
    app.config.errorHandler = globalErrorHandler

    // Use Pinia store first
    app.use(pinia)

    // Load JWT from local storage on refresh
    const authToken = localStorage.getItem("authToken")
    console.log('Auth Token:', authToken ? 'Found' : 'Not Found')

    const authTokenExists = authToken !== "undefined" && authToken !== null
    if (authTokenExists) {
      const sessionStore = useSessionStore()
      try {
        console.log('Attempting to login with token')
        await sessionStore.loginUserWithToken(authToken)
        console.log('Token login successful')
      } catch (error) {
        console.warn('Token login failed:', error)
        localStorage.removeItem("authToken")
      }
    }

    // Add global components and plugins
    app
      .component("FontAwesomeIcon", FontAwesomeIcon)
      .use(router)
      .use(vuetify)

    // Mount the app
    app.mount("#app")

    console.timeEnd('App Initialization Time')
    console.groupEnd()
  } catch (error) {
    console.error('Critical App Initialization Error:', error)
    
    // Optional: Display user-friendly error message
    const errorDiv = document.createElement('div')
    errorDiv.innerHTML = `
      <div style="color: red; text-align: center; padding: 20px;">
        <h1>Application Failed to Load</h1>
        <p>Please refresh the page or contact support if the problem persists.</p>
      </div>
    `
    document.body.innerHTML = ''
    document.body.appendChild(errorDiv)
  }
}

// Initialize the app
initializeApp().catch(error => {
  console.error('Unhandled App Initialization Error:', error)
})

// Optional: Unhandled Promise Rejection and Error Handlers
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled Promise Rejection:', event.reason)
})

window.addEventListener('error', event => {
  console.error('Uncaught Error:', event.error)
})