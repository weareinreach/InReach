-- Get Primary Keys
CREATE OR REPLACE FUNCTION get_primary_key_columns(entity_oid oid)
	RETURNS text[] STABLE
	SECURITY DEFINER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	pkeys text[];
BEGIN
	SELECT
		COALESCE(ARRAY_AGG(pa.attname::text ORDER BY pa.attnum),
		ARRAY[]::text[]) column_names INTO pkeys
	FROM
		pg_index pi
		JOIN pg_attribute pa ON pi.indrelid = pa.attrelid
			AND pa.attnum = ANY (pi.indkey)
	WHERE
		indrelid = $1
		AND indisprimary;
	RETURN pkeys;
END;
$FUNC$;

-- Get actorId
CREATE OR REPLACE FUNCTION get_actor_id()
	RETURNS text
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	system_email text := 'inreach_svc@inreach.org';
	actor_id text;
BEGIN
	IF (CURRENT_SETTING('app.actor_id', TRUE)::text IS NULL) THEN
		EXECUTE FORMAT('SELECT id FROM "User" WHERE email = %L', system_email) INTO actor_id;
	ELSE
		actor_id := CURRENT_SETTING('app.actor_id', TRUE)::text;
	END IF;
	RETURN actor_id;
END;
$FUNC$;

-- Create Audit Log function
CREATE OR REPLACE FUNCTION create_audit_entry()
	RETURNS TRIGGER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	actor_id text := get_actor_id();
	record_old jsonb = to_jsonb(OLD);
	record_new jsonb = ROW_TO_JSON(NEW);
	record_pkey_cols text[] = get_primary_key_columns(TG_RELID);
	record_pkey text[];
	using_clause text := '';
	pkey text;
BEGIN
	IF (TG_OP = 'DELETE') THEN
		FOREACH pkey IN ARRAY record_pkey_cols LOOP
			record_pkey := ARRAY_APPEND(record_pkey, record_old ->> pkey);
		END LOOP;
	ELSE
		FOREACH pkey IN ARRAY record_pkey_cols LOOP
			record_pkey := ARRAY_APPEND(record_pkey, record_new ->> pkey);
		END LOOP;
	END IF;
	CASE TG_OP
	WHEN 'DELETE' THEN
		INSERT INTO "AuditTrail"("table", table_oid, "recordId", operation, OLD, "actorId")
			VALUES (TG_TABLE_NAME::text, TG_RELID, record_pkey,
			'DELETE', record_old, actor_id);
			WHEN 'UPDATE' THEN
				INSERT INTO "AuditTrail"("table", table_oid, "recordId", operation, OLD, NEW, "actorId")
					VALUES (TG_TABLE_NAME::text, TG_RELID,
					record_pkey, 'UPDATE',
					record_old, record_new, actor_id);
					WHEN 'INSERT' THEN
						INSERT INTO "AuditTrail"("table", table_oid, "recordId", operation, OLD, NEW, "actorId")
							VALUES
							(TG_TABLE_NAME::text,
							TG_RELID, record_pkey,
							'INSERT',
							record_old, record_new,
							actor_id);
							END CASE;
					RETURN NULL;
					END;
$FUNC$;

CREATE OR REPLACE FUNCTION audit_trail_enable(tablename regclass)
	RETURNS void VOLATILE
	SECURITY DEFINER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	statement_row text = '
        CREATE TRIGGER audit_i_u_d
            AFTER INSERT OR UPDATE OR DELETE
            ON ' || tablename || '
            FOR EACH ROW
            EXECUTE PROCEDURE create_audit_entry();';
	pkey_cols text[] = get_primary_key_columns(tablename::oid);
BEGIN
	IF pkey_cols = ARRAY[]::text[] THEN
		RAISE EXCEPTION 'Table % can not be audited because it has no primary key', tablename;
	END IF;
	IF NOT EXISTS (
		SELECT
			1
		FROM
			pg_trigger
		WHERE
			tgrelid = tablename
			AND tgname = 'audit_i_u_d') THEN
	EXECUTE statement_row;
END IF;
END;
$FUNC$;

CREATE OR REPLACE FUNCTION audit_trail_disable(tablename regclass)
	RETURNS void VOLATILE
	SECURITY DEFINER
	LANGUAGE plpgsql
	AS $FUNC$
DECLARE
	statement_row text = 'DROP TRIGGER IF EXISTS audit_i_u_d on ' || tablename;
BEGIN
	EXECUTE statement_row;
END;
$FUNC$;
