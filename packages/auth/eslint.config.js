const nextConfig = require('@weareinreach/eslint-config/next')
const storybookConfig = require('@weareinreach/eslint-config/storybook')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [...storybookConfig, ...nextConfig]
