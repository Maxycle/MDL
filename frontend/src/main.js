import { createApp } from 'vue'
import router from './router.js'
import App from './App.vue'
import { createPinia } from 'pinia'
import './assets/main.css'
import { useSessionStore } from "@/stores/modules/sessionStore"
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import { library } from "@fortawesome/fontawesome-svg-core"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faEyeSlash, faEye, faPaperPlane, faEnvelope, faPenFancy, faMusic } from "@fortawesome/free-solid-svg-icons"

const app = createApp(App)
const pinia = createPinia()

library.add(faEyeSlash, faEye, faPaperPlane, faEnvelope, faPenFancy, faMusic)

app.use(pinia)
// Load JWT from local storage on refresh
const loadAuthToken = async () => {
	const authToken = localStorage.getItem("authToken")
	console.log("authToken main1", authToken)

	const authTokenExists = authToken !== "undefined" && authToken !== null

	if (authTokenExists) {
		await useSessionStore(pinia).loginUserWithToken(authToken)
		console.log("authToken main2", authToken)
	}
}

const vuetify = createVuetify({
	icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
	components,
	directives
})

loadAuthToken().then(() => {
	app
		.component("FontAwesomeIcon", FontAwesomeIcon)
		.use(router)
		.use(vuetify)
		.mount("#app")
})
