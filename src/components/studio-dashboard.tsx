"use client";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CreditCard,
  Dumbbell,
  Flower2,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from "react";
import { formatStudioCurrency, getStudioCountry, STUDIO_COUNTRIES, SUPPORTED_CURRENCIES } from "@/lib/region-config";

type Section = "overview" | "schedule" | "students" | "plans" | "library" | "settings";
type UserRole = "admin" | "instructor" | "student";

type StudioSettings = {
  name: string;
  logoUrl: string;
  primary: string;
  accent: string;
  countryCode: string;
  currency: string;
  timezone: string;
  locale: string;
  cancellation: string;
};

type ClassSession = {
  id: string;
  time: string;
  title: string;
  instructor: string;
  room: string;
  booked: number;
  capacity: number;
  kind: "Reformer" | "Mat" | "Privada";
  color: string;
};

type StudioVideo = {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  plan: string;
  image: string;
  previewUrl?: string;
};

const defaultSettings: StudioSettings = {
  name: "Casa Forma",
  logoUrl: "",
  primary: "#176b5b",
  accent: "#e89a78",
  countryCode: "ES",
  currency: "EUR",
  timezone: "Europe/Madrid",
  locale: "es-ES",
  cancellation: "Cancela hasta 8 horas antes para recuperar tu crédito.",
};

const initialClasses: ClassSession[] = [
  { id: "c1", time: "08:00", title: "Reformer · Fundamentos", instructor: "Lucía Moreno", room: "Sala Reformer", booked: 5, capacity: 6, kind: "Reformer", color: "sage" },
  { id: "c2", time: "09:15", title: "Mat · Espalda feliz", instructor: "Nora Vidal", room: "Sala Mat", booked: 8, capacity: 10, kind: "Mat", color: "peach" },
  { id: "c3", time: "10:30", title: "Reformer · Flow", instructor: "Lucía Moreno", room: "Sala Reformer", booked: 6, capacity: 6, kind: "Reformer", color: "lavender" },
  { id: "c4", time: "12:00", title: "Sesión privada", instructor: "Mateo Ruiz", room: "Sala privada", booked: 1, capacity: 1, kind: "Privada", color: "blue" },
  { id: "c5", time: "17:30", title: "Reformer · Nivel 2", instructor: "Mateo Ruiz", room: "Sala Reformer", booked: 4, capacity: 6, kind: "Reformer", color: "sage" },
];

const initialStudents = [
  { name: "Clara Fernández", email: "clara.f@email.com", plan: "Reformer 8", attendance: 92, status: "Activa", initials: "CF", color: "coral" },
  { name: "Marina López", email: "marina.l@email.com", plan: "Mat ilimitado", attendance: 86, status: "Activa", initials: "ML", color: "green" },
  { name: "Elena Martín", email: "elena.m@email.com", plan: "Reformer 4", attendance: 74, status: "Activa", initials: "EM", color: "blue" },
  { name: "Sofía Navarro", email: "sofia.n@email.com", plan: "Sesión privada", attendance: 100, status: "Activa", initials: "SN", color: "gold" },
  { name: "Paula Romero", email: "paula.r@email.com", plan: "Mat ilimitado", attendance: 61, status: "Por renovar", initials: "PR", color: "plum" },
];

const initialVideos: StudioVideo[] = [
  { id: "v1", title: "Movilidad para empezar el día", instructor: "Lucía Moreno", duration: "12 min", level: "Todos los niveles", plan: "Mat ilimitado", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=960&q=85" },
  { id: "v2", title: "Control y estabilidad en reformer", instructor: "Mateo Ruiz", duration: "18 min", level: "Intermedio", plan: "Reformer completo", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=960&q=80&sat=-40" },
  { id: "v3", title: "Descarga lumbar en 10 minutos", instructor: "Nora Vidal", duration: "10 min", level: "Inicial", plan: "Mat ilimitado", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=960&q=85" },
];

const navItems: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard },
  { id: "schedule", label: "Agenda", icon: CalendarDays },
  { id: "students", label: "Alumnos", icon: Users },
  { id: "plans", label: "Planes y pagos", icon: CreditCard },
  { id: "library", label: "Biblioteca", icon: Video },
];

const sectionCopy: Record<Section, { title: string; description: string }> = {
  overview: { title: "Buenos días, Lucía", description: "Aquí tienes el pulso de tu estudio para hoy." },
  schedule: { title: "Agenda", description: "Clases, salas y disponibilidad de esta semana." },
  students: { title: "Alumnos", description: "Relaciones, asistencia y actividad reciente." },
  plans: { title: "Planes y pagos", description: "Membresías, bonos y actividad de cobro." },
  library: { title: "Biblioteca", description: "Clases bajo demanda y clips exclusivos por plan." },
  settings: { title: "Ajustes del estudio", description: "Identidad visual y políticas de Casa Forma." },
};

const plans = [
  { name: "Mat ilimitado", detail: "Clases de Mat sin límite", amount: 89, period: "/ mes", tone: "mint", members: 42 },
  { name: "Reformer 8", detail: "8 clases de Reformer al mes", amount: 129, period: "/ mes", tone: "peach", members: 28 },
  { name: "Reformer completo", detail: "Reformer + biblioteca premium", amount: 169, period: "/ mes", tone: "ink", members: 16 },
];

const roleLabels: Record<UserRole, string> = {
  admin: "Administración",
  instructor: "Instructor/a",
  student: "Alumno/a",
};

const SETTINGS_STORAGE_KEY = "casa-forma-settings";
const SETTINGS_CHANGE_EVENT = "casa-forma-settings-change";

function subscribeToSettings(onStoreChange: () => void) {
  window.addEventListener(SETTINGS_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, onStoreChange);
}

function getSettingsSnapshot() {
  try {
    return window.localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseSettingsSnapshot(snapshot: string, base: Pick<StudioSettings, "name" | "logoUrl" | "primary" | "accent" | "countryCode" | "currency" | "timezone" | "locale">): StudioSettings {
  let saved: Partial<StudioSettings> = {};
  try {
    saved = JSON.parse(snapshot) as Partial<StudioSettings>;
  } catch {
    saved = {};
  }
  const validColor = (value: string | undefined, fallback: string) => value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  const countryCode = STUDIO_COUNTRIES.some((country) => country.code === saved.countryCode) ? saved.countryCode! : base.countryCode;
  const country = getStudioCountry(countryCode);
  const timezones = new Set(STUDIO_COUNTRIES.map((item) => item.timezone));
  const currencies = new Set<string>(SUPPORTED_CURRENCIES.map((item) => item.code));
  return {
    name: typeof saved.name === "string" ? saved.name : base.name,
    logoUrl: typeof saved.logoUrl === "string" ? saved.logoUrl : base.logoUrl,
    primary: validColor(saved.primary, base.primary),
    accent: validColor(saved.accent, base.accent),
    countryCode,
    currency: typeof saved.currency === "string" && currencies.has(saved.currency) ? saved.currency : countryCode === base.countryCode ? base.currency : country.currency,
    timezone: typeof saved.timezone === "string" && timezones.has(saved.timezone) ? saved.timezone : country.timezone,
    locale: country.locale,
    cancellation: typeof saved.cancellation === "string" ? saved.cancellation : defaultSettings.cancellation,
  };
}

function subscribeToDate() {
  return () => undefined;
}

function getClientDate(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const dateParts = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

function formatDate(baseDate: string, offset: number, locale: string) {
  if (!baseDate) return offset === 0 ? "hoy" : "Fecha próxima";
  const [year, month, day] = baseDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(date);
}

function safeLogoUrl(value: string) {
  if (/^\/(?!\/)[a-zA-Z0-9/_%.-]+$/.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function MetricCard({ label, value, change, icon: Icon, tone }: { label: string; value: string; change: string; icon: LucideIcon; tone: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
      <span className="metric-label">{label}</span>
      <div className="metric-value-row"><strong>{value}</strong><span className="metric-change"><ArrowUpRight size={13} /> {change}</span></div>
    </article>
  );
}

export default function StudioDashboard({ initialSettings }: { initialSettings: Pick<StudioSettings, "name" | "logoUrl" | "primary" | "accent" | "countryCode" | "currency" | "timezone" | "locale"> }) {
  const [section, setSection] = useState<Section>("overview");
  const [role, setRole] = useState<UserRole>("admin");
  const settingsSnapshot = useSyncExternalStore(subscribeToSettings, getSettingsSnapshot, () => "");
  const settings = settingsSnapshot ? parseSettingsSnapshot(settingsSnapshot, initialSettings) : { ...defaultSettings, ...initialSettings };
  const [classes, setClasses] = useState(initialClasses);
  const [videos, setVideos] = useState(initialVideos);
  const [memberPlan, setMemberPlan] = useState("Mat ilimitado");
  const [search, setSearch] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<StudioVideo | null>(null);
  const [clipTitle, setClipTitle] = useState("");
  const [clipPlan, setClipPlan] = useState("Reformer completo");
  const [clipFile, setClipFile] = useState<File | null>(null);
  const [toast, setToast] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const todayIso = useSyncExternalStore(subscribeToDate, () => getClientDate(settings.timezone), () => "");
  const logoUrl = safeLogoUrl(settings.logoUrl);
  const logoStyle = logoUrl ? { backgroundImage: `url("${logoUrl}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined;

  useEffect(() => {
    document.documentElement.lang = settings.locale;
  }, [settings.locale]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3400);
  };

  const updateSettings = (next: StudioSettings) => {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));
    } catch {
      showToast("El navegador no permite guardar los ajustes localmente.");
    }
  };

  const selectSection = (next: Section) => {
    setSection(next);
    setMobileNavOpen(false);
  };

  const visibleStudents = initialStudents.filter((student) =>
    `${student.name} ${student.email} ${student.plan}`.toLowerCase().includes(search.toLowerCase()),
  );

  const bookClass = (classId: string) => {
    const session = classes.find((item) => item.id === classId);
    if (!session || session.booked >= session.capacity) {
      showToast("La clase está completa. Te avisaremos si se libera una plaza.");
      return;
    }
    setClasses((current) => current.map((item) => item.id === classId ? { ...item, booked: item.booked + 1 } : item));
    setBookingOpen(false);
    showToast(`Plaza reservada en ${session.title}. Confirmación de demostración.`);
  };

  const submitClip = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clipTitle.trim() || !clipFile) {
      showToast("Añade un título y selecciona un vídeo para continuar.");
      return;
    }
    const previewUrl = URL.createObjectURL(clipFile);
    const newVideo: StudioVideo = {
      id: `upload-${Date.now()}`,
      title: clipTitle.trim(),
      instructor: "Lucía Moreno",
      duration: "Clip nuevo",
      level: "Vídeo del instructor",
      plan: clipPlan,
      image: "",
      previewUrl,
    };
    setVideos((current) => [newVideo, ...current]);
    setClipTitle("");
    setClipFile(null);
    setUploadOpen(false);
    showToast("Clip añadido a esta sesión de demostración. Aún no se ha subido a un servidor.");
  };

  const activatePlan = (planName: string) => {
    setMemberPlan(planName);
    showToast(`Plan ${planName} activado solo en esta demo; no se procesó ningún cobro.`);
  };

  const canViewVideo = (video: StudioVideo) => role !== "student" || video.plan === memberPlan;
  const currentCopy = sectionCopy[section];
  const shellStyle = {
    "--brand-primary": settings.primary,
    "--brand-accent": settings.accent,
  } as CSSProperties;

  const renderClassList = (compact = false) => (
    <div className={`class-list ${compact ? "compact" : ""}`}>
      {classes.map((item) => (
        <article className="class-row" key={item.id}>
          <div className="class-time"><strong>{item.time}</strong><span>45 min</span></div>
          <span className={`class-marker ${item.color}`} />
          <div className="class-info"><strong>{item.title}</strong><span>{item.instructor} <i>·</i> {item.room}</span></div>
          <div className="class-capacity"><div className="capacity-label"><Users size={13} /><span>{item.booked}/{item.capacity}</span></div><div className="capacity-track"><span style={{ width: `${(item.booked / item.capacity) * 100}%` }} /></div></div>
          {!compact && <button className="icon-button row-more" type="button" aria-label={`Más opciones para ${item.title}`} onClick={() => showToast("Las acciones administrativas se conectarán con el backend.")}><MoreHorizontal size={17} /></button>}
        </article>
      ))}
    </div>
  );

  const renderStudents = () => (
    <section className="content-section">
      <div className="section-toolbar"><div><h2>Directorio de alumnos</h2><p>88 perfiles · datos médicos restringidos por rol</p></div><button className="button button-primary" type="button" onClick={() => showToast("El alta de alumnos estará disponible al conectar la base de datos.")}><Plus size={16} /> Añadir alumno</button></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Alumno</th><th>Plan actual</th><th>Asistencia</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>
        {visibleStudents.map((student) => <tr key={student.email}><td><div className="person-cell"><span className={`avatar ${student.color}`}>{student.initials}</span><span><strong>{student.name}</strong><small>{student.email}</small></span></div></td><td>{student.plan}</td><td><div className="attendance-cell"><span>{student.attendance}%</span><div className="capacity-track"><span style={{ width: `${student.attendance}%` }} /></div></div></td><td><span className={`status-pill ${student.status === "Activa" ? "active" : "renew"}`}>{student.status}</span></td><td><button className="icon-button" type="button" aria-label={`Opciones de ${student.name}`} onClick={() => showToast(`Perfil de ${student.name}: demo local.`)}><MoreHorizontal size={17} /></button></td></tr>)}
      </tbody></table>{visibleStudents.length === 0 && <p className="empty-state">No hay alumnos que coincidan con la búsqueda.</p>}</div>
      <div className="privacy-note"><LockKeyhole size={15} /><span>El historial médico y las lesiones solo se muestran a roles autorizados; esta vista usa datos ficticios.</span></div>
    </section>
  );

  const renderPlans = () => (
    <section className="content-section">
      <div className="section-toolbar"><div><h2>Planes del estudio</h2><p>Precios de muestra en {settings.currency}; la biblioteca premium se desbloquea según el plan activo.</p></div><button className="button button-primary" type="button" onClick={() => showToast("Crea planes desde Ajustes cuando conectes la base de datos.")}><Plus size={16} /> Nuevo plan</button></div>
      <div className="plan-grid">{plans.map((plan) => <article className={`plan-card ${plan.tone}`} key={plan.name}><div className="plan-card-top"><span className="plan-symbol"><Dumbbell size={18} /></span><span className="plan-count">{plan.members} alumnos</span></div><div><h3>{plan.name}</h3><p>{plan.detail}</p></div><div className="plan-price"><strong>{formatStudioCurrency(plan.amount, settings.currency, settings.countryCode)}</strong><span>{plan.period}</span></div><button className="button button-outline" type="button" onClick={() => activatePlan(plan.name)}>{role === "student" ? "Elegir este plan" : "Vista previa del plan"}<ArrowRight size={15} /></button></article>)}</div>
      <div className="billing-banner"><div className="billing-icon"><CreditCard size={20} /></div><div><strong>Stripe no está conectado</strong><p>Los botones de plan funcionan en modo demostración; no se cobran pagos ni se guardan tarjetas.</p></div><span className="demo-tag">DEMO</span></div>
      <div className="section-toolbar activity-heading"><div><h2>Actividad reciente</h2><p>Movimientos de ejemplo de esta semana</p></div><button className="text-button" type="button" onClick={() => showToast("Mostrando los movimientos más recientes.")}>Ver todos <ArrowRight size={14} /></button></div>
      <div className="payment-list"><div><span className="payment-dot paid"><Check size={13} /></span><span><strong>Clara Fernández</strong><small>Reformer 8 · renovación mensual</small></span><b>{formatStudioCurrency(129, settings.currency, settings.countryCode)}</b><time>Hoy, 09:42</time></div><div><span className="payment-dot paid"><Check size={13} /></span><span><strong>Marina López</strong><small>Mat ilimitado · renovación mensual</small></span><b>{formatStudioCurrency(89, settings.currency, settings.countryCode)}</b><time>Ayer, 18:10</time></div><div><span className="payment-dot pending"><Clock3 size={13} /></span><span><strong>Paula Romero</strong><small>Reformer 4 · pago pendiente</small></span><b>{formatStudioCurrency(79, settings.currency, settings.countryCode)}</b><time>Ayer, 11:26</time></div></div>
    </section>
  );

  const renderLibrary = () => (
    <section className="content-section">
      <div className="section-toolbar"><div><h2>Movimiento para cada momento</h2><p>Clases y clips organizados por nivel y plan.</p></div>{role !== "student" && <button className="button button-primary" type="button" onClick={() => setUploadOpen(true)}><Plus size={16} /> Subir clip</button>}</div>
      {role === "student" && <div className="membership-note"><Sparkles size={16} /><span>Tu plan actual: <strong>{memberPlan}</strong>. Los vídeos con candado requieren otro plan.</span><button className="text-button" type="button" onClick={() => selectSection("plans")}>Ver planes <ArrowRight size={14} /></button></div>}
      <div className="video-grid">{videos.map((video) => {
        const allowed = canViewVideo(video);
        return <article className="video-card" key={video.id}>
          <button className={`video-cover ${video.previewUrl ? "uploaded-cover" : ""}`} type="button" onClick={() => allowed ? setActiveVideo(video) : selectSection("plans")} style={video.image ? { backgroundImage: `linear-gradient(180deg, transparent 35%, rgba(20,35,31,.5)), url("${video.image}")` } : undefined} aria-label={allowed ? `Reproducir ${video.title}` : `Ver planes para acceder a ${video.title}`}>
            {video.previewUrl ? <video className="cover-video" src={video.previewUrl} muted playsInline /> : <span className="cover-texture"><Flower2 size={30} /></span>}
            <span className="play-button">{allowed ? <Play size={17} fill="currentColor" /> : <LockKeyhole size={16} />}</span><span className="video-duration">{video.duration}</span>
          </button>
          <div className="video-card-content"><div className="video-meta"><span>{video.level}</span><span className="plan-lock"><LockKeyhole size={11} /> {video.plan}</span></div><h3>{video.title}</h3><div className="video-footer"><span>{video.instructor}</span>{role === "student" && !allowed ? <button className="unlock-link" type="button" onClick={() => selectSection("plans")}>Desbloquear</button> : <button className="icon-button" type="button" aria-label={`Más opciones de ${video.title}`} onClick={() => showToast("Las opciones del contenido se habilitarán al conectar el servicio de vídeo.")}><MoreHorizontal size={16} /></button>}</div></div>
        </article>;
      })}</div>
      <div className="upload-note"><Video size={15} /><span>Los clips añadidos aquí solo se previsualizan en este navegador. Para publicar vídeos de forma segura, conecta Mux y define el acceso en Stripe.</span></div>
    </section>
  );

  const renderSettings = () => (
    <section className="content-section settings-section">
      <div className="settings-column"><div className="settings-heading"><span className="settings-emblem"><Settings2 size={19} /></span><div><h2>Identidad del estudio</h2><p>Personaliza lo que ve tu equipo y tus alumnos.</p></div></div>
        <label className="field-label">Nombre del estudio<input value={settings.name} onChange={(event) => updateSettings({ ...settings, name: event.target.value })} /></label>
        <label className="field-label">Logo (URL HTTPS o ruta local)<input value={settings.logoUrl} onChange={(event) => updateSettings({ ...settings, logoUrl: event.target.value })} placeholder="https://.../logo.png" /></label>
        {settings.logoUrl && !logoUrl && <p className="field-error">Usa una URL segura HTTPS o una ruta local que empiece por /.</p>}
        <label className="field-label">País de origen<select value={settings.countryCode} onChange={(event) => { const country = getStudioCountry(event.target.value); updateSettings({ ...settings, countryCode: country.code, currency: country.currency, timezone: country.timezone, locale: country.locale }); }}><option value="" disabled>Selecciona un país</option>{STUDIO_COUNTRIES.map((country) => <option value={country.code} key={country.code}>{country.name}</option>)}</select></label>
        <label className="field-label">Moneda de cobro<select value={settings.currency} onChange={(event) => updateSettings({ ...settings, currency: event.target.value })}>{SUPPORTED_CURRENCIES.map((currency) => <option value={currency.code} key={currency.code}>{currency.code} · {currency.name}</option>)}</select><small>El país propone una moneda inicial; puedes cambiarla aquí.</small></label>
        <label className="field-label">Zona horaria<select value={settings.timezone} onChange={(event) => updateSettings({ ...settings, timezone: event.target.value })}>{Array.from(new Map(STUDIO_COUNTRIES.map((country) => [country.timezone, country])).values()).map((country) => <option value={country.timezone} key={country.timezone}>{country.name} · {country.timezone}</option>)}</select></label>
        <div className="color-fields"><label className="field-label">Color principal<span className="color-input"><input type="color" value={settings.primary} onChange={(event) => updateSettings({ ...settings, primary: event.target.value })} /><code>{settings.primary.toUpperCase()}</code></span></label><label className="field-label">Color de acento<span className="color-input"><input type="color" value={settings.accent} onChange={(event) => updateSettings({ ...settings, accent: event.target.value })} /><code>{settings.accent.toUpperCase()}</code></span></label></div>
        <div className="settings-preview"><span className="preview-logo" style={logoStyle}>{!logoUrl && <Flower2 size={19} />}</span><span><strong>{settings.name || "Tu estudio"}</strong><small>Vista previa de marca</small></span><span className="preview-swatch" style={{ background: settings.primary }} /><span className="preview-swatch" style={{ background: settings.accent }} /></div>
      </div>
      <div className="settings-column"><div className="settings-heading"><span className="settings-emblem peach"><CalendarDays size={19} /></span><div><h2>Políticas de reserva</h2><p>Configura las reglas que se aplican a tus clases.</p></div></div>
        <label className="field-label">Política de cancelación<textarea rows={4} value={settings.cancellation} onChange={(event) => updateSettings({ ...settings, cancellation: event.target.value })} /></label>
        <div className="policy-summary"><Clock3 size={17} /><div><strong>Ventana de cancelación</strong><span>8 horas antes del inicio · editable</span></div><button className="toggle-switch on" type="button" aria-label="Política automática activada" onClick={(event) => event.currentTarget.classList.toggle("on")}><span /></button></div>
        <div className="policy-summary"><Bell size={17} /><div><strong>Recordatorio de clase</strong><span>24 horas antes por email</span></div><button className="toggle-switch on" type="button" aria-label="Recordatorio activado" onClick={(event) => event.currentTarget.classList.toggle("on")}><span /></button></div>
        <p className="settings-footnote">Los ajustes de esta demo se guardan en este navegador. La sincronización multiusuario requiere conectar PostgreSQL.</p>
      </div>
    </section>
  );

  return (
    <div className="studio-app" style={shellStyle}>
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        <a className="brand-lockup" href="#inicio" onClick={(event) => { event.preventDefault(); selectSection("overview"); }}><span className="brand-mark" style={logoStyle}>{!logoUrl && <Flower2 size={22} strokeWidth={1.6} />}</span><span className="brand-copy"><strong>{settings.name || "Casa Forma"}</strong><small>STUDIO MANAGEMENT</small></span></a>
        <div className="workspace-switch"><span className="workspace-avatar">CF</span><span><strong>{settings.name || "Casa Forma"}</strong><small>Estudio de Madrid</small></span><ChevronDown size={15} /></div>
        <span className="nav-eyebrow">ESPACIO DE TRABAJO</span>
        <nav className="primary-nav" aria-label="Navegación principal">{navItems.map((item) => { const Icon = item.icon; return <button className={`nav-item ${section === item.id ? "selected" : ""}`} type="button" key={item.id} onClick={() => selectSection(item.id)}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span>{item.id === "schedule" && <span className="nav-count">5</span>}</button>; })}</nav>
        <span className="nav-eyebrow settings-label">ESTUDIO</span><button className={`nav-item ${section === "settings" ? "selected" : ""}`} type="button" onClick={() => selectSection("settings")}><Settings2 size={18} strokeWidth={1.8} /><span>Ajustes</span></button>
        <div className="sidebar-spacer" />
        <div className="help-card"><span className="help-icon"><CircleHelp size={18} /></span><strong>¿Necesitas una mano?</strong><p>Estamos aquí para ayudarte a que el estudio fluya.</p><button type="button" onClick={() => showToast("Escríbenos a soporte@casaforma.demo")}>Contactar soporte <ArrowRight size={13} /></button></div>
        <button className="profile-row" type="button" onClick={() => showToast("Cuenta de demostración · lucia@casaforma.demo")}><span className="profile-avatar">LM</span><span><strong>Lucía Moreno</strong><small>Propietaria</small></span><MoreHorizontal size={18} /></button>
      </aside>

      <main className="main-frame">
          <header className="topbar"><div className="mobile-brand"><button type="button" className="icon-button menu-toggle" aria-label="Abrir navegación" onClick={() => setMobileNavOpen((open) => !open)}><Menu size={21} /></button><span className="brand-mark" style={logoStyle}>{!logoUrl && <Flower2 size={20} />}</span></div><div className="breadcrumbs"><span>{settings.name}</span><ChevronRight size={14} /><strong>{section === "overview" ? "Resumen" : currentCopy.title}</strong></div><div className="topbar-actions"><label className="role-switch"><span>{roleLabels[role]}</span><select aria-label="Cambiar rol de demostración" value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option value="admin">Administración</option><option value="instructor">Instructor/a</option><option value="student">Alumno/a</option></select><ChevronDown size={13} /></label><button className={`icon-button notification-button ${notificationsOpen ? "pressed" : ""}`} type="button" aria-label="Notificaciones" onClick={() => setNotificationsOpen((open) => !open)}><Bell size={18} /><i /></button><span className="topbar-avatar">LM</span></div>
          {notificationsOpen && <div className="notifications-popover"><div><strong>Notificaciones</strong><button type="button" className="icon-button" aria-label="Cerrar notificaciones" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><p><span className="notification-dot" />Clara reservó Reformer · Fundamentos <small>Hace 12 min</small></p><p><span className="notification-dot peach-dot" />Hay 2 pagos por revisar <small>Hace 1 h</small></p><p><span className="notification-dot blue-dot" />Tu clase de las 17:30 está completa <small>Hoy</small></p></div>}
        </header>

        <div className="page-content">
          <div className="page-heading"><div><div className="date-eyebrow"><span className="live-dot" />{formatDate(todayIso, 0, settings.locale)}</div><h1>{currentCopy.title}</h1><p>{currentCopy.description}</p></div><div className="heading-actions">{section === "overview" && <button className="button button-soft" type="button" onClick={() => selectSection("schedule")}><CalendarDays size={16} /> Ver agenda</button>}{section === "schedule" && <button className="button button-primary" type="button" onClick={() => setBookingOpen(true)}><Plus size={16} /> Nueva reserva</button>}<span className="demo-tag heading-demo">MODO DEMO</span></div></div>

          {section === "overview" && <>
              <div className="metrics-grid"><MetricCard label="Ingresos del mes" value={formatStudioCurrency(8420, settings.currency, settings.countryCode)} change="12,8%" icon={CreditCard} tone="mint-icon" /><MetricCard label="Ocupación Reformer" value="82%" change="6,2%" icon={Activity} tone="peach-icon" /><MetricCard label="Alumnos activos" value="86" change="8 nuevos" icon={Users} tone="lavender-icon" /><MetricCard label="Retención" value="91,4%" change="3,1%" icon={ArrowUpRight} tone="blue-icon" /></div>
            <div className="dashboard-grid"><section className="panel schedule-panel"><div className="panel-heading"><div><span className="panel-kicker">EN EL ESTUDIO</span><h2>La agenda de hoy</h2></div><button className="text-button" type="button" onClick={() => selectSection("schedule")}>Agenda completa <ArrowRight size={14} /></button></div><div className="today-date"><CalendarDays size={14} /> {formatDate(todayIso, 0, settings.locale)}</div>{renderClassList(true)}<button className="panel-footer-link" type="button" onClick={() => selectSection("schedule")}>Ver todas las clases <ArrowRight size={14} /></button></section>
              <section className="panel occupancy-panel"><div className="panel-heading"><div><span className="panel-kicker">CAPACIDAD SEMANAL</span><h2>Reformer en movimiento</h2></div><button className="icon-button" aria-label="Más opciones de ocupación" type="button" onClick={() => showToast("Datos de ocupación de ejemplo.")}><MoreHorizontal size={18} /></button></div><div className="occupancy-summary"><strong>82<span>%</span></strong><span className="positive-change"><ArrowUpRight size={14} /> 6,2% vs. semana anterior</span></div><div className="chart-area" aria-label="Ocupación semanal: lunes 68%, martes 82%, miércoles 74%, jueves 91%, viernes 78%, sábado 88%"><div className="chart-y-labels"><span>100%</span><span>75%</span><span>50%</span><span>25%</span></div><div className="chart-bars">{[{ day: "L", value: 68 }, { day: "M", value: 82 }, { day: "X", value: 74 }, { day: "J", value: 91 }, { day: "V", value: 78 }, { day: "S", value: 88 }].map((bar) => <div className="chart-column" key={bar.day}><div className="chart-track"><span style={{ height: `${bar.value}%` }} /></div><small>{bar.day}</small></div>)}</div></div><div className="occupancy-legend"><span><i /> Ocupación</span><span>48 de 58 plazas reservadas</span></div></section>
              <section className="panel retention-panel"><div className="panel-heading"><div><span className="panel-kicker">COMUNIDAD</span><h2>Alumnas que vuelven</h2></div><span className="retention-icon"><Flower2 size={17} /></span></div><div className="retention-score"><span>91,4%</span><span className="retention-caption">retención trimestral</span></div><div className="retention-line"><span /><span /><span /><span /><span /><span /><span /></div><div className="retention-foot"><span>Enhorabuena, vas por buen camino.</span><button type="button" onClick={() => selectSection("students")}>Ver alumnos <ArrowRight size={13} /></button></div></section>
              <section className="panel studio-note-panel"><div className="note-photo"><span className="photo-caption">EL MOVIMIENTO SE SIENTE</span><span className="photo-brand"><Flower2 size={18} /> {settings.name}</span></div><div className="note-body"><span className="panel-kicker">UN ESPACIO PARA VOLVER A TI</span><h2>Un día a la vez.<br />Un movimiento a la vez.</h2><p>Tu espacio está listo para recibir a cada alumna.</p><button type="button" onClick={() => selectSection("library")}>Explorar biblioteca <ArrowRight size={14} /></button></div></section>
            </div>
          </>}

          {section === "schedule" && <section className="content-section"><div className="schedule-toolbar"><div className="week-nav"><button className="icon-button" type="button" aria-label="Semana anterior" onClick={() => setWeekOffset((value) => value - 7)}><ChevronLeft size={18} /></button><strong>{formatDate(todayIso, weekOffset, settings.locale)}{weekOffset === 0 ? " · esta semana" : ""}</strong><button className="icon-button" type="button" aria-label="Semana siguiente" onClick={() => setWeekOffset((value) => value + 7)}><ChevronRight size={18} /></button></div><div className="filter-pills"><button className="filter-pill active" type="button">Todas</button><button className="filter-pill" type="button" onClick={() => showToast("Filtro Mat aplicado en la agenda de muestra.")}>Mat</button><button className="filter-pill" type="button" onClick={() => showToast("Filtro Reformer aplicado en la agenda de muestra.")}>Reformer</button><button className="filter-pill" type="button" onClick={() => showToast("Filtro Privadas aplicado en la agenda de muestra.")}>Privadas</button></div></div><div className="schedule-summary"><span><i className="class-marker sage" /> Reformer</span><span><i className="class-marker peach" /> Mat</span><span><i className="class-marker blue" /> Privadas</span><span className="schedule-total">{classes.length} sesiones · 2 salas</span></div>{renderClassList()}<div className="waitlist-banner"><Users size={18} /><div><strong>Lista de espera activa</strong><span>3 alumnas esperan una plaza esta semana. Se notificará automáticamente al liberarse un hueco.</span></div><button className="text-button" type="button" onClick={() => showToast("La lista de espera automática requiere backend y notificaciones configuradas.")}>Gestionar <ArrowRight size={14} /></button></div></section>}

          {section === "students" && <><div className="table-toolbar"><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, email o plan" /></label><button className="button button-soft" type="button" onClick={() => showToast("Filtro de estado: alumnas activas.")}>Estado <ChevronDown size={14} /></button></div>{renderStudents()}</>}

          {section === "plans" && renderPlans()}
          {section === "library" && renderLibrary()}
          {section === "settings" && renderSettings()}

          <footer className="page-footer"><span>© 2026 {settings.name} · Hecho para moverse mejor</span><span><button type="button" onClick={() => showToast("Centro de ayuda de demostración.")}>Ayuda</button><i>·</i><button type="button" onClick={() => showToast("Privacidad y condiciones disponibles al publicar el servicio.")}>Privacidad</button></span></footer>
        </div>
      </main>

      {bookingOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingOpen(false); }}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title"><div className="dialog-heading"><div><span className="panel-kicker">RESERVA DE CLASE</span><h2 id="booking-title">Encuentra tu momento</h2></div><button className="icon-button" type="button" aria-label="Cerrar" onClick={() => setBookingOpen(false)}><X size={18} /></button></div><p className="dialog-intro">Elige una sesión con plazas disponibles. Las reservas se guardan en esta demostración.</p><div className="booking-options">{classes.map((item) => <button className="booking-option" key={item.id} type="button" disabled={item.booked >= item.capacity} onClick={() => bookClass(item.id)}><span className={`class-marker ${item.color}`} /><span><strong>{item.time} · {item.title}</strong><small>{item.instructor} · {item.room}</small></span><span className="booking-spots">{item.capacity - item.booked > 0 ? `${item.capacity - item.booked} plazas` : "Completa"}<ArrowRight size={14} /></span></button>)}</div><div className="dialog-footnote"><LockKeyhole size={14} /> {settings.cancellation}</div></section></div>}

      {uploadOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setUploadOpen(false); }}><section className="dialog upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title"><div className="dialog-heading"><div><span className="panel-kicker">BIBLIOTECA DEL ESTUDIO</span><h2 id="upload-title">Comparte un nuevo clip</h2></div><button className="icon-button" type="button" aria-label="Cerrar" onClick={() => setUploadOpen(false)}><X size={18} /></button></div><p className="dialog-intro">Añade un vídeo breve y elige qué plan lo desbloquea. En esta demo el archivo solo se previsualiza en el navegador.</p><form className="upload-form" onSubmit={submitClip}><label className="field-label">Título del clip<input value={clipTitle} onChange={(event) => setClipTitle(event.target.value)} placeholder="Ej. Activación de cadera en 5 minutos" required /></label><label className="field-label">Plan con acceso<select value={clipPlan} onChange={(event) => setClipPlan(event.target.value)}><option>Reformer completo</option><option>Mat ilimitado</option><option>Reformer 8</option></select><small>Solo los alumnos con este plan podrán abrir el vídeo.</small></label><label className="file-drop"><input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(event) => setClipFile(event.target.files?.[0] ?? null)} required /><span className="file-icon"><Video size={20} /></span><strong>{clipFile?.name ?? "Elige un vídeo corto"}</strong><small>MP4, MOV o WebM · hasta 100 MB en producción</small></label><div className="upload-security"><LockKeyhole size={14} /><span>Los archivos reales deben guardarse en Mux o S3 con reproducción firmada. No se suben a internet desde esta demo.</span></div><div className="dialog-actions"><button className="button button-soft" type="button" onClick={() => setUploadOpen(false)}>Cancelar</button><button className="button button-primary" type="submit"><Plus size={15} /> Añadir clip</button></div></form></section></div>}

      {activeVideo && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveVideo(null); }}><section className="dialog player-dialog" role="dialog" aria-modal="true" aria-labelledby="player-title"><div className="dialog-heading"><div><span className="panel-kicker">{activeVideo.plan}</span><h2 id="player-title">{activeVideo.title}</h2></div><button className="icon-button" type="button" aria-label="Cerrar vídeo" onClick={() => setActiveVideo(null)}><X size={18} /></button></div>{activeVideo.previewUrl ? <video className="video-player" src={activeVideo.previewUrl} controls autoPlay /> : <div className="video-placeholder" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(18,36,31,.5)), url("${activeVideo.image}")` }}><span className="play-button large"><Play size={23} fill="currentColor" /></span><span>Vista previa de contenido · Mux pendiente de configuración</span></div>}<p className="player-caption">{activeVideo.instructor} <i>·</i> {activeVideo.level} <i>·</i> {activeVideo.duration}</p></section></div>}

      {toast && <div className="toast-message" role="status"><Check size={16} />{toast}<button className="icon-button" type="button" aria-label="Cerrar mensaje" onClick={() => setToast("")}><X size={14} /></button></div>}
    </div>
  );
}