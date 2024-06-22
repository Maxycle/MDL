<template>
	<div class="flex items-center justify-center min-w-16 border text-xs m-1 px-2 rounded h-full " :class="colorClasses">
		{{ item.name }}
		<button v-if="removable">
			<CloseRound class="ml-2 w-4" @click="remove" />
		</button>
	</div>
</template>

<script>
import CloseRound from '../svg/CloseRound.vue'

export default {
	components: {
		CloseRound
	},

	props: {
		item: {
			type: Object,
			default: {}
		},
		color: {
			type: String,
			default: 'lime'
		},
		borderColor: {
			type: String,
			default: 'black'
		},
		removable: {
			type: Boolean,
			default: false
		}
	},

	data() {
		return {

		}
	},

	computed: {
		bgColor() {
			switch (this.color) {
				case 'yellow':
					return 'bg-yellow-400'
					break;
				case 'red':
					return 'bg-orange-300'
					break;
				case 'blue':
					return 'bg-teal-100'
					break;
				case 'grey':
					return 'bg-slate-400'
					break;
				case 'lime':
					return 'bg-lime-100'
					break;
			}
		},

		borderGColor() {
			switch (this.borderColor) {
				case 'anarcapYellow':
					return 'border-anarcapYellow'
					break;
				case 'black':
					return 'border-black'
					break;
				case 'blue':
					return 'border-teal-300'
					break;

			}
		},

		colorClasses() {
			return this.bgColor + ' ' + this.borderGColor
		}
	},

	methods: {
		remove() {
			this.$emit('removed', this.item)
		}
	}
}
</script>