"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";

const initialState = { error: "" };

export default function SetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <main className="login-shell">
      <section className="login-panel">
        <span className="panel-kicker">PRIMER ACCESO</span>
        <h1>Define tu contraseña.</h1>
        <p>Usa al menos 12 caracteres para proteger tu cuenta.</p>
        <form className="login-form" action={action}>
          <label className="field-label">Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={12} required /></label>
          {state.error && <p className="field-error" role="alert">{state.error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar contraseña"}</button>
        </form>
      </section>
    </main>
  );
}