/* ===== Intui — bulut sinxronlash (Supabase) ===== */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kalitlar berilmagan bo'lsa ilova faqat lokal rejimda ishlayveradi
// (Profildagi "Bulutda saqlash" bo'limi ko'rinmaydi).
export const cloudEnabled = Boolean(url && key);
export const supabase = cloudEnabled ? createClient(url, key) : null;

export async function fetchCloudState(userId) {
  const { data, error } = await supabase.from("states").select("data").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data ? data.data : null;
}

export async function pushCloudState(userId, state) {
  const { error } = await supabase.from("states").upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

const AUTH_ERRORS = {
  "Invalid login credentials": "Email yoki parol noto'g'ri",
  "User already registered": "Bu email allaqachon ro'yxatdan o'tgan",
  "Email not confirmed": "Email hali tasdiqlanmagan — pochtangizni tekshiring",
  "Failed to fetch": "Internet bilan aloqa yo'q",
};
export function authErrorText(e) {
  const m = e && e.message ? e.message : String(e);
  return AUTH_ERRORS[m] || m;
}
