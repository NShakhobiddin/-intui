/* ===== Intui — hamjamiyat: onlaynlar + eng faol foydalanuvchilar ===== */
import { cloudEnabled, supabase } from "./cloud.js";

export const communityEnabled = cloudEnabled;

// Barqaror foydalanuvchi identifikatori: Telegram user.id yoki lokal UUID
export function myUid() {
  try {
    const tg = typeof window !== "undefined" && window.Telegram ? window.Telegram.WebApp : null;
    const tgId = tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id;
    if (tgId) return "t" + tgId;
    let id = localStorage.getItem("intui_uid");
    if (!id) { id = "u" + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("intui_uid", id); }
    return id;
  } catch (e) { return "u0"; }
}

/* Onlaynlarни kuzatish — global presence kanali.
   me: { id, name, sec }; onList(list) chaqiriladi.
   Qaytaradi: { stop(), update({name, sec}) } */
export function watchOnline(me, onList) {
  if (!communityEnabled) return { stop() {}, update() {} };
  const ch = supabase.channel("intui-online", { config: { presence: { key: me.id } } });
  ch.on("presence", { event: "sync" }, () => {
    const st = ch.presenceState();
    const list = [];
    Object.keys(st).forEach((k) => {
      const m = st[k][0];
      if (m) list.push({ id: k, name: m.name || "Anonim", sec: m.sec || 0 });
    });
    list.sort((a, b) => b.sec - a.sec);
    if (onList) onList(list);
  });
  ch.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      try { await ch.track({ name: me.name, sec: me.sec || 0 }); } catch (e) { /* ignore */ }
    }
  });
  return {
    stop() { try { supabase.removeChannel(ch); } catch (e) { /* ignore */ } },
    update(m) { try { ch.track({ name: m.name, sec: m.sec || 0 }); } catch (e) { /* ignore */ } },
  };
}

// Foydalanish soatlarini serverga yozish (profiles jadvali)
export async function pushUsage(me) {
  if (!communityEnabled || !me || !me.id) return;
  try {
    await supabase.from("profiles").upsert({ id: me.id, name: me.name || "Anonim", total_sec: Math.round(me.sec || 0), updated_at: new Date().toISOString() });
  } catch (e) { /* ignore */ }
}

// Eng faol foydalanuvchilar (soat bo'yicha)
export async function fetchTopActive(limit = 25) {
  if (!communityEnabled) return [];
  try {
    const { data, error } = await supabase
      .from("profiles").select("id,name,total_sec")
      .order("total_sec", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []).filter((r) => (r.total_sec || 0) > 0);
  } catch (e) { return []; }
}
