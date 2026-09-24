import "server-only";
import { createClient } from "@supabase/supabase-js";

export type Greeting = {
  id: number;
  phrase: string;
  language: string;
  description: string;
};

export type GreetingsResult =
  | { status: "ready"; greetings: Greeting[] }
  | { status: "unconfigured" | "unavailable"; greetings: [] };

export async function getGreetings(): Promise<GreetingsResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return { status: "unconfigured", greetings: [] };

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, {
          ...init,
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }),
      },
    });
    const { data, error } = await supabase
      .from("greetings")
      .select("id, phrase, language, description")
      .order("id", { ascending: true });

    if (error || !data) return { status: "unavailable", greetings: [] };
    return { status: "ready", greetings: data };
  } catch {
    return { status: "unavailable", greetings: [] };
  }
}
