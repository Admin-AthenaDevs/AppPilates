import { Flower2, LockKeyhole } from "lucide-react";

export default function LoginFallback({ configured }: { configured: boolean }) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-brand"><span className="brand-mark"><Flower2 size={22} /></span><span>Casa Forma</span></div>
        <span className="panel-kicker">ESPACIO DE TRABAJO</span>
        <h1>Qué bueno tenerte aquí.</h1>
        <p>Accede a la gestión de tu estudio.</p>
        <form className="login-form">
          <label className="field-label">Correo electrónico<input type="email" autoComplete="email" required disabled={!configured} /></label>
          <label className="field-label">Contraseña<input type="password" autoComplete="current-password" required disabled={!configured} /></label>
          <button className="button button-primary login-submit" type="button" disabled={!configured}><LockKeyhole size={15} />Iniciar sesión</button>
        </form>
        <p className="login-footnote">¿Necesitas acceso? Pide una invitación a la administración del estudio.</p>
      </section>
    </main>
  );
}
