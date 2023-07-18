-- View: Table Index Usage
CREATE OR REPLACE VIEW public.pg_index_usage_rate AS
SELECT
	relname,
	100 * idx_scan /(seq_scan + idx_scan) percent_of_times_index_used,
	n_live_tup rows_in_table
FROM
	pg_stat_user_tables
ORDER BY
	n_live_tup DESC;

-- View: Cache Hit Rates
CREATE OR REPLACE VIEW public.pg_cache_hit_rate AS
SELECT
	SUM(heap_blks_read) AS heap_read,
	SUM(heap_blks_hit) AS heap_hit,
(SUM(heap_blks_hit) - SUM(heap_blks_read)) / SUM(heap_blks_hit) AS ratio
FROM
	pg_statio_user_tables;

-- View: Table Index Usage
CREATE OR REPLACE VIEW public.pg_index_usage AS
SELECT
	t.tablename AS "relation",
	indexname,
	c.reltuples AS num_rows,
	PG_SIZE_PRETTY(PG_RELATION_SIZE(QUOTE_IDENT(t.tablename)::text)) AS table_size,
	PG_SIZE_PRETTY(PG_RELATION_SIZE(QUOTE_IDENT(indexrelname)::text)) AS index_size,
	idx_scan AS number_of_scans,
	idx_tup_read AS tuples_read,
	idx_tup_fetch AS tuples_fetched
FROM
	pg_tables t
	LEFT OUTER JOIN pg_class c ON t.tablename = c.relname
	LEFT OUTER JOIN (
		SELECT
			c.relname AS ctablename,
			ipg.relname AS indexname,
			x.indnatts AS number_of_columns,
			idx_scan,
			idx_tup_read,
			idx_tup_fetch,
			indexrelname,
			indisunique
		FROM
			pg_index x
			JOIN pg_class c ON c.oid = x.indrelid
			JOIN pg_class ipg ON ipg.oid = x.indexrelid
			JOIN pg_stat_all_indexes psai ON x.indexrelid = psai.indexrelid) AS foo ON t.tablename = foo.ctablename
WHERE
	t.schemaname = 'public'
ORDER BY
	1,
	2;

