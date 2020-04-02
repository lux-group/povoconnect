DROP FUNCTION IF EXISTS unit_tests.trigger_log_insert();

CREATE FUNCTION unit_tests.trigger_log_insert()
RETURNS test_result
AS
$$
DECLARE
    message test_result;
    result boolean;
    have text;
    want text;
BEGIN
		want := 'test';

    PERFORM factories.opportunity(want);

		SELECT hstore(values)->'name' FROM salesforce._trigger_log INTO have;

    SELECT * FROM assert.is_equal(have, want) INTO message, result;

    --Test failed.
    IF result = false THEN
      RETURN message;
    END IF;

    --Test passed.
    SELECT assert.ok('End of test.') INTO message;
    RETURN message;
END
$$
LANGUAGE plpgsql;
