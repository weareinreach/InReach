export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			COGNITO_CLIENT_ID: string
			COGNITO_CLIENT_SECRET: string
			COGNITO_ISSUER: string
			COGNITO_USER_POOL_ID: string
			AWS_REGION: string
		}
	}
}
