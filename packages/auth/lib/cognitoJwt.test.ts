import { describe, expect, it } from 'vitest'

import { AccessTokenSchema, IdTokenSchema } from './cognitoJwt'

/**
 * Regression coverage for a real production incident: Cognito's `sub` claim is a unique identifier, not a
 * guaranteed RFC 4122-compliant UUID - AWS never promises the variant nibble is one of 8/9/a/b. When `zod`
 * was upgraded from 3.25.76 to 4.4.3 (615356d6), `.uuid()` became RFC 4122-strict, which silently broke login
 * for any account whose `sub` didn't happen to satisfy that constraint. Two real, independently created
 * accounts - fully registered, email-verified, and confirmed/active in both Cognito and our own database -
 * failed every login attempt with a generic "incorrect username or password" error because of this, even
 * immediately after a successful password reset. The actual cause was only found by decoding the error a
 * curl-based login attempt returned and testing the exact `sub` value against both zod versions directly.
 * `z.guid()` validates the same shape without the RFC 4122 constraint, and this file exists so a future
 * dependency bump or hand-edit can't reintroduce this silently - it would need to break one of these
 * assertions first.
 */
describe('Cognito token schema - sub claim validation', () => {
	// Real `sub` from a working, fully-confirmed Cognito account that could authenticate fine but was
	// rejected by our own validation - variant nibble is '3', not one of the RFC 4122-required 8/9/a/b.
	const nonCompliantSub = 'c4a8a4d8-0051-7008-3961-2cd6fc137686'
	// Real `sub` from another working account, whose variant nibble ('9') happens to satisfy RFC 4122 -
	// included so the "accepts" assertions aren't just trivially true for every string.
	const compliantSub = 'b6184717-a297-47b8-9ce4-4064d9385fa1'

	const baseIdClaims = {
		email_verified: true,
		iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_06XOmcvrs',
		'custom:id': 'user_01M2NSWZ2XVCHCCS3NB0T4KAQF',
		'cognito:username': 'smwangy05@gmail.com',
		aud: 'clientid',
		token_use: 'id' as const,
		auth_time: 1,
		exp: 1,
		iat: 1,
		jti: 'jti',
		email: 'smwangy05@gmail.com',
	}
	const baseAccessClaims = {
		iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_06XOmcvrs',
		client_id: 'clientid',
		token_use: 'access' as const,
		scope: 'aws.cognito.signin.user.admin',
		auth_time: 1,
		exp: 1,
		iat: 1,
		jti: 'jti',
		username: 'smwangy05@gmail.com',
	}

	it('accepts an ID token whose sub is a real Cognito value that is not RFC 4122-compliant', () => {
		const result = IdTokenSchema.safeParse({ ...baseIdClaims, sub: nonCompliantSub })
		expect(result.success).toBe(true)
	})

	it('accepts an ID token whose sub is RFC 4122-compliant too', () => {
		const result = IdTokenSchema.safeParse({ ...baseIdClaims, sub: compliantSub })
		expect(result.success).toBe(true)
	})

	it('accepts an access token with the same non-RFC-4122-compliant sub', () => {
		const result = AccessTokenSchema.safeParse({ ...baseAccessClaims, sub: nonCompliantSub })
		expect(result.success).toBe(true)
	})

	it('still rejects a garbage sub, so this stays a real check and not a no-op', () => {
		const result = IdTokenSchema.safeParse({ ...baseIdClaims, sub: 'not-a-uuid-at-all' })
		expect(result.success).toBe(false)
	})

	it('still rejects an empty sub', () => {
		const result = IdTokenSchema.safeParse({ ...baseIdClaims, sub: '' })
		expect(result.success).toBe(false)
	})
})
