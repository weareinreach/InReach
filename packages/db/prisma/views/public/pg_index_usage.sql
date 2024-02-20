SELECT
  t.tablename AS relation,
  foo.indexname,
  c.reltuples AS num_rows,
  pg_size_pretty(
    pg_relation_size((quote_ident((t.tablename) :: text)) :: regclass)
  ) AS table_size,
  pg_size_pretty(
    pg_relation_size(
      (quote_ident((foo.indexrelname) :: text)) :: regclass
    )
  ) AS index_size,
  foo.idx_scan AS number_of_scans,
  foo.idx_tup_read AS tuples_read,
  foo.idx_tup_fetch AS tuples_fetched
FROM
  (
    (
      pg_tables t
      LEFT JOIN pg_class c ON ((t.tablename = c.relname))
    )
    LEFT JOIN (
      SELECT
        c_1.relname AS ctablename,
        ipg.relname AS indexname,
        x.indnatts AS number_of_columns,
        psai.idx_scan,
        psai.idx_tup_read,
        psai.idx_tup_fetch,
        psai.indexrelname,
        x.indisunique
      FROM
        (
          (
            (
              pg_index x
              JOIN pg_class c_1 ON ((c_1.oid = x.indrelid))
            )
            JOIN pg_class ipg ON ((ipg.oid = x.indexrelid))
          )
          JOIN pg_stat_all_indexes psai ON ((x.indexrelid = psai.indexrelid))
        )
    ) foo ON ((t.tablename = foo.ctablename))
  )
WHERE
  (t.schemaname = 'public' :: name)
ORDER BY
  t.tablename,
  foo.indexname;