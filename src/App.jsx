/* ===== Intui — App root: routing, state ===== */
import React from "react";
import * as D from "./data.js";
import { Ic, ImgIcon, BottomNav } from "./ui.jsx";
import { CosmosBG } from "./cosmos-bg.jsx";
import { WelcomeScreen, NicknameScreen } from "./screens/Onboarding.jsx";
import { HomeScreen, ModeSelectScreen } from "./screens/Home.jsx";
import { GameScreen } from "./screens/Game.jsx";
import { StatsScreen } from "./screens/Stats.jsx";
import { LeaderboardScreen, ProfileScreen } from "./screens/Extra.jsx";

function seedDemoState() {
  const demo = D.genDemo();
  const s = Object.assign({}, D.loadState(), demo);
  s.xp = 2450;
  s.streak = 12;
  s.bestStreak = 17;
  s.lastActiveDate = D.todayStr();
  D.checkBadges(s);
  return s;
}

export default function App() {
  const [state, setState] = React.useState(() => {
    const s = D.loadState();
    if (!s.onboarded && !s.attempts.length) {
      return Object.assign(seedDemoState(), { onboarded: false });
    }
    return s;
  });
  const [screen, setScreen] = React.useState(state.onboarded ? "home" : "welcome");
  const [game, setGame] = React.useState(null); // {mode, n}
  const [newBadges, setNewBadges] = React.useState([]);

  const save = (next) => { setState(next); D.saveState(next); };

  const attempts = state.attempts;
  const stats = React.useMemo(() => D.computeStats(attempts, "week"), [attempts]);
  const tips = React.useMemo(() => D.aiTips(stats, state), [stats, state]);
  const dailyProgress = React.useMemo(
    () => Math.min(100, attempts.filter((a) => a.date === D.todayStr()).length),
    [attempts]
  );
  const stateView = React.useMemo(() => Object.assign({}, state, { dailyProgress }), [state, dailyProgress]);

  // ---------- actions ----------
  const finishOnboarding = (nick) => {
    save(Object.assign({}, state, { nickname: nick, onboarded: true }));
    setScreen("home");
  };

  const startGame = (mode, n) => {
    setGame({ mode, n: n || mode.defaultOptions });
    setScreen("game");
  };

  const completeGame = (payload) => {
    const s = Object.assign({}, state);
    s.attempts = [...s.attempts, ...payload.attempts];
    s.sessions = [...s.sessions, payload.session];
    if (payload.journal) s.journal = [...s.journal, payload.journal];
    s.xp += payload.xp;
    D.bumpStreak(s);
    const got = D.checkBadges(s);
    save(s);
    setGame(null);
    setScreen("stats");
    if (got.length) setNewBadges(got);
  };

  const resetAll = () => {
    if (!window.confirm("Barcha progress o'chiriladi. Davom etasizmi?")) return;
    try { localStorage.removeItem(D.STORAGE_KEY); } catch (e) {}
    const fresh = Object.assign({}, D.loadState(), { onboarded: true, nickname: state.nickname });
    save(fresh);
    setScreen("home");
  };

  // ---------- render ----------
  const showNav = state.onboarded && screen !== "game" && screen !== "welcome" && screen !== "nickname";
  // 247 — prototip standart aksenti #8b7cf6 ning hue qiymati
  const appStyle = { "--accent-h": 247, "--speed": 1 };

  return (
    <div className="stage">
      <div className="app" style={appStyle}>
        <CosmosBG />

        {screen === "welcome" ? <WelcomeScreen onStart={() => setScreen("nickname")} /> : null}
        {screen === "nickname" ? <NicknameScreen onDone={finishOnboarding} /> : null}

        {screen === "home" ? (
          <HomeScreen state={stateView} stats={stats} tips={tips}
            onNav={setScreen}
            onStartDaily={() => setScreen("practice")}
            onPickMode={(m) => startGame(m)} />
        ) : null}

        {screen === "practice" ? (
          <ModeSelectScreen onStart={startGame} />
        ) : null}

        {screen === "stats" ? <StatsScreen state={stateView} demoMerged={attempts} /> : null}
        {screen === "leaderboard" ? <LeaderboardScreen state={stateView} stats={stats} /> : null}
        {screen === "profile" ? (
          <ProfileScreen state={stateView} stats={stats}
            onRename={(n) => save(Object.assign({}, state, { nickname: n }))}
            onReset={resetAll} />
        ) : null}

        {screen === "game" && game ? (
          <GameScreen mode={game.mode} nOptions={game.n} state={stateView}
            onExit={() => { setGame(null); setScreen("practice"); }}
            onComplete={completeGame} />
        ) : null}

        {showNav ? <BottomNav active={screen} onNav={setScreen} /> : null}

        {newBadges.length ? <BadgeToast ids={newBadges} onClose={() => setNewBadges([])} /> : null}
      </div>
    </div>
  );
}

function BadgeToast({ ids, onClose }) {
  const badges = ids.map((id) => D.BADGES.find((b) => b.id === id)).filter(Boolean);
  React.useEffect(() => {
    const t = setTimeout(onClose, 5200);
    return () => clearTimeout(t);
  }, []);
  if (!badges.length) return null;
  return (
    <div className="pop" onClick={onClose} style={{
      position: "absolute", left: 16, right: 16, top: 16, zIndex: 80, cursor: "pointer",
      background: "linear-gradient(180deg, #1d1840, #120e2a)", border: "1px solid var(--stroke)",
      borderRadius: 20, padding: "14px 16px", display: "flex", alignItems: "center", gap: 13,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 30px hsla(var(--accent-h),88%,70%,0.25)",
    }}>
      {["star4", "fire", "bolt", "yinyang", "trophy", "diamond", "journal"].includes(badges[0].icon)
        ? <ImgIcon name={badges[0].icon} size={48} round={["fire", "trophy", "diamond", "journal"].includes(badges[0].icon)} style={{ flex: "none", boxShadow: "0 0 18px hsla(var(--accent-h),88%,70%,0.4)" }} />
        : <div className="mode-tile" style={{ width: 48, height: 48, borderRadius: 15, boxShadow: "0 0 18px hsla(var(--accent-h),88%,70%,0.4)" }}><Ic name={badges[0].icon} size={24} color="var(--accent)" /></div>}
      <div>
        <div style={{ color: "var(--accent)", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em" }}>YANGI YUTUQ</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{badges.map((b) => b.name).join(" · ")}</div>
      </div>
      <span style={{ marginLeft: "auto", opacity: 0.5 }}><Ic name="close" size={18} /></span>
    </div>
  );
}
