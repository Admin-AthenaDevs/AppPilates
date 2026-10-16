"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Flower2, LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginForm({ accessError, configured }: { accessError: string; configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) {
      setError("Falta configurar Supabase. Revisa las variables del proyecto.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? `No fue posible iniciar sesión: ${cause.message}` : "No fue posible conectar con el servicio de autenticación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand"><span className="brand-mark"><Flower2 size={22} /></span><span>Casa Forma</span></div>
        <span className="panel-kicker">ESPACIO DE TRABAJO</span>
        <h1>Qué bueno tenerte aquí.</h1>
        <p>Accede a la gestión de tu estudio.</p>
        {accessError === "access" && <div className="login-alert">Tu cuenta no tiene acceso a este estudio. Contacta con la persona administradora.</div>}
        {accessError === "config" && <div className="login-alert">Supabase todavía no está configurado para esta instancia.</div>}
        {accessError === "link" && <div className="login-alert">El enlace de acceso caducó o ya fue utilizado. Pide una invitación nueva.</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">Correo electrónico<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={!configured || loading} /></label>
          <label className="field-label">Contraseña<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={!configured || loading} /></label>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={!configured || loading}><LockKeyhole size={15} />{loading ? "Iniciando sesión…" : "Iniciar sesión"}</button>
        </form>
        <p className="login-footnote">¿Necesitas acceso? Pide una invitación a la administración del estudio.</p>
      </section>
    </main>
  );
}