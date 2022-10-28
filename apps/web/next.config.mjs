// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { withSentryConfig } from '@sentry/nextjs'

import { env } from './src/env/server.mjs'

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
const config = {
	reactStrictMode: false, // Off for Sanity Studio until fixed -> https://github.com/sanity-io/sanity/issues/3604
	swcMinify: true,
	experimental: {
		transpilePackages: ['@inreach/ui'],
	},

	sentry: {
		// See the 'Configure Source Maps' and 'Configure Legacy Browser Support'
		// sections below for information on the following options:
		//   - disableServerWebpackPlugin
		//   - disableClientWebpackPlugin
		//   - hideSourceMaps
		//   - widenClientFileUpload
		//   - transpileClientSDK
		hideSourceMaps: true,
	},
}

const sentryWebpackPluginOptions = {
	// Additional config options for the Sentry Webpack plugin. Keep in mind that
	// the following options are set automatically, and overriding them is not
	// recommended:
	//   release, url, org, project, authToken, configFile, stripPrefix,
	//   urlPrefix, include, ignore

	silent: true, // Suppresses all logs
	// For all available options, see:
	// https://github.com/getsentry/sentry-webpack-plugin#options.
}

// function defineNextConfig(config) {
// 	return ;
// }

export default withSentryConfig(config, sentryWebpackPluginOptions)
