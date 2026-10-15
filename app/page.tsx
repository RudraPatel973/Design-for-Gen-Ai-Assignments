import { HelloHome } from "@/components/hello-home";
import { createClient } from "@/lib/supabase/server";
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <HelloHome signedIn={Boolean(user)} />;
}
