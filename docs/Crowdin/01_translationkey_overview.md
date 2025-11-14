# TranslationKey Table Overview
## Purpose:
- Understand how many translation keys exist in each namespace.
- Useful for cost estimation in Crowdin.
- This query provides a quick overview of the TranslationKey table.

```sql
-- Count total rows and keys per namespace
SELECT
    ns AS namespace,
    COUNT(*) AS total_keys
FROM public."TranslationKey"
GROUP BY ns
ORDER BY total_keys DESC;
