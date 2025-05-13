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
				'blueLogoLight': '#0089d1',
				'blueLogoDark': '#0162af',
				'orangeLogo': '#f4741b',
				'orangeLogoDark': '#fc3f1f',
				'yellowLogo': '#fddd00',
				'blackLogo': '#14191d'
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
