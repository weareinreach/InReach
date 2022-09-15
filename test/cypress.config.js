const { defineConfig } = require("cypress");
const cucumber = require('cypress-cucumber-preprocessor').default


module.exports = defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('file:preprocessor', cucumber());
    },
  },

  //To be revisited 
  // component: {
  //   devServer: {
  //     framework: "next",
  //     bundler: "webpack",
  //   },
  // },
});
