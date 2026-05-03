SELECT
  o.id,
  o.name AS "Organization Name",
  COALESCE(
    (
      SELECT
        ow.url
      FROM
        "OrgWebsite" ow
      WHERE
        (
          (ow."organizationId" = o.id)
          AND (ow."isPrimary" = TRUE)
        )
      LIMIT
        1
    ), (
      SELECT
        ow.url
      FROM
        "OrgWebsite" ow
      WHERE
        (ow."organizationId" = o.id)
      LIMIT
        1
    )
  ) AS "Organization Website",
  concat('https://app.inreach.org/org/', o.slug) AS "InReach Slug",
  concat('https://app.inreach.org/org/', o.slug, '/edit') AS "InReach Edit URL",
  CASE
    WHEN (
      EXISTS (
        SELECT
          1
        FROM
          "OrgReview" orv
        WHERE
          (orv."organizationId" = o.id)
      )
    ) THEN 'Yes' :: text
    ELSE NULL :: text
  END AS "has Reviews",
  o."createdAt",
  o."updatedAt",
  o."lastVerified",
  o.published,
  o.deleted,
  COALESCE(
    (
      SELECT
        c.name
      FROM
        (
          "OrgLocation" ol
          JOIN "Country" c ON ((ol."countryId" = c.id))
        )
      WHERE
        (ol."orgId" = o.id)
      LIMIT
        1
    ), NULL :: text
  ) AS "countryCode"
FROM
  "Organization" o
WHERE
  (
    (o.deleted = false)
    AND (
      EXISTS (
        SELECT
          1
        FROM
          "OrgReview" orv
        WHERE
          (orv."organizationId" = o.id)
      )
    )
  )
ORDER BY
  o.published DESC,
  COALESCE(
    (
      SELECT
        ow.url
      FROM
        "OrgWebsite" ow
      WHERE
        (
          (ow."organizationId" = o.id)
          AND (ow."isPrimary" = TRUE)
        )
      LIMIT
        1
    ), (
      SELECT
        ow.url
      FROM
        "OrgWebsite" ow
      WHERE
        (ow."organizationId" = o.id)
      LIMIT
        1
    )
  ), CASE
    WHEN (o."lastVerified" IS NULL) THEN 0
    ELSE 1
  END,
  o."lastVerified";