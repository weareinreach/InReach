SELECT
  u.id,
  a.access_token
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