"use server";
import { IS_DEMO, DEMO_USER } from "@/lib/demo";

// Mock Supabase user shape for demo mode
const mockUser = {
  id: DEMO_USER.id,
  email: DEMO_USER.email,
  user_metadata: { full_name: DEMO_USER.fullName },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeMockClient(): any {
  return {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      signOut: async () => ({ error: null }),
    },
    storage: {
      from: () => ({
        createSignedUploadUrl: async () => ({
          data: { signedUrl: "https://example.com/mock-upload" },
          error: null,
        }),
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://example.com/media/${path}` },
        }),
        upload: async () => ({ error: null }),
      }),
    },
  };
}

export async function createClient() {
  if (IS_DEMO) return makeMockClient();

  const { createServerClient } = await import("@supabase/ssr");
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
