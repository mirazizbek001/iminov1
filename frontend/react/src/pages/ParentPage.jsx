import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ensureCsrfToken } from "../context/AppContext";
import "../cyberkid.css";

const money = (n) => `${Number(n).toLocaleString("uz-UZ").replace(/,/g, " ")} so‘m`;

async function api(url, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (method !== "GET") headers["X-CSRFToken"] = await ensureCsrfToken(false, 18000);
  const response = await fetch(url, {
    method,
    credentials: "same-origin",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || data.detail || `Xatolik (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function ParentAuth({ onDone }) {
  const navigate = useNavigate();
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ username: "", email: "", name: "", password: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setBusy(true);
    try {
      const data = await api(reg ? "/plat/parent/register/" : "/plat/parent/login/", {
        method: "POST",
        body: f,
      });
      onDone(data);
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="bb-wrap">
      <h1 className="bb-logo">
        Cyber<span className="ck-kid">Kid</span>
      </h1>
      <p className="bb-tagline">Ota-onalar paneli</p>
      <form onSubmit={submit} className="bb-card">
        <h2 className="bb-card-title">{reg ? "Ota-ona akkaunti" : "Xush kelibsiz!"}</h2>
        {reg && (
          <input className="bb-input" type="email" placeholder="Email manzilingiz" value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value.trim() })} />
        )}
        <input className="bb-input" placeholder="Foydalanuvchi nomi" autoComplete="username" autoCapitalize="none"
          value={f.username}
          onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, "") })} />
        {reg && (
          <input className="bb-input" placeholder="Ism familiya" value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })} />
        )}
        <div className="bb-pass">
          <input className="bb-input" type={show ? "text" : "password"} placeholder="Parol"
            autoComplete={reg ? "new-password" : "current-password"} value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button type="button" className="bb-eye" onClick={() => setShow(!show)}
            aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}>
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {err && <p className="bb-error">{err}</p>}
        <button className="bb-btn" disabled={busy}>
          {busy ? "Kutilmoqda..." : reg ? "Ro‘yxatdan o‘tish" : "Kirish"}
        </button>
        <button type="button" className="bb-link" onClick={() => navigate("/")}>
          Bolalar kirishiga qaytish
        </button>
      </form>
      <p className="bb-switch">
        {reg ? "Akkauntingiz bormi?" : "Akkauntingiz yo‘qmi?"}{" "}
        <button type="button" onClick={() => { setReg(!reg); setErr(""); }}>
          {reg ? "Kirish" : "Ro‘yxatdan o‘tish"}
        </button>
      </p>
    </div>
  );
}

function Subscription({ parent, setParent }) {
  const [plan, setPlan] = useState(parent.plans[0]?.key);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sub = parent.subscription;
  const pending = parent.payment.pending;
  const checkout = async () => {
    setBusy(true);
    setErr("");
    try {
      setParent(await api("/plat/parent/checkout/", { method: "POST", body: { plan } }));
    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    const data = await api("/plat/parent/session/");
    if (data.authenticated) setParent(data);
  };
  return (
    <section className="bp-card">
      <span className={`bp-badge ${sub.active ? "" : "bp-badge-off"}`}>
        {sub.active ? "Obuna faol" : "Obuna yo‘q"}
      </span>
      {sub.active ? (
        <p className="bp-sub">
          Obuna {new Date(sub.until).toLocaleDateString("uz-UZ")} gacha amal qiladi. Muddatni
          uzaytirish uchun tarifni qayta tanlang.
        </p>
      ) : (
        <>
          <h2 className="bp-h">Ota-onalar paneli — pullik</h2>
          <p className="bp-sub">
            Farzandingiz akkauntini bog‘lang, kunlik vaqt limiti, ish vaqti va pauzani o‘zingiz
            belgilang, kirish tarixini ko‘ring.
          </p>
        </>
      )}
      <div className="bp-plans">
        {parent.plans.map((p) => (
          <button key={p.key} type="button" className={`bp-plan ${plan === p.key ? "on" : ""}`}
            onClick={() => setPlan(p.key)}>
            <b>{p.title}</b>
            <span>{money(p.price)}</span>
          </button>
        ))}
      </div>
      {pending && !sub.active && (
        <div className="bp-pay">
          {parent.payment.card ? (
            <>
              <div>
                Kartaga <b>{money(pending.amount)}</b> o‘tkazing:
              </div>
              <div><code>{parent.payment.card}</code> {parent.payment.owner}</div>
              <div>Izohga yozing: <code>{pending.note}</code></div>
              <div>To‘lov tasdiqlangach obuna yoqiladi.</div>
            </>
          ) : (
            <div>To‘lov rekvizitlari hali sozlanmagan. Administrator bilan bog‘laning.</div>
          )}
        </div>
      )}
      {err && <p className="bb-error">{err}</p>}
      <button className="bb-btn" onClick={checkout} disabled={busy}>
        {busy ? "Kutilmoqda..." : sub.active ? "Muddatni uzaytirish" : "Obunani yoqish"}
      </button>
      {pending && !sub.active && (
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={refresh}>
          To‘lov holatini tekshirish
        </button>
      )}
      {parent.payment.testMode && (
        <p className="bp-meta">Sinov rejimi: to‘lov avtomatik tasdiqlanadi.</p>
      )}
    </section>
  );
}

function ChildCard({ child, onChange, onRemove }) {
  const [f, setF] = useState({
    usageLimitMinutes: child.usageLimitMinutes ?? "",
    cooldownMinutes: child.cooldownMinutes ?? "",
    start: child.start || "",
    end: child.end || "",
  });
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState(null);
  const save = async (extra = {}) => {
    setMsg("");
    try {
      const data = await api(`/plat/parent/children/${child.username}/`, {
        method: "PUT",
        body: {
          usageLimitMinutes: f.usageLimitMinutes === "" ? null : Number(f.usageLimitMinutes),
          cooldownMinutes: f.cooldownMinutes === "" ? null : Number(f.cooldownMinutes),
          start: f.start || null,
          end: f.end || null,
          ...extra,
        },
      });
      onChange(data);
      setMsg("Saqlandi");
    } catch (error) {
      setMsg(error.message);
    }
  };
  const loadLog = async () =>
    setLog(await api(`/plat/parent/children/${child.username}/activity/`).catch(() => []));
  const remove = async () => {
    if (!window.confirm(`${child.username} bog‘lanishini olib tashlaysizmi?`)) return;
    await api(`/plat/parent/children/${child.username}/`, { method: "DELETE" });
    onRemove(child.username);
  };
  return (
    <section className="bp-card">
      <div className="bp-child-head">
        <div className="bp-avatar">{(child.name || child.username)[0]?.toUpperCase()}</div>
        <div>
          <h3 className="bp-h" style={{ fontSize: 19 }}>{child.name || child.username}</h3>
          <div className="bp-meta">
            @{child.username} · {child.lastLogin ? `oxirgi kirish ${child.lastLogin}` : "hali kirmagan"}
          </div>
        </div>
      </div>
      <div className="bp-toggle">
        {child.paused ? "Akkaunt to‘xtatilgan" : "Akkaunt faol"}
        <button className={child.paused ? "" : "off"} onClick={() => save({ paused: !child.paused })}>
          {child.paused ? "Yoqish" : "To‘xtatish"}
        </button>
      </div>
      <div className="bp-grid">
        <div className="bp-field">
          <label>Kunlik limit (daqiqa)</label>
          <input className="bb-input" type="number" min="1" max="1440" placeholder="Umumiy"
            value={f.usageLimitMinutes} onChange={(e) => setF({ ...f, usageLimitMinutes: e.target.value })} />
        </div>
        <div className="bp-field">
          <label>Tanaffus (daqiqa)</label>
          <input className="bb-input" type="number" min="1" max="1440" placeholder="Umumiy"
            value={f.cooldownMinutes} onChange={(e) => setF({ ...f, cooldownMinutes: e.target.value })} />
        </div>
        <div className="bp-field">
          <label>Ochilish vaqti</label>
          <input className="bb-input" type="time" value={f.start}
            onChange={(e) => setF({ ...f, start: e.target.value })} />
        </div>
        <div className="bp-field">
          <label>Yopilish vaqti</label>
          <input className="bb-input" type="time" value={f.end}
            onChange={(e) => setF({ ...f, end: e.target.value })} />
        </div>
      </div>
      <p className="bp-meta">Bo‘sh qoldirilsa, platformaning umumiy sozlamasi amal qiladi.</p>
      {msg && <p className={msg === "Saqlandi" ? "bp-ok" : "bb-error"}>{msg}</p>}
      <button className="bb-btn bb-btn-sm" onClick={() => save()}>Saqlash</button>
      <div className="bp-row">
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={loadLog}>Kirish tarixi</button>
        <button className="bb-btn bb-btn-ghost bb-btn-sm" onClick={remove}>Ajratish</button>
      </div>
      {log && (
        <ul className="bp-log">
          {log.length === 0 && <li>Hali kirish yo‘q</li>}
          {log.map((item) => (
            <li key={item.id}><span>{item.time}</span><span>{item.device}</span></li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Children() {
  const [list, setList] = useState(null);
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/plat/parent/children/").then(setList).catch(() => setList([]));
  }, []);
  const link = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setList(await api("/plat/parent/children/", { method: "POST", body: f }));
      setF({ username: "", password: "" });
    } catch (error) {
      setErr(error.message);
    }
  };
  return (
    <>
      <form className="bp-card" onSubmit={link}>
        <h2 className="bp-h">Farzandni bog‘lash</h2>
        <p className="bp-sub">Farzandingizning CyberKid foydalanuvchi nomi va parolini kiriting.</p>
        <input className="bb-input" placeholder="Farzand foydalanuvchi nomi" autoCapitalize="none" value={f.username}
          onChange={(e) => setF({ ...f, username: e.target.value.toLowerCase().trim() })} />
        <input className="bb-input" type="password" placeholder="Farzand paroli" value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="bb-error">{err}</p>}
        <button className="bb-btn bb-btn-sm">Bog‘lash</button>
      </form>
      {(list || []).map((child) => (
        <ChildCard key={child.username} child={child}
          onChange={(next) => setList((cur) => cur.map((c) => (c.username === next.username ? next : c)))}
          onRemove={(username) => setList((cur) => cur.filter((c) => c.username !== username))} />
      ))}
    </>
  );
}

export default function ParentApp() {
  const navigate = useNavigate();
  const [parent, setParent] = useState(undefined); // undefined = yuklanmoqda, null = kirmagan
  useEffect(() => {
    document.documentElement.classList.add("bb-yellow");
    return () => document.documentElement.classList.remove("bb-yellow");
  }, []);
  const load = useCallback(async () => {
    try {
      const data = await api("/plat/parent/session/");
      setParent(data.authenticated ? data : null);
    } catch {
      setParent(null);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  const logout = async () => {
    await api("/plat/logout/", { method: "POST" }).catch(() => {});
    setParent(null);
  };
  return (
    <div className="bb-page">
      <span className="bb-circle bb-circle-pink" aria-hidden="true" />
      <span className="bb-circle bb-circle-teal" aria-hidden="true" />
      {parent === undefined ? null : parent === null ? (
        <ParentAuth onDone={setParent} />
      ) : (
        <div className="bb-wrap bb-wrap-wide">
          <div className="bp-top">
            <span className="bp-brand">CyberKid</span>
            <button className="bp-out" onClick={logout}>Chiqish</button>
          </div>
          <div className="bp-stack">
            <p className="bp-sub" style={{ color: "var(--bk-ink)", fontSize: 17, fontWeight: 700 }}>
              Salom, {parent.name || parent.username}!
            </p>
            <Subscription parent={parent} setParent={setParent} />
            {parent.subscription.active && <Children />}
            <button className="bp-back" onClick={() => navigate("/")}>Bolalar kirishiga o‘tish</button>
          </div>
        </div>
      )}
    </div>
  );
}
