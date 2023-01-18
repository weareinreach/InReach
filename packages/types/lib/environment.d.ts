/* eslint-disable import/no-unused-modules */
/* eslint-disable @typescript-eslint/no-unused-vars */
declare namespace NodeJS {
	interface ProcessEnv {
		COGNITO_ACCESS_KEY: string
		COGNITO_SECRET: string
		COGNITO_CLIENT_ID: string
	}
}
