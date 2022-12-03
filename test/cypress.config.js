const { defineConfig } = require('cypress')
const cucumber = require('cypress-cucumber-preprocessor').default

module.exports = defineConfig({
	projectId: '5n1gcv',
	e2e: {
		specPattern: '**/*.feature',
		video: false,
		setupNodeEvents(on, config) {
			// implement node event listeners here
			on('file:preprocessor', cucumber())
		},
	},

	//To be revisited
	// component: {
	//   devServer: {
	//     framework: "next",
	//     bundler: "webpack",
	//   },
	// },
})
