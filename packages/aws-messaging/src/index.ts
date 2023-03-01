import { Logger } from '@aws-lambda-powertools/logger'
import { Callback, Context, CustomMessageTriggerEvent } from 'aws-lambda'

const logger = new Logger({ serviceName: 'cognito-messaging' })

export const encodeUrl = (email: string, databaseId: string) => {
	const data = { email, databaseId }

	const buff = Buffer.from(JSON.stringify(data), 'utf-8')

	return buff.toString('base64url')
}
export const decodeUrl = (base64: string) => {
	const buff = Buffer.from(base64, 'base64url')

	return JSON.parse(buff.toString('utf-8'))
}

export const handler = (
	event: CustomMessageTriggerEvent,
	context: Context,
	callback: Callback<CustomMessageTriggerEvent>
) => {
	const { triggerSource, userName, request, response } = event
	const { baseUrl } = request.clientMetadata ?? { baseUrl: `http://localhost:3000` }

	const confirmLink = `${baseUrl}/auth/confirm/${encodeUrl(userName, request.userAttributes['custom:id'])}/${
		request.codeParameter
	}`
	const resetLink = `${baseUrl}/auth/reset/${encodeUrl(userName, request.userAttributes['custom:id'])}/${
		request.codeParameter
	}`

	switch (triggerSource) {
		case 'CustomMessage_AdminCreateUser':
		case 'CustomMessage_SignUp': {
			response.emailSubject = 'Confirm your account'
			response.emailMessage = `Click the following link to confirm your account: ${confirmLink}`
			break
		}
		case 'CustomMessage_ForgotPassword': {
			response.emailSubject = 'Reset your password'
			response.emailMessage = `Click the following link to reset your password: ${resetLink}`
			break
		}
	}
	const reply = { ...event, response }

	logger.info(
		`Sending confirmation for userId ${request.userAttributes['custom:id']} for event ${triggerSource}`
	)
	callback(null, reply)
}
