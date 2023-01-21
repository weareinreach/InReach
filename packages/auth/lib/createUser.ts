import { z } from 'zod'

import { ClientId, cognito, generateHash } from './cognitoClient'

const CreateUserSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	databaseId: z.string().cuid(),
})

/**
 * Creates an AWS Cognito login for the user pool.
 *
 * @param data - This is the data that is passed in from the client.
 * @returns The UUID for the Cognito user.
 */
export const createCognitoUser: CreateCognitoUser = async (data) => {
	const validatedData = CreateUserSchema.parse(data)

	const { email, password, databaseId } = validatedData

	const response = await cognito.signUp({
		ClientId: ClientId,
		Username: email,
		Password: password,
		SecretHash: generateHash(email),
		UserAttributes: [
			{
				Name: 'custom:id',
				Value: databaseId,
			},
			{
				Name: 'email',
				Value: email,
			},
		],
	})
	return response.UserSub
}

type CreateCognitoUser = (data: CreateCognitoUserParams) => Promise<unknown>
type CreateCognitoUserParams = { email: string; password: string; databaseId: string }
