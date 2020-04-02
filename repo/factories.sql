CREATE SCHEMA IF NOT EXISTS factories;

DROP FUNCTION IF EXISTS factories.opportunity(
  name character
);

CREATE FUNCTION factories.opportunity(
	name character
)
RETURNS void
AS
$$
BEGIN
    INSERT INTO salesforce.opportunity (
				name
    ) VALUES (
				name
    );
END;
$$ LANGUAGE plpgsql;
