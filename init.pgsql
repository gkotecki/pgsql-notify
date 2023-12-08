CREATE TABLE IF NOT EXISTS records (
    "id" SERIAL,
    "value" VARCHAR(64) NOT NULL
);

CREATE OR REPLACE FUNCTION notify_trigger()
    RETURNS trigger AS $$
    DECLARE
    BEGIN
        PERFORM pg_notify('records-changes', TG_TABLE_NAME);
        RETURN new;
    END;
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER watched_table_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON records
    FOR EACH ROW
    EXECUTE PROCEDURE notify_trigger();

-- INSERT INTO records (value) VALUES ('aaa'), ('bbb'), ('ccc'), ('ddd')
