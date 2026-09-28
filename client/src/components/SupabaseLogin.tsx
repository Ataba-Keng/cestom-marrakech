import { useState } from "react";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function SupabaseLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  if (!supabaseConfigured || !supabase) return null;
  const client = supabase;
  return <form className="flex w-full max-w-md flex-col gap-4" onSubmit={async event => { event.preventDefault(); setError(null); setLoading(true); const result = await client.auth.signInWithPassword({ email, password }); setLoading(false); if (result.error) setError(result.error.message); }}><label className="text-left text-sm font-semibold">E-mail<input type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe8e0] px-3.5" /></label><label className="text-left text-sm font-semibold">Mot de passe<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dfe8e0] px-3.5" /></label>{error && <p className="rounded-xl bg-[#fff1f1] px-4 py-3 text-sm text-[#b42318]">{error}</p>}<button disabled={loading} className="rounded-full bg-[#075b36] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60">{loading ? "Connexion…" : "Se connecter avec Supabase"}</button></form>;
}
