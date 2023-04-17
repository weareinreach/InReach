SELECT
  current_database() AS f_table_catalog,
  n.nspname AS f_table_schema,
  c.relname AS f_table_name,
  a.attname AS f_geography_column,
  postgis_typmod_dims(a.atttypmod) AS coord_dimension,
  postgis_typmod_srid(a.atttypmod) AS srid,
  postgis_typmod_type(a.atttypmod) AS TYPE
FROM
  pg_class c,
  pg_attribute a,
  pg_type t,
  pg_namespace n
WHERE
  (
    (t.typname = 'geography' :: name)
    AND (a.attisdropped = false)
    AND (a.atttypid = t.oid)
    AND (a.attrelid = c.oid)
    AND (c.relnamespace = n.oid)
    AND (
      c.relkind = ANY (
        ARRAY ['r'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"]
      )
    )
    AND (NOT pg_is_other_temp_schema(c.relnamespace))
    AND has_table_privilege(c.oid, 'SELECT' :: text)
  );