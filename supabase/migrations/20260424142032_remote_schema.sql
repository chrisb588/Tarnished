drop extension if exists "pg_net";

alter table "public"."listing" add column "expires_at" timestamp with time zone;

alter table "public"."listing" add column "is_sold_out" boolean not null default false;


  create policy "Allow authenticated uploads 1ps738_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'media'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Give users access to own folder 1ps738_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'media'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1ps738_1"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'media'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1ps738_2"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'media'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Give users access to own folder 1ps738_3"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'media'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



