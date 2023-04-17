-- This is an empty migration.-- public.user_refresh_token source
CREATE
OR REPLACE VIEW public.user_refresh_token AS
SELECT
	u.id,
	a.refresh_token,
	u.email
FROM
	"User" u
	JOIN "Account" a ON u.id = a."userId"
	AND a.provider = 'cognito' :: text;