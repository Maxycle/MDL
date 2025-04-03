module.exports = {
	content: [
		"./index.html",
		"./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				'lora': ['Lora', 'serif']
			},
			colors: {
				'anarcapYellow': '#fdfd00',
			},
			textShadow: {
				'DEFAULT': '0 0 5px rgba(0, 0, 0, 0.5)',
			}
		},
	},
	plugins: [
		function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					'text-shadow': (value) => ({
						textShadow: value,
					}),
				},
				{ values: theme('textShadow') }
			)
		}
	]
}
