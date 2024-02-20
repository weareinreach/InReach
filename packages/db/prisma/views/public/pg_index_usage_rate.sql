SELECT
  pg_stat_user_tables.relname,
  (
    (100 * pg_stat_user_tables.idx_scan) / (
      pg_stat_user_tables.seq_scan + pg_stat_user_tables.idx_scan
    )
  ) AS percent_of_times_index_used,
  pg_stat_user_tables.n_live_tup AS rows_in_table
FROM
  pg_stat_user_tables
ORDER BY
  pg_stat_user_tables.n_live_tup DESC;