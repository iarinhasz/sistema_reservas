const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    // A linha que diz ao Cypress para encontrar os arquivos .feature
    specPattern: "cypress/e2e/**/*.feature",
    
    async setupNodeEvents(on, config) {
      // Passamos a configuração de onde encontrar os steps DIRETAMENTE AQUI
      await addCucumberPreprocessorPlugin(on, config, {
        stepDefinitions: [
          "cypress/e2e/common/*.{js,ts}",
          "cypress/e2e/[filepath]/*.{js,ts}",
          "cypress/e2e/[filepath].{js,ts}",
        ],
      });

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );
      
      return config;
    },
  },
});