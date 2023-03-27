/* eslint-disable node/no-process-env */
/* eslint-disable turbo/no-undeclared-env-vars */
import { prisma } from '@weareinreach/db'
import { z } from 'zod'

import { ClientId, cognito, generateHash } from './cognitoClient'
import {
	COGNITO_CUSTOMID_FIELDNAME,
	COGNITO_EMAIL_FIELDNAME,
	NEXTAUTH_PROVIDER,
	NEXTAUTH_PROVIDER_TYPE,
} from './constants'
import { getBaseUrl } from './getBaseUrl'

const CreateUserSchema = z.object({
	email: z.string().email(),
	password: z.string(),
	databaseId: z.string(),
})

/**
 * Creates an AWS Cognito login for the user pool & associated prisma account record liked to user record
 *
 * @param data - This is the data that is passed in from the client.
 * @returns The UUID for the Cognito user.
 */
export const createCognitoUser = async (data: CreateCognitoUserParams) => {
	const validatedData = CreateUserSchema.parse(data)

	const { email, password, databaseId } = validatedData

	const response = await cognito.signUp({
		ClientId: ClientId,
		Username: email,
		Password: password,
		SecretHash: generateHash(email),
		UserAttributes: [
			{
				Name: COGNITO_CUSTOMID_FIELDNAME,
				Value: databaseId,
			},
			{
				Name: COGNITO_EMAIL_FIELDNAME,
				Value: email,
			},
		],
		ClientMetadata: { baseUrl: getBaseUrl() },
	})
	if (response.UserSub) {
		await prisma.account.create({
			data: {
				provider: NEXTAUTH_PROVIDER,
				providerAccountId: response.UserSub,
				type: NEXTAUTH_PROVIDER_TYPE,
				userId: databaseId,
			},
		})
		return response.UserSub
	}
}

type CreateCognitoUser = (data: CreateCognitoUserParams) => Promise<unknown>
type CreateCognitoUserParams = { email: string; password: string; databaseId: string }
