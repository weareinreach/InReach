SELECT
  sum(pg_statio_user_tables.heap_blks_read) AS heap_read,
  sum(pg_statio_user_tables.heap_blks_hit) AS heap_hit,
  (
    (
      sum(pg_statio_user_tables.heap_blks_hit) - sum(pg_statio_user_tables.heap_blks_read)
    ) / sum(pg_statio_user_tables.heap_blks_hit)
  ) AS ratio
FROM
  pg_statio_user_tables;