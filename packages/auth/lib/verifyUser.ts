import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	AuthFlowType,
	type InitiateAuthCommandOutput,
	ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider'
import invariant from 'tiny-invariant'

const client = new CognitoIdentityProviderClient({
	credentials: {
		accessKeyId: process.env.COGNITO_ACCESS_KEY,
		secretAccessKey: process.env.COGNITO_SECRET,
	},
})

const isChallenge = (name: string | undefined): name is ChallengeNameType =>
	Object.values(ChallengeNameType).includes(name as ChallengeNameType)

export const verifyUser: VerifyUser = async (user, password) => {
	const request = new InitiateAuthCommand({
		AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
		ClientId: process.env.COGNITO_CLIENT_ID,
		AuthParameters: {
			USERNAME: user,
			PASSWORD: password,
		},
	})
	const response = await client.send(request)

	const result = (): VerifyUserResult => {
		if (response.AuthenticationResult) {
			return {
				success: true,
				session: response.AuthenticationResult,
			}
		}
		if (isChallenge(response.ChallengeName)) {
			invariant(response.ChallengeParameters)
			invariant(response.Session)
			return {
				success: undefined,
				challengeName: response.ChallengeName,
				challengeParams: response.ChallengeParameters,
				challengeSession: response.Session,
			}
		}
		return {
			success: false,
			session: undefined,
		}
	}

	return result()
}

type VerifyUser = (user: string, password: string) => Promise<VerifyUserResult>

type VerifyUserResult = Success | Failed | Challenge
interface Success {
	success: true
	session: InitiateAuthCommandOutput['AuthenticationResult']
}
interface Failed {
	success: false
	session: undefined
}
interface Challenge {
	success: undefined
	challengeName: ChallengeNameType
	challengeParams: Record<string, string>
	challengeSession: string
}
