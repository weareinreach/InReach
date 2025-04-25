 WITH parsed AS (
         SELECT "UserSurvey".id,
            "UserSurvey"."birthYear",
            "UserSurvey"."reasonForJoin",
            "UserSurvey"."countryOriginId",
            "UserSurvey"."immigrationId",
            "UserSurvey"."currentCity",
            "UserSurvey"."currentGovDistId",
            "UserSurvey"."currentCountryId",
            "UserSurvey"."ethnicityOther",
            "UserSurvey"."immigrationOther",
            split_part("UserSurvey".id, '_'::text, 2) AS ulid_part
           FROM "UserSurvey"
        ), decoded AS (
         SELECT parsed.id,
            parsed."birthYear",
            parsed."reasonForJoin",
            parsed."countryOriginId",
            parsed."immigrationId",
            parsed."currentCity",
            parsed."currentGovDistId",
            parsed."currentCountryId",
            parsed."ethnicityOther",
            parsed."immigrationOther",
            parsed.ulid_part,
            ( SELECT to_timestamp(inner_query.ts / 1000.0::double precision) AS to_timestamp
                   FROM ( SELECT ( SELECT sum((POSITION(("substring"(split_part(parsed.id, '_'::text, 2), i.i, 1)) IN ('0123456789ABCDEFGHJKMNPQRSTVWXYZ'::text)) - 1)::double precision * (32::double precision ^ (10 - i.i)::double precision)) AS sum
                                   FROM generate_series(1, 10) i(i)) AS ts) inner_query) AS ulid_timestamp,
            EXTRACT(year FROM ( SELECT to_timestamp(inner_query.ts / 1000.0::double precision) AS to_timestamp
                   FROM ( SELECT ( SELECT sum((POSITION(("substring"(split_part(parsed.id, '_'::text, 2), i.i, 1)) IN ('0123456789ABCDEFGHJKMNPQRSTVWXYZ'::text)) - 1)::double precision * (32::double precision ^ (10 - i.i)::double precision)) AS sum
                                   FROM generate_series(1, 10) i(i)) AS ts) inner_query)) AS "createdAt Year"
           FROM parsed
        ), joined_data AS (
         SELECT d.id,
            d.ulid_timestamp,
            d."createdAt Year",
            d."birthYear",
            NULL::text AS communities,
            c1.name AS "countryOrigin",
            c2.name AS "currentCountry",
            NULL::text AS "currentGovDist",
            NULL::text AS "currentCity",
            string_agg(DISTINCT ue.ethnicity, ', '::text) AS ethnicities,
            d."ethnicityOther",
            string_agg(DISTINCT us."identifyAs", ', '::text) AS "identifiesAs",
            i1.status AS immigration,
            d."immigrationOther",
            d."reasonForJoin"
           FROM decoded d
             LEFT JOIN "Country" c1 ON d."countryOriginId" = c1.id
             LEFT JOIN "Country" c2 ON d."currentCountryId" = c2.id
             LEFT JOIN "SurveyEthnicity" e1 ON d.id = e1."surveyId"
             LEFT JOIN "UserEthnicity" ue ON e1."ethnicityId" = ue.id
             LEFT JOIN "SurveySOG" s1 ON d.id = s1."surveyId"
             LEFT JOIN "UserSOGIdentity" us ON s1."sogId" = us.id
             LEFT JOIN "UserImmigration" i1 ON d."immigrationId" = i1.id
          GROUP BY d.id, d."birthYear", c1.name, c2.name, d."ethnicityOther", i1.status, d."immigrationOther", d."reasonForJoin", d.ulid_timestamp, d."createdAt Year"
        )
 SELECT joined_data.id,
    joined_data.ulid_timestamp,
    joined_data."createdAt Year",
    joined_data."birthYear",
    joined_data.communities,
    joined_data."countryOrigin",
    joined_data."currentCountry",
    joined_data."currentGovDist",
    joined_data."currentCity",
    joined_data.ethnicities,
    joined_data."ethnicityOther",
    joined_data."identifiesAs",
    joined_data.immigration,
    joined_data."immigrationOther",
    joined_data."reasonForJoin"
   FROM joined_data;
