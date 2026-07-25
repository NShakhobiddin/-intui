/* ===== Intui — App root: routing, state ===== */
import React from "react";
import * as D from "./data.js";
import { Ic, ImgIcon, BottomNav } from "./ui.jsx";
import { CosmosBG, CosmosStatic } from "./cosmos-bg.jsx";
import { cloudEnabled, supabase, fetchCloudState, pushCloudState, authErrorText } from "./cloud.js";
import { tgName, tgCloudAvailable, loadTgCloud, saveTgCloud, tgStartParam } from "./telegram.js";
import { parseParam } from "./duo.js";
import { parseTeamParam } from "./team.js";
import { communityEnabled, myUid, watchOnline, pushUsage, fetchTopActive } from "./community.js";
import { WelcomeScreen, NicknameScreen } from "./screens/Onboarding.jsx";
import { HomeScreen, ModeSelectScreen } from "./screens/Home.jsx";
import { GameScreen } from "./screens/Game.jsx";
import { StatsScreen } from "./screens/Stats.jsx";
import { LeaderboardScreen, ProfileScreen } from "./screens/Extra.jsx";
import { DuoScreen, AsyncDuo } from "./screens/Duo.jsx";
import { TeamScreen } from "./screens/Team.jsx";
import { GuideScreen } from "./screens/Guide.jsx";

export default function App() {
  const [state, setState] = React.useState(() => D.loadState());
  const [screen, setScreen] = React.useState(state.onboarded ? "home" : "welcome");
  const [game, setGame] = React.useState(null); // {mode, n}
  const [newBadges, setNewBadges] = React.useState([]);
  const [duoCode, setDuoCode] = React.useState(null); // jonli xona kodi (null = xona yaratish)
  const [duoToken, setDuoToken] = React.useState(null); // Telegram async chaqiruv/natija
  const [teamCode, setTeamCode] = React.useState(null); // jamoaviy stol kodi (null = yangi stol)
  const wantDuo = React.useRef(null); // deep-link orqali kutilayotgan { room } | { token }
  const wantTeam = React.useRef(null); // deep-link orqali kutilayotgan jamoaviy stol kodi
  const myName = state.nickname || tgName() || "Do'st";

  // ---------- hamjamiyat: onlaynlar + faollik soatlari ----------
  const totalSec = React.useMemo(() => (state.sessions || []).reduce((t, s) => t + (s.sec || 0), 0), [state.sessions]);
  const [onlineList, setOnlineList] = React.useState([]);
  const onlineRef = React.useRef(null);
  React.useEffect(() => {
    if (!communityEnabled) return;
    onlineRef.current = watchOnline({ id: myUid(), name: myName, sec: totalSec }, setOnlineList);
    return () => { if (onlineRef.current) onlineRef.current.stop(); onlineRef.current = null; };
  }, []);
  React.useEffect(() => {
    if (onlineRef.current) onlineRef.current.update({ name: myName, sec: totalSec });
    if (communityEnabled) pushUsage({ id: myUid(), name: myName, sec: totalSec });
  }, [myName, totalSec]);

  // ---------- bulut sinxronlash ----------
  const [cloudUser, setCloudUser] = React.useState(null);
  const [cloudStatus, setCloudStatus] = React.useState("");
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const pushTimer = React.useRef(null);
  const syncedFor = React.useRef(null);

  React.useEffect(() => {
    if (!cloudEnabled) return;
    supabase.auth.getSession().then(({ data }) => setCloudUser(data.session ? data.session.user : null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setCloudUser(session ? session.user : null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Telegram CloudStorage: ochilishda foydalanuvchining bulutdagi holati bilan birlashtiramiz
  React.useEffect(() => {
    if (!tgCloudAvailable) return;
    loadTgCloud()
      .then((remote) => {
        if (!remote) return;
        const merged = D.mergeStates(stateRef.current, remote);
        setState(merged);
        D.saveState(merged);
        if (merged.onboarded) setScreen((sc) => (sc === "welcome" || sc === "nickname" ? "home" : sc));
        return saveTgCloud(merged);
      })
      .catch(() => {});
  }, []);

  // Deep-link (Telegram startapp / ?g= / ?room= / ?tm=) orqali qo'shilish
  React.useEffect(() => {
    let p = tgStartParam();
    let webTeam = "";
    if (typeof location !== "undefined") {
      try {
        const q = new URLSearchParams(location.search);
        webTeam = q.get("tm") || "";
        if (!p) p = q.get("g") || q.get("room") || "";
      } catch (e) { /* ignore */ }
    }
    // Jamoaviy stol havolasi (TM… deep-link yoki ?tm=) — dueldan oldin tekshiriladi
    const team = parseTeamParam(webTeam) || parseTeamParam(p);
    if (team) { wantTeam.current = team; return; }
    const parsed = parseParam(p);
    if (parsed) wantDuo.current = parsed;
  }, []);
  React.useEffect(() => {
    if (wantTeam.current && state.onboarded && screen !== "team") {
      const c = wantTeam.current;
      wantTeam.current = null;
      setTeamCode(c);
      setScreen("team");
      return;
    }
    if (wantDuo.current && state.onboarded && screen !== "duo") {
      const w = wantDuo.current;
      wantDuo.current = null;
      setDuoToken(w.token || null);
      setDuoCode(w.room || null);
      setScreen("duo");
    }
  }, [state.onboarded, screen]);

  const tgTimer = React.useRef(null);
  const scheduleTgPush = (next) => {
    if (!tgCloudAvailable) return;
    clearTimeout(tgTimer.current);
    tgTimer.current = setTimeout(() => { saveTgCloud(next).catch(() => {}); }, 1200);
  };

  // kirilgach: bulutdagi holat bilan birlashtirib, natijani qaytarib yuboramiz
  React.useEffect(() => {
    if (!cloudUser || syncedFor.current === cloudUser.id) return;
    syncedFor.current = cloudUser.id;
    setCloudStatus("syncing");
    fetchCloudState(cloudUser.id)
      .then((remote) => {
        const merged = D.mergeStates(stateRef.current, remote);
        setState(merged);
        D.saveState(merged);
        return pushCloudState(cloudUser.id, merged);
      })
      .then(() => setCloudStatus("synced"))
      .catch(() => setCloudStatus("error"));
  }, [cloudUser]);

  const schedulePush = (next) => {
    if (!cloudEnabled || !cloudUser) return;
    const uid = cloudUser.id;
    clearTimeout(pushTimer.current);
    setCloudStatus("syncing");
    pushTimer.current = setTimeout(() => {
      pushCloudState(uid, next)
        .then(() => setCloudStatus("synced"))
        .catch(() => setCloudStatus("error"));
    }, 800);
  };

  const cloud = {
    enabled: cloudEnabled,
    user: cloudUser,
    status: cloudStatus,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(authErrorText(error));
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.href } });
      if (error) throw new Error(authErrorText(error));
      return data.user && !data.session ? "confirm" : "ok";
    },
    signOut: async () => {
      await supabase.auth.signOut();
      syncedFor.current = null;
      setCloudStatus("");
    },
  };

  const save = (next) => { setState(next); D.saveState(next); schedulePush(next); scheduleTgPush(next); };

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
  const showNav = state.onboarded && screen !== "game" && screen !== "welcome" && screen !== "nickname" && screen !== "duo" && screen !== "team" && screen !== "guide";
  // Mashq/o'yin paytida jonli animatsiya o'chadi — asosiy rasm statik ko'rinadi
  const heavyPlay = screen === "game" || screen === "duo" || screen === "team";
  // 247 — prototip standart aksenti #8b7cf6 ning hue qiymati
  const appStyle = { "--accent-h": 247, "--speed": 1 };

  return (
    <div className="stage">
      <div className="app" style={appStyle}>
        {heavyPlay ? <CosmosStatic /> : <CosmosBG />}

        {/* Telegramda ism botdan olinadi — nickname so'ralmaydi */}
        {screen === "welcome" ? <WelcomeScreen onStart={() => {
          const name = tgName();
          if (name) finishOnboarding(name);
          else setScreen("nickname");
        }} /> : null}
        {screen === "nickname" ? <NicknameScreen onDone={finishOnboarding} /> : null}

        {screen === "home" ? (
          <HomeScreen state={stateView} stats={stats} tips={tips}
            onNav={setScreen}
            onStartDaily={() => setScreen("practice")}
            onPickMode={(m) => startGame(m)}
            onTeam={() => { setTeamCode(null); setScreen("team"); }}
            onGuide={() => setScreen("guide")}
            onDuo={() => { setDuoCode(null); setDuoToken(null); setScreen("duo"); }} />
        ) : null}

        {screen === "duo" ? (
          duoToken ? (
            <AsyncDuo myName={myName} token={duoToken}
              onExit={() => { setDuoToken(null); setScreen("home"); }} />
          ) : (
            <DuoScreen myName={myName} initialCode={duoCode}
              onExit={() => { setDuoCode(null); setScreen("home"); }} />
          )
        ) : null}

        {screen === "team" ? (
          <TeamScreen myName={myName} myId={myUid()} initialCode={teamCode}
            onExit={() => { setTeamCode(null); setScreen("home"); }} />
        ) : null}

        {screen === "guide" ? (
          <GuideScreen onExit={() => setScreen("home")}
            onStartMode={(id) => {
              const m = D.MODES.find((x) => x.id === id);
              if (m) startGame(m); else setScreen("practice");
            }}
            onDuo={() => { setDuoCode(null); setDuoToken(null); setScreen("duo"); }} />
        ) : null}

        {screen === "practice" ? (
          <ModeSelectScreen onStart={startGame} />
        ) : null}

        {screen === "stats" ? <StatsScreen state={stateView} demoMerged={attempts} /> : null}
        {screen === "leaderboard" ? (
          <LeaderboardScreen state={stateView} stats={stats}
            community={communityEnabled} meId={myUid()} myName={myName}
            online={onlineList} fetchTopActive={fetchTopActive} />
        ) : null}
        {screen === "profile" ? (
          <ProfileScreen state={stateView} stats={stats} cloud={cloud}
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
      position: "absolute", left: 16, right: 16, top: "calc(16px + var(--inset-top))", zIndex: 80, cursor: "pointer",
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
