alter table "public"."merchant" alter column "category" drop default;

alter table "public"."merchant" alter column "category" set data type character varying[] using "category"::character varying[];


