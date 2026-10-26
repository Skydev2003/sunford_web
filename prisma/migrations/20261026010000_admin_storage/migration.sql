-- Admin membership is managed only by trusted database/server tooling.
CREATE TABLE "public"."admin_users" (
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_users_pkey" PRIMARY KEY ("user_id"),
  CONSTRAINT "admin_users_auth_user_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
);
ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "public"."admin_users" FROM anon, authenticated;
GRANT SELECT ON "public"."admin_users" TO authenticated;
CREATE POLICY "read_own_admin_membership" ON "public"."admin_users"
  FOR SELECT TO authenticated USING ("user_id" = (SELECT auth.uid()));

-- Bucket metadata creation through SQL is supported by Supabase Storage.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "sunford_admin_upload_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );
CREATE POLICY "sunford_admin_read_images" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );
CREATE POLICY "sunford_admin_delete_images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = (SELECT auth.uid()))
  );
