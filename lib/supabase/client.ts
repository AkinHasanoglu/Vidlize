"use client";

export function createClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      auth: {
        signInWithPassword: async () => ({ error: null }),
        signUp: async () => ({ error: null }),
        signInWithOAuth: async () => ({ error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({
          data: { user: { id: "demo-user-001", email: "demo@ugcstudio.co" } },
          error: null,
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  const { createBrowserClient } = require("@supabase/ssr");
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
