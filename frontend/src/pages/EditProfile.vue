<template>
	<div class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full min-h-screen py-8">
		<div id="user-form" class="">
			<h2>Mouvement des Libertariens</h2>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
				<!-- eslint-disable-next-line max-len -->
				<path fill="#42b883" fill-opacity="1"
					d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
			</svg>

			<div class="sign-up">
				<form @submit.prevent="update">
					<div>
						<label for="username">Username</label>
						<input v-model="username" @focus="clearErrors" type="text" name="username">
					</div>

					<div>
						<label for="firstname">first name</label>
						<input v-model="firstname" @focus="clearErrors" type="text" name="firstname">
					</div>

					<div>
						<label for="lastname">last name</label>
						<input v-model="lastname" @focus="clearErrors" type="text" name="lastname">
					</div>

					<div>
						<label for="email">Email</label>
						<input v-model="email" @focus="clearErrors" type="text" name="email">
					</div>

					<div>
						<label for="intro">Intro</label>
						<textarea v-model="intro" @focus="clearErrors" name="intro" rows="4" class="intro-textarea"></textarea>
					</div>

					<div>
						<label for="certification_public" class="flex items-center gap-2">
							<input v-model="isCertificationPublic" @focus="clearErrors" type="checkbox" id="certification_public"
								name="certification_public">
							Certification publique
						</label>
					</div>

					<div>
						<label for="password">Mot de passe</label>

						<div v-if="isHidden" class="password">
							<input v-model="currentPassword" @focus="clearErrors" type="password" placeholder="votre mot de passe"
								name="password">
							<font-awesome-icon icon="fa-solid fa-eye" @click="toggleHidden" class="text-white" />
						</div>

						<div v-else class="password">
							<input v-model="currentPassword" @focus="clearErrors" type="text" placeholder="votre mot de passe"
								name="password">
							<font-awesome-icon icon="fa-solid fa-eye-slash" @click="toggleHidden" class="text-white" />
						</div>
					</div>
					<div v-for="error in sessionStore.getErrors" :key="error" class="text-red-500">{{ error }}</div>
					<button>Update</button>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
const sessionStore = useSessionStore()
const email = ref("")
const currentPassword = ref("")
const username = ref("")
const firstname = ref("")
const lastname = ref("")
const intro = ref("")
const isHidden = ref(true)
const isCertificationPublic = ref(true)

onMounted(() => {
	email.value = sessionStore.getUserDetails.email
	username.value = sessionStore.getUserDetails.username
	firstname.value = sessionStore.getUserDetails.first_name
	lastname.value = sessionStore.getUserDetails.last_name
	intro.value = sessionStore.getUserDetails.intro
	isCertificationPublic.value = sessionStore.getUserDetails.certification_is_public
})

const update = async () => {
	const params = {
		email: email.value,
		username: username.value,
		first_name: firstname.value,
		last_name: lastname.value,
		intro: intro.value,
		certification_is_public: isCertificationPublic.value,
		current_password: currentPassword.value
	}

	const isUpdated = await sessionStore.updateUser(params)
	if (isUpdated) {
		router.push({ name: "Home" })
	} else {
		console.error("Failed to update user");
	}
}

const toggleHidden = () => {
	isHidden.value = !isHidden.value
}

const clearErrors = () => {
	sessionStore.clearErrors()
}
</script>

<style lang="scss" scoped>
#user-form {
	margin: 0 auto;
	text-align: center;
	width: 250px;
}

form {
	background-color: #242d36;
	border-radius: 0 0 10px 10px;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	overflow: hidden;

	button,
	input,
	textarea {
		color: inherit;
	}

	button {
		background-image: linear-gradient(135deg, #229968, #26634c);
		border: none;
		cursor: pointer;
		font-weight: 600;
		max-height: 35px;
		padding: 10px;
		text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
		transition: all 0.3s ease;

		&:hover {
			filter: brightness(120%);
		}
	}

	div {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: 10px 0;
		text-align: left;
	}

	input,
	textarea,
	label {
		background-color: transparent;
		border: none;
		border-bottom: 1px solid transparent;
		margin: 0 1rem;
		padding: 0.5rem 0;
		transition: border-bottom 0.3s ease;

		&:focus {
			border-bottom: 1px solid #42b883aa;
			outline: none;
		}

		&:-webkit-autofill,
		&:-webkit-autofill:focus {
			transition: background-color 600000s 0s, color 600000s 0s;
		}
	}

	textarea.intro-textarea {
		min-height: 80px;
		resize: vertical;
		color: #a6fa09aa;
		overflow-y: auto;
		line-height: 1.4;
		border: 1px solid #42b883aa;
		border-radius: 4px;
		padding: 0.5rem;
	}

	label {
		font-size: 0.8rem;
		color: #e65edfaa;
	}

	input {
		color: #a6fa09aa;
	}
}

h2 {
	background-color: #42b883;
	border-radius: 10px 10px 0 0;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5), 0px 0px 5px rgba(0, 0, 0, 0.5);
	padding: 15px;
	text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

p {
	font-size: 0.8rem;
	margin-top: 20px;
}

span {
	color: #fac208aa;
	cursor: pointer;
	position: relative;
	transition: color 0.3s ease;
	z-index: 10;

	&:hover {
		color: lighten(#42b883, 10%);
	}
}

svg {
	background-color: #242d36;
	margin: -20px 0 -20px;
}

.password {
	align-items: center;
	flex-direction: row;
	justify-content: space-between;
	margin: 0 1rem;

	input {
		margin: 0;
		width: 100%;
	}
}

.svg-inline--fa {
	cursor: pointer;
	font-size: 0.8rem;
}
</style>