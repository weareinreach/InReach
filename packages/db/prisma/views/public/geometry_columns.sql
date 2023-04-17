SELECT
  (current_database()) :: character varying(256) AS f_table_catalog,
  n.nspname AS f_table_schema,
  c.relname AS f_table_name,
  a.attname AS f_geometry_column,
  COALESCE(postgis_typmod_dims(a.atttypmod), sn.ndims, 2) AS coord_dimension,
  COALESCE(
    NULLIF(postgis_typmod_srid(a.atttypmod), 0),
    sr.srid,
    0
  ) AS srid,
  (
    REPLACE(
      REPLACE(
        COALESCE(
          NULLIF(
            upper(postgis_typmod_type(a.atttypmod)),
            'GEOMETRY' :: text
          ),
          st.type,
          'GEOMETRY' :: text
        ),
        'ZM' :: text,
        '' :: text
      ),
      'Z' :: text,
      '' :: text
    )
  ) :: character varying(30) AS TYPE
FROM
  (
    (
      (
        (
          (
            (
              pg_class c
              JOIN pg_attribute a ON (
                (
                  (a.attrelid = c.oid)
                  AND (NOT a.attisdropped)
                )
              )
            )
            JOIN pg_namespace n ON ((c.relnamespace = n.oid))
          )
          JOIN pg_type t ON ((a.atttypid = t.oid))
        )
        LEFT JOIN (
          SELECT
            s.connamespace,
            s.conrelid,
            s.conkey,
            REPLACE(
              split_part(s.consrc, '''' :: text, 2),
              ')' :: text,
              '' :: text
            ) AS TYPE
          FROM
            (
              SELECT
                pg_constraint.connamespace,
                pg_constraint.conrelid,
                pg_constraint.conkey,
                pg_get_constraintdef(pg_constraint.oid) AS consrc
              FROM
                pg_constraint
            ) s
          WHERE
            (s.consrc ~~* '%geometrytype(% = %' :: text)
        ) st ON (
          (
            (st.connamespace = n.oid)
            AND (st.conrelid = c.oid)
            AND (a.attnum = ANY (st.conkey))
          )
        )
      )
      LEFT JOIN (
        SELECT
          s.connamespace,
          s.conrelid,
          s.conkey,
          (
            REPLACE(
              split_part(s.consrc, ' = ' :: text, 2),
              ')' :: text,
              '' :: text
            )
          ) :: integer AS ndims
        FROM
          (
            SELECT
              pg_constraint.connamespace,
              pg_constraint.conrelid,
              pg_constraint.conkey,
              pg_get_constraintdef(pg_constraint.oid) AS consrc
            FROM
              pg_constraint
          ) s
        WHERE
          (s.consrc ~~* '%ndims(% = %' :: text)
      ) sn ON (
        (
          (sn.connamespace = n.oid)
          AND (sn.conrelid = c.oid)
          AND (a.attnum = ANY (sn.conkey))
        )
      )
    )
    LEFT JOIN (
      SELECT
        s.connamespace,
        s.conrelid,
        s.conkey,
        (
          REPLACE(
            REPLACE(
              split_part(s.consrc, ' = ' :: text, 2),
              ')' :: text,
              '' :: text
            ),
            '(' :: text,
            '' :: text
          )
        ) :: integer AS srid
      FROM
        (
          SELECT
            pg_constraint.connamespace,
            pg_constraint.conrelid,
            pg_constraint.conkey,
            pg_get_constraintdef(pg_constraint.oid) AS consrc
          FROM
            pg_constraint
        ) s
      WHERE
        (s.consrc ~~* '%srid(% = %' :: text)
    ) sr ON (
      (
        (sr.connamespace = n.oid)
        AND (sr.conrelid = c.oid)
        AND (a.attnum = ANY (sr.conkey))
      )
    )
  )
WHERE
  (
    (
      c.relkind = ANY (
        ARRAY ['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"]
      )
    )
    AND (NOT (c.relname = 'raster_columns' :: name))
    AND (t.typname = 'geometry' :: name)
    AND (NOT pg_is_other_temp_schema(c.relnamespace))
    AND has_table_privilege(c.oid, 'SELECT' :: text)
  );