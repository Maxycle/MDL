module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
		extend: {
			fontFamily: {
				'plain': ['PT serif', 'sans-serif'],
				'agu': ['Agu Display', 'sans-serif'],
				'barriecito': ['Barriecito', 'sans-serif'],
				'modak': ['Modak', 'sans-serif'],
				'eater': ['Eater', 'sans-serif']
			},
			colors: {
        'anarcapYellow': '#fdfd00',
      },
		},
	},
  plugins: [],
}
