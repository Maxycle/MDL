<template>
	<div class="flex flex-col items-center bg-gradient-to-b from-black to-blue-900 w-full h-full pt-40">
		<div v-if="isRegistered" class="bg-green-500 border-2 border-red-500 rounded-lg p-4">
			Allez vérifier votre email pour confirmez votre inscription
		</div>
		<div v-else>
			<div id="user-form" class="">
				<h2>Mouvement des Libertariens</h2>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
					<!-- eslint-disable-next-line max-len -->
					<path fill="#42b883" fill-opacity="1"
						d="M0,128L40,133.3C80,139,160,149,240,149.3C320,149,400,139,480,154.7C560,171,640,213,720,197.3C800,181,880,107,960,112C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
				</svg>



				<div v-if="signingIn" class="sign-in">
					<form @submit.prevent="signIn">
						<div>
							<label for="email">Email</label>
							<input v-model="signInEmail" type="text" placeholder="Please enter your email" name="email">
						</div>

						<div>
							<label for="password">Password</label>
							<input v-model="signInPassword" type="password" placeholder="Please enter your password" name="password">
						</div>

						<button>Sign in</button>
					</form>

					<p class="text-green-200">No account ? <span @click="signingIn = false">Sign up</span></p>
				</div>

				<div v-else class="sign-up">
					<form @submit.prevent="signUp">
						<div>
							<label for="username">Username</label>
							<input v-model="username" type="text" placeholder="Please choose your username" name="username">
						</div>

						<div>
							<label for="firstname">first name</label>
							<input v-model="firstname" type="text" placeholder="Please choose your firstname" name="firstname">
						</div>

						<div>
							<label for="lastname">last name</label>
							<input v-model="lastname" type="text" placeholder="Please choose your lastname" name="lastname">
						</div>

						<div>
							<label for="email">Email</label>
							<input v-model="signUpEmail" type="text" placeholder="Please enter your email" name="email">
						</div>

						<div>
							<label for="password">Password</label>

							<div v-if="isHidden" class="password">
								<input v-model="signUpPassword" type="password" placeholder="Please enter your password"
									name="password">
								<FontAwesomeIcon icon="fa-solid fa-eye" @click="toggleHidden" />
							</div>

							<div v-else class="password">
								<input v-model="signUpPassword" type="text" placeholder="Please enter your password" name="password">
								<FontAwesomeIcon icon="fa-solid fa-eye-slash" @click="toggleHidden" />
							</div>
						</div>

						<button>Sign up</button>
					</form>

					<p class="text-green-200">Already registered ? <span @click="signingIn = true">Sign in</span></p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/modules/sessionStore"

const router = useRouter()
const sessionStore = useSessionStore()
const signInEmail = ref("")
const signInPassword = ref("")
const signUpEmail = ref("")
const signUpPassword = ref("")
const username = ref("")
const firstname = ref("")
const lastname = ref("")
const signingIn = ref(true)
const isHidden = ref(true)
const isRegistered = ref(false)

const signIn = async () => {
	const params = { email: signInEmail.value, password: signInPassword.value, }

	const isSignedIn = await sessionStore.loginUser(params)
	console.log('signé in !!', isSignedIn)
	if (isSignedIn) router.push({ name: "Home" })
}

// const signUp = async () => {
const signUp = async () => {
	const params = { email: signUpEmail.value, password: signUpPassword.value, username: username.value, first_name: firstname.value, last_name: lastname.value }

	isRegistered.value = await sessionStore.registerUser(params)
}

const toggleHidden = () => {
	isHidden.value = !isHidden.value
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
	input {
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
	label {
		background-color: transparent;
		border: none;
		border-bottom: 1px solid transparent;
		margin: 0 1rem;
		padding: 0.5rem 0;
		transition: border-bottom 0.3s ease;
		color: #e65edfaa;

		&:focus {
			border-bottom: 1px solid #42b883aa;
			outline: none;
		}

		&:-webkit-autofill,
		&:-webkit-autofill:focus {
			transition: background-color 600000s 0s, color 600000s 0s;
		}
	}

	label {
		font-size: 0.8rem;
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
		flex-grow: 1;
		margin: 0;
	}
}

.svg-inline--fa {
	cursor: pointer;
	font-size: 0.8rem;
}
</style>