import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const schema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(120).optional(),
});

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient<Database>(process.env.SUPABASE_URL!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const email = data.email.toLowerCase();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email, source: data.source ?? "footer" });

    if (error) {
      // Unique violation — already on the list, treat as success.
      if (error.code === "23505") return { ok: true, alreadySubscribed: true };
      console.error("newsletter subscribe failed", error.code, error.message);
      return { ok: false, alreadySubscribed: false };
    }
    return { ok: true, alreadySubscribed: false };
  });
