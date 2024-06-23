module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
		extend: {
			fontFamily: {
				'sans': ['Kode Mono', 'sans-serif'],
				'sus': ['Barriecito', 'sans-serif']
			},
			colors: {
        'anarcapYellow': '#fdfd00',
      },
		},
	},
  plugins: [],
}
