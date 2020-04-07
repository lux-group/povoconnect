SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
  pg_catalog.set_config('search_path', '', FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

CREATE SCHEMA salesforce;

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;

CREATE FUNCTION public.get_xmlbinary ()
  RETURNS character varying
  LANGUAGE plpgsql
  AS $$
DECLARE
  xmlbin varchar;
BEGIN
  SELECT
    INTO xmlbin setting
  FROM
    pg_settings
  WHERE
    name = 'xmlbinary';
  RETURN xmlbin;
END;
$$;

CREATE FUNCTION salesforce.hc_capture_insert_from_row (source_row public.hstore, table_name character varying, excluded_cols text[] DEFAULT ARRAY[] ::text[])
  RETURNS integer
  LANGUAGE plpgsql
  AS $$
DECLARE
  excluded_cols_standard text[] = ARRAY['_hc_lastop', '_hc_err']::text[];
  retval int;
BEGIN
  -- VERSION 1 --
  IF (source_row -> 'id') IS NULL THEN
    -- source_row is required to have an int id value
    RETURN NULL;
  END IF;
  excluded_cols_standard := array_remove(array_remove(excluded_cols, 'id'), 'sfid') || excluded_cols_standard;
  INSERT INTO "salesforce"."_trigger_log" (action, table_name, txid, created_at, state, record_id,
      VALUES
)
    VALUES ('INSERT', table_name, txid_current(), clock_timestamp(), 'NEW', (source_row -> 'id')::int, source_row - excluded_cols_standard)
  RETURNING
    id INTO retval;
      RETURN retval;
END;
$$;

CREATE FUNCTION salesforce.hc_capture_update_from_row (source_row public.hstore, table_name character varying, columns_to_include text[] DEFAULT ARRAY[] ::text[])
  RETURNS integer
  LANGUAGE plpgsql
  AS $$
DECLARE
  excluded_cols_standard text[] = ARRAY['_hc_lastop', '_hc_err']::text[];
  excluded_cols text[];
  retval int;
BEGIN
  -- VERSION 1 --
  IF (source_row -> 'id') IS NULL THEN
    -- source_row is required to have an int id value
    RETURN NULL;
  END IF;
  IF array_length(columns_to_include, 1) <> 0 THEN
    excluded_cols := ARRAY (
      SELECT
        skeys (source_row)
      EXCEPT
      SELECT
        unnest(columns_to_include));
  END IF;
  excluded_cols_standard := excluded_cols || excluded_cols_standard;
  INSERT INTO "salesforce"."_trigger_log" (action, table_name, txid, created_at, state, record_id, sfid,
      VALUES
, old)
    VALUES ('UPDATE', table_name, txid_current(), clock_timestamp(), 'NEW', (source_row -> 'id')::int, source_row -> 'sfid', source_row - excluded_cols_standard, NULL)
  RETURNING
    id INTO retval;
      RETURN retval;
END;
$$;

CREATE FUNCTION salesforce.tlog_notify_trigger ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
DECLARE
BEGIN
  -- VERSION 1 --
  PERFORM
    pg_notify('salesforce.hc_trigger_log', 'ping');
  RETURN new;
END;
$$;

SET default_tablespace = '';

SET default_with_oids = FALSE;

CREATE TABLE salesforce._hcmeta (
  id integer NOT NULL,
  hcver integer,
  org_id character varying(50),
  details text
);

CREATE SEQUENCE salesforce._hcmeta_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE salesforce._hcmeta_id_seq OWNED BY salesforce._hcmeta.id;

CREATE TABLE salesforce._sf_event_log (
  id integer NOT NULL,
  table_name character varying(128),
  action character varying(7),
  synced_at timestamp with time zone DEFAULT now(),
  sf_timestamp timestamp with time zone,
  sfid character varying(20),
  record text,
  processed boolean
);

CREATE SEQUENCE salesforce._sf_event_log_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE salesforce._sf_event_log_id_seq OWNED BY salesforce._sf_event_log.id;

CREATE TABLE salesforce._trigger_log (
  id integer NOT NULL,
  txid bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone,
  processed_tx bigint,
  state character varying(8),
  action character varying(7),
  table_name character varying(128),
  record_id integer,
  sfid character varying(18),
  old text,
  "values" text,
  sf_result integer,
  sf_message text
);

CREATE TABLE salesforce._trigger_log_archive (
  id integer NOT NULL,
  txid bigint,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  processed_at timestamp with time zone,
  processed_tx bigint,
  state character varying(8),
  action character varying(7),
  table_name character varying(128),
  record_id integer,
  sfid character varying(18),
  old text,
  "values" text,
  sf_result integer,
  sf_message text
);

CREATE SEQUENCE salesforce._trigger_log_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE salesforce._trigger_log_id_seq OWNED BY salesforce._trigger_log.id;

ALTER TABLE ONLY salesforce._hcmeta
  ALTER COLUMN id SET DEFAULT nextval('salesforce._hcmeta_id_seq'::regclass);

ALTER TABLE ONLY salesforce._sf_event_log
  ALTER COLUMN id SET DEFAULT nextval('salesforce._sf_event_log_id_seq'::regclass);

ALTER TABLE ONLY salesforce._trigger_log
  ALTER COLUMN id SET DEFAULT nextval('salesforce._trigger_log_id_seq'::regclass);

ALTER TABLE ONLY salesforce._hcmeta
  ADD CONSTRAINT _hcmeta_pkey PRIMARY KEY (id);

ALTER TABLE ONLY salesforce._sf_event_log
  ADD CONSTRAINT _sf_event_log_pkey PRIMARY KEY (id);

ALTER TABLE ONLY salesforce._trigger_log_archive
  ADD CONSTRAINT _trigger_log_archive_pkey PRIMARY KEY (id);

ALTER TABLE ONLY salesforce._trigger_log
  ADD CONSTRAINT _trigger_log_pkey PRIMARY KEY (id);

CREATE INDEX _trigger_log_archive_idx_created_at ON salesforce._trigger_log_archive USING btree (created_at);

CREATE INDEX _trigger_log_archive_idx_record_id ON salesforce._trigger_log_archive USING btree (record_id);

CREATE INDEX _trigger_log_archive_idx_state_table_name ON salesforce._trigger_log_archive USING btree (state, table_name)
WHERE ((state)::text = 'FAILED'::text);

CREATE INDEX _trigger_log_idx_created_at ON salesforce._trigger_log USING btree (created_at);

CREATE INDEX _trigger_log_idx_state_id ON salesforce._trigger_log USING btree (state, id);

CREATE INDEX _trigger_log_idx_state_table_name ON salesforce._trigger_log USING btree (state, table_name)
WHERE (((state)::text = 'NEW'::text) OR ((state)::text = 'PENDING'::text));

CREATE INDEX idx__sf_event_log_comp_key ON salesforce._sf_event_log USING btree (table_name, synced_at);

CREATE INDEX idx__sf_event_log_sfid ON salesforce._sf_event_log USING btree (sfid);

CREATE TRIGGER tlog_insert_trigger
  AFTER INSERT ON salesforce._trigger_log
  FOR EACH ROW
  EXECUTE PROCEDURE salesforce.tlog_notify_trigger ();

--- opportunity example table
CREATE FUNCTION salesforce.hc_opportunity_logger ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
DECLARE
  trigger_row "salesforce"."_trigger_log";
  excluded_cols text[] = ARRAY['_hc_lastop', '_hc_err']::text[];
BEGIN
  -- VERSION 4 --
  trigger_row = ROW ();
  trigger_row.id = nextval('"salesforce"."_trigger_log_id_seq"');
  trigger_row.action = TG_OP::text;
  trigger_row.table_name = TG_TABLE_NAME::text;
  trigger_row.txid = txid_current();
  trigger_row.created_at = clock_timestamp();
  trigger_row.state = 'READONLY';
  IF (TG_OP = 'DELETE') THEN
    trigger_row.record_id = OLD.id;
    trigger_row.old = hstore (OLD.*) - excluded_cols;
    IF (OLD.sfid IS NOT NULL) THEN
      trigger_row.sfid = OLD.sfid;
    END IF;
    ELSEIF (TG_OP = 'INSERT') THEN
    trigger_row.record_id = NEW.id;
    trigger_row.values = hstore (NEW.*) - excluded_cols;
    ELSEIF (TG_OP = 'UPDATE') THEN
    trigger_row.record_id = NEW.id;
    trigger_row.old = hstore (OLD.*) - excluded_cols;
    trigger_row.values = (hstore (NEW.*) - hstore (trigger_row.old)) - excluded_cols;
    IF (OLD.sfid IS NOT NULL) THEN
      trigger_row.sfid = OLD.sfid;
    END IF;
  END IF;
  INSERT INTO "salesforce"."_trigger_log"
    VALUES (trigger_row.*);
  RETURN NULL;
END;
$$;

CREATE FUNCTION salesforce.hc_opportunity_status ()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  IF (get_xmlbinary () = 'base64') THEN
    -- user op
    NEW._hc_lastop = 'PENDING';
    NEW._hc_err = NULL;
    RETURN NEW;
  ELSE
    -- connect op
    IF (TG_OP = 'UPDATE' AND NEW._hc_lastop IS NOT NULL AND NEW._hc_lastop != OLD._hc_lastop) THEN
      RETURN NEW;
    END IF;
    NEW._hc_lastop = 'SYNCED';
    NEW._hc_err = NULL;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TABLE salesforce.opportunity (
  sfid character varying(18),
  id integer NOT NULL,
  name character varying(255) NOT NULL,
  systemmodstamp timestamp WITHOUT time zone,
  createddate timestamp WITHOUT time zone
);

CREATE SEQUENCE salesforce.opportunity_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

ALTER SEQUENCE salesforce.opportunity_id_seq OWNED BY salesforce.opportunity.id;

ALTER TABLE ONLY salesforce.opportunity
  ALTER COLUMN id SET DEFAULT nextval('salesforce.opportunity_id_seq'::regclass);

ALTER TABLE ONLY salesforce.opportunity
  ADD CONSTRAINT opportunity_pkey PRIMARY KEY (id);

CREATE INDEX hc_idx_opportunity_systemmodstamp ON salesforce.opportunity USING btree (systemmodstamp);

CREATE UNIQUE INDEX hcu_idx_opportunity_sfid ON salesforce.opportunity USING btree (sfid);

CREATE TRIGGER hc_opportunity_logtrigger
  AFTER INSERT OR DELETE OR UPDATE ON salesforce.opportunity
  FOR EACH ROW
  WHEN (((public.get_xmlbinary ())::text = 'base64'::text))
  EXECUTE PROCEDURE salesforce.hc_opportunity_logger ();

CREATE TRIGGER hc_opportunity_status_trigger
  BEFORE INSERT OR UPDATE ON salesforce.opportunity
  FOR EACH ROW
  EXECUTE PROCEDURE salesforce.hc_opportunity_status ();
