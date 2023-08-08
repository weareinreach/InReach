CREATE OR REPLACE FUNCTION update_geo_point()
	RETURNS TRIGGER
	LANGUAGE plpgsql
	AS $$
BEGIN
	NEW.geo := st_point(NEW.longitude, NEW.latitude, 4326);
	NEW."geoJSON" := ST_AsGeoJSON(NEW.geo);
	NEW."geoWKT" := ST_AsText(NEW.geo);
	RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_geo_trigger
	BEFORE INSERT OR UPDATE OF latitude,
	longitude ON "OrgLocation"
	FOR EACH ROW
	EXECUTE FUNCTION update_geo_point();

