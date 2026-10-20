import { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Home,
  Play,
  Search,
  Send,
  Heart,
  User,
  Settings,
  Plus,
  RefreshCw,
  Clock,
} from "lucide-react";
import { AppProvider, useC } from "./context/AppContext";
import { Auth, PwaInstallButton } from "./components/Shared";
import CallOverlay from "./components/CallOverlay";
import Wordmark, { LogoMark } from "./components/LogoMark";
import Modals from "./components/Modals";
import Landing from "./components/Landing";
import HomePage from "./pages/HomePage";
import ReelsPage from "./pages/ReelsPage";
import SearchPage from "./pages/SearchPage";
import ExplorePage from "./pages/ExplorePage";
import NotificationsPage from "./pages/NotificationsPage";
// Og‘ir sahifalar faqat kerak bo‘lganda yuklanadi (boshlang‘ich JS hajmi kichrayadi).
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ParentPage = lazy(() => import("./pages/ParentPage"));

function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Yuklanmoqda"
      className="mx-auto w-full max-w-[630px] space-y-4 px-3 pt-5"
    >
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="bb-skel h-9 w-9 !rounded-full" />
            <div className="bb-skel h-3 w-32" />
          </div>
          <div className="bb-skel h-56 w-full" />
          <div className="bb-skel h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// Kunlik limitdan qolgan vaqt: doim ko‘rinadi (firuza), oxirgi 5 daqiqada to‘q sariq
// va sekin pulsatsiya qiladi. `key` har yangilanishda (server qiymati kelganda) hisobni qayta boshlaydi.
function TimeChip({ remainingSeconds, hidden, quietUnlessUrgent, inline, onHome }) {
  const [startedAt] = useState(() => Date.now());
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = Math.max(
    0,
    Math.round(remainingSeconds - (tick - startedAt) / 1000),
  );
  const urgent = left <= 300;
  // Reels sahifasida video ustini to‘smaslik uchun faqat oxirgi 5 daqiqada ko‘rinadi.
  if (left <= 0 || hidden || (quietUnlessUrgent && !urgent)) return null;
  const clock = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const chipClass = `bb-time-chip flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${urgent ? "bb-time-urgent bb-time-pill" : ""}`;
  // Sarlavhadagi ixcham belgi (faqat bosh sahifa, telefon): hech narsani yopmaydi.
  if (inline) {
    return (
      <div role="status" aria-label="Qolgan vaqt" className={chipClass}>
        <Clock size={14} aria-hidden="true" />
        {urgent ? clock : `${Math.ceil(left / 60)} daq`}
      </div>
    );
  }
  // Suzuvchi belgi: telefonda faqat oxirgi 5 daqiqada, kompyuterda (o‘ng yuqori burchak) doim.
  return (
    <div
      className={`bb-time-float ${urgent ? "" : "bb-time-calm"} ${onHome ? "bb-time-hide-mobile" : ""}`}
    >
      <div role="status" className={`${chipClass} shadow-md`}>
        <Clock size={14} aria-hidden="true" />
        {urgent ? `Vaqt tugayapti: ${clock}` : `${Math.ceil(left / 60)} daqiqa qoldi`}
      </div>
    </div>
  );
}
import "./App.css";
import "./cyberkid.css";

function PwaUpdatePrompt({ visible }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+16px)] z-[100] px-3">
      <div
        role="status"
        aria-live="polite"
        className="mx-auto flex min-h-14 w-full max-w-[360px] items-center gap-3 rounded-xl border border-neutral-200 bg-white/95 p-2.5 pl-3 text-sm shadow-[0_12px_36px_rgba(0,0,0,.22)] backdrop-blur-xl !border-[#2b3a78] !bg-[#131b36]/95"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-[#2de2ff] !text-[#2de2ff]">
          <RefreshCw size={17} />
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold">
          Yangi versiya tayyor
        </span>
        <button
          onClick={() =>
            window.dispatchEvent(new Event("instakids-activate-update"))
          }
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#d02aa8] px-3 py-2 font-semibold text-white transition hover:bg-[#a8168a]"
        >
          <RefreshCw size={15} /> Yangilash
        </button>
      </div>
    </div>
  );
}

function ProfileRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <ProfilePage id={id} goChat={(userId) => navigate(`/messages/${userId}`)} />
  );
}

function MessagesRoute() {
  const { id } = useParams();
  const { peer, setPeer } = useC();
  const navigate = useNavigate();
  const choosePeer = (userId) => {
    setPeer(userId);
    navigate(userId ? `/messages/${userId}` : "/messages");
  };
  const currentPeer = id || peer || null;
  return <MessagesPage peer={currentPeer} setPeer={choosePeer} />;
}

function AppShell() {
  const { me, A, unreadN, unreadM, accessInfo, peer, open } = useC();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pwaUpdateReady, setPwaUpdateReady] = useState(false);
  // Kirmagan mehmon avval bosh sahifani (landing) ko‘radi; tugma bosilganda Auth ochiladi.
  const [entry, setEntry] = useState(null); // null | "login" | "register"
  const isReels = pathname === "/reels";

  useEffect(() => {
    const showUpdate = () => setPwaUpdateReady(true);
    if ("serviceWorker" in navigator) {
      window.addEventListener("instakids-update-ready", showUpdate);
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration?.waiting && navigator.serviceWorker.controller)
            showUpdate();
        })
        .catch(() => {});
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.waiting && navigator.serviceWorker.controller)
            showUpdate();
        })
        .catch(() => {});
    }
    return () => {
      window.removeEventListener("instakids-update-ready", showUpdate);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("reels-page-shell", isReels);
    return () => document.body.classList.remove("reels-page-shell");
  }, [isReels]);

  if (!me && !entry)
    return (
      <>
        <Landing onStart={setEntry} onParent={() => navigate("/ota-ona")} />
        <PwaUpdatePrompt visible={pwaUpdateReady} />
      </>
    );

  if (!me)
    return (
      <>
        <Auth
          A={A}
          accessInfo={accessInfo}
          initialRegister={entry === "register"}
          onBack={() => setEntry(null)}
        />
        <Modals />
        <PwaUpdatePrompt visible={pwaUpdateReady} />
      </>
    );

  const isAdmin = me.isAdmin;

  const nav = [
    ["/", Home, "Home", unreadN * 0],
    ["/reels", Play, "Reels"],
    ["/notifications", Heart, "Notifications", unreadN],
    ["/search", Search, "Search"],
    ["/messages", Send, "Messages", unreadM],
    [`/profile/${me.id}`, User, me.username],
    ...(isAdmin ? [["/admin", Settings, "Admin"]] : []),
  ];

  const conversationOpen =
    /^\/messages\/[^/]+$/.test(pathname) ||
    (pathname === "/messages" && Boolean(peer));
  const active = pathname.startsWith("/profile/")
    ? "/profile/" + me.id
    : pathname;
  const go = (path) => navigate(path);
  const Badge = ({ n }) =>
    n > 0 ? (
      <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#ff3040] px-1 text-[10px] font-bold text-white">
        {n}
      </span>
    ) : null;
  const showTime =
    !isAdmin &&
    accessInfo.reason !== "loading" &&
    accessInfo.open !== false &&
    accessInfo.usageRemainingSeconds > 0;
  return (
    <div
      className={`app-shell min-h-screen text-white !bg-transparent !text-white ${conversationOpen ? "conversation-open" : ""} ${isReels ? "reels-shell" : ""}`}
    >
      <aside className="ig-sidebar fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-neutral-200 bg-[#131b36] px-3 pb-5 pt-7 !border-[#2b3a78] !bg-[#070b18] md:flex">
        <div className="mb-4 flex items-center gap-3 px-1.5">
          <LogoMark size={40} className="shrink-0" />
          <span className="sidebar-label ck-wordmark-text text-xl">
            Cyber<span className="ck-kid">Kid</span>
          </span>
        </div>
        <nav className="space-y-1">
          {nav.map(([path, I, label, badge]) => (
            <button
              key={path}
              onClick={() => go(path)}
              className={`group flex w-full items-center gap-4 rounded-xl p-3.5 hover:bg-neutral-100 hover:!bg-[#243262] ${active === path ? "is-active" : ""}`}
            >
              <span
                className={`ck-ico ck-ico-${path === "/" ? "home" : path.split("/")[1]} relative ${active === path ? "!text-white" : ""}`}
              >
                <I size={26} strokeWidth={active === path ? 2.8 : 1.8} />
                <Badge n={badge} />
              </span>
              <span
                className={`sidebar-label text-[15px] ${active === path ? "font-bold" : ""}`}
              >
                {label}
              </span>
            </button>
          ))}
        </nav>
        <button type="button" onClick={open.create} className="ck-create ck-create-desktop mt-4 flex w-full items-center justify-center gap-2 rounded-xl p-3">
          <Plus size={20} aria-hidden="true" />
          <span className="sidebar-label text-[15px] font-bold">Yaratish</span>
        </button>
        <div className="mt-auto border-t border-neutral-200 pt-3 !border-[#2b3a78]">
          <PwaInstallButton iconOnly />
        </div>
      </aside>

      {!conversationOpen && pathname === "/" && (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 md:hidden">
          <Wordmark size={34} />
          <div className="flex items-center gap-3">
            {showTime && (
              <TimeChip
                inline
                key={accessInfo.usageRemainingSeconds}
                remainingSeconds={accessInfo.usageRemainingSeconds}
              />
            )}
            <PwaInstallButton compact />
            <button
              type="button"
              onClick={open.create}
              aria-label="Yangi post yoki story yaratish"
              className="ck-create grid h-9 w-9 place-items-center rounded-lg"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => navigate("/notifications")}
              aria-label="Bildirishnomalar"
              className="relative p-1"
            >
              <Heart size={23} />
              <Badge n={unreadN} />
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                aria-label="Admin panel"
                className="p-1"
              >
                <Settings size={22} />
              </button>
            )}
          </div>
        </header>
      )}

      <div
        className={`app-page-shell ${conversationOpen ? "pb-0" : "pb-24"} md:pb-0`}
      >
        {accessInfo.restriction?.active && (
          <div
            role="status"
            className="mx-auto mt-3 max-w-[900px] rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 !border-amber-800 !bg-amber-950/40 !text-amber-100"
          >
            Admin cheklovi faol. Xabar, like va follow vaqtincha ishlamaydi.
            Tugash vaqti:{" "}
            {new Date(accessInfo.restriction.until).toLocaleString("uz-UZ")}.
          </div>
        )}
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reels" element={<ReelsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<MessagesRoute />} />
          <Route path="/messages/:id" element={<MessagesRoute />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile/:id" element={<ProfileRoute />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </div>

      {!conversationOpen && (
        <nav className="mobile-bottom-nav fixed inset-x-3 bottom-[calc(8px+env(safe-area-inset-bottom))] z-40 flex h-14 items-center justify-around rounded-full px-2 shadow-lg md:hidden">
          {nav
            .filter(
              (x) =>
                [
                  "/",
                  "/reels",
                  "/messages",
                  "/search",
                  `/profile/${me.id}`,
                ].includes(x[0]) ||
                (isAdmin && x[0] === "/admin"),
            )
            .map(([path, I, , badge]) => (
              <button
                key={path}
                onClick={() => go(path)}
                className={`relative rounded-full px-4 py-2 transition ${active === path ? "!bg-[#e020b4] !text-white" : "!text-[#8fa2ff]"}`}
              >
                <I size={26} strokeWidth={active === path ? 2.8 : 1.8} />
                <Badge n={badge} />
              </button>
            ))}
        </nav>
      )}
      {showTime && (
        <TimeChip
          key={accessInfo.usageRemainingSeconds}
          remainingSeconds={accessInfo.usageRemainingSeconds}
          hidden={conversationOpen}
          quietUnlessUrgent={isReels}
          onHome={pathname === "/"}
        />
      )}
      <CallOverlay />
      <Modals />
      <PwaUpdatePrompt visible={pwaUpdateReady} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/ota-ona/*"
          element={
            <Suspense fallback={<PageLoading />}>
              <ParentPage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <AppProvider>
              <AppShell />
            </AppProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
