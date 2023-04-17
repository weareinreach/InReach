SELECT
  u.id,
  a.refresh_token,
  u.email
FROM
  (
    "User" u
    JOIN "Account" a ON (
      (
        (u.id = a."userId")
        AND (a.provider = 'cognito' :: text)
      )
    )
  );