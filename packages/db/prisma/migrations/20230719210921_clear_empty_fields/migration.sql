-- Clear blank fields
UPDATE
	"OrgLocation"
SET
	"street2" = NULL
WHERE
	"street2" = '';

UPDATE
	"OrgLocation"
SET
	"name" = NULL
WHERE
	"name" = '';

