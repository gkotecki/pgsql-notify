CREATE TABLE IF NOT EXISTS records (
	"id" SERIAL,
	"label" VARCHAR(64) NOT NULL,
	"value" VARCHAR(64) NOT NULL
);

CREATE OR REPLACE FUNCTION notify_trigger()
RETURNS trigger AS $$
DECLARE
BEGIN
  RAISE NOTICE '%', 'HI';
  PERFORM pg_notify('records-changes', TG_TABLE_NAME);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER watched_table_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON records
    FOR EACH ROW
    EXECUTE PROCEDURE notify_trigger();

-- INSERT INTO records (label, value) VALUES ('one', '1'), ('two', '2'), ('three', '3'), ('four', '4')
