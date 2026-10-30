-- Audit logging is an explicit per-table opt-in (audit_trail_enable, defined in
-- 20230831221453_audit_log_fns), not automatic for every table - OrgUrlDuplicateException was created
-- without it, so every create/update/delete/restore against it so far has left no audit trail at all.
SELECT audit_trail_enable(to_regclass('public."OrgUrlDuplicateException"'));
