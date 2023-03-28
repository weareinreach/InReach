import { Logger } from '@aws-lambda-powertools/logger'
import { Callback, Context, CustomMessageTriggerEvent } from 'aws-lambda'

const logger = new Logger({ serviceName: 'cognito-messaging' })

export const encodeUrl = (email: string, databaseId: string, code: string) => {
	const data = { email, databaseId, code }

	const buff = Buffer.from(JSON.stringify(data), 'utf-8')

	return buff.toString('base64url')
}
export const decodeUrl = (base64: string) => {
	const buff = Buffer.from(base64, 'base64url')

	return JSON.parse(buff.toString('utf-8'))
}

const clientMetadataDefaults = (triggerSource: CustomMessageTriggerEvent['triggerSource']) => {
	const resetPw = triggerSource === 'CustomMessage_ForgotPassword'

	return {
		baseUrl: `http://localhost:3000`,
		subject: resetPw ? 'Reset your password' : 'Confirm your account',
		message: resetPw
			? 'Click the following link to reset your password:'
			: 'Click the following link to confirm your account:',
	}
}

export const handler = (
	event: CustomMessageTriggerEvent,
	context: Context,
	callback: Callback<CustomMessageTriggerEvent>
) => {
	const { triggerSource, userName, request, response } = event
	const { baseUrl, subject, message } = request.clientMetadata ?? clientMetadataDefaults(triggerSource)

	const confirmLink = `${baseUrl}?c=${encodeUrl(
		userName,
		request.userAttributes['custom:id'],
		request.codeParameter
	)}`
	const resetLink = `${baseUrl}?r=${encodeUrl(
		userName,
		request.userAttributes['custom:id'],
		request.codeParameter
	)}`

	switch (triggerSource) {
		case 'CustomMessage_AdminCreateUser':
		case 'CustomMessage_SignUp': {
			response.emailSubject = subject
			response.emailMessage = `${message} ${confirmLink}`
			break
		}
		case 'CustomMessage_ForgotPassword': {
			response.emailSubject = 'Reset your password'
			response.emailMessage = `${message} ${resetLink}`
			break
		}
	}
	const reply = { ...event, response }

	logger.info(
		`Sending confirmation for userId ${request.userAttributes['custom:id']} for event ${triggerSource}`
	)
	callback(null, reply)
}
