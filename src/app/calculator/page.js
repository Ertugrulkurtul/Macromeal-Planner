"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { calculate, PLAN_TEMPLATES } from "@/lib/macros";

export default function CalculatorPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ activity: "1.55", goal: "maintenance", protein: "2.0" });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("profileData");
    if (!raw) { router.replace("/profile"); return; }
    try { setProfile(JSON.parse(raw)); } catch { router.replace("/profile"); }

    const savedResult = localStorage.getItem("macroResult");
    if (savedResult) {
      try { setResult(JSON.parse(savedResult)); } catch {}
    }
  }, [router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCalculate = () => {
    const planIdx = Math.floor(Math.random() * PLAN_TEMPLATES.length);
    const res = calculate({ ...profile, ...form });
    const macroResult = { ...res, goal: form.goal, planIdx };
    setResult(macroResult);
    localStorage.setItem("macroResult", JSON.stringify(macroResult));
  };

  const macroPercent = (g, kcalPerG) =>
    result ? Math.round((g * kcalPerG * 100) / result.targetCalories) : 0;

  const selectClass =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none cursor-pointer";

  if (!profile) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Nav />
      <div className="max-w-lg mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Hesaplama</h1>
          <p className="text-gray-400 mt-1 text-sm">Aktivite ve hedefini belirle</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Aktivite Seviyesi</label>
              <select name="activity" value={form.activity} onChange={handleChange} className={selectClass}>
                <option value="1.2">Sedentary (1.2) — Hareketsiz</option>
                <option value="1.375">Light (1.375) — Hafif aktif</option>
                <option value="1.55">Moderate (1.55) — Orta aktif</option>
                <option value="1.725">Active (1.725) — Çok aktif</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Hedef</label>
              <select name="goal" value={form.goal} onChange={handleChange} className={selectClass}>
                <option value="fat_loss">Yağ Yakımı (−15%)</option>
                <option value="maintenance">İdame (0%)</option>
                <option value="lean_bulk">Lean Bulk (+10%)</option>
              </select>
            </div>
          </div>

          {/* Protein Radio */}
          <div className="mt-5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-3">Protein Hedefi</label>
            <div className="flex gap-3">
              {[
                { value: "1.6", label: "1.6 g/kg", desc: "Minimum" },
                { value: "2.0", label: "2.0 g/kg", desc: "Optimal" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl border cursor-pointer transition ${
                    form.protein === opt.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <input type="radio" name="protein" value={opt.value} checked={form.protein === opt.value} onChange={handleChange} className="sr-only" />
                  <span className="font-semibold text-sm">{opt.label}</span>
                  <span className="text-xs opacity-70">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="mt-5 w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold py-3 rounded-xl transition text-sm tracking-wide"
          >
            Hesapla
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-5 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "BMR", value: result.bmr, unit: "kcal" },
                { label: "TDEE", value: result.tdee, unit: "kcal" },
                { label: "Hedef", value: result.targetCalories, unit: "kcal", highlight: true },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center justify-center rounded-xl py-3 px-2 ${
                    s.highlight ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-gray-800/60"
                  }`}
                >
                  <span className={`text-xl font-bold ${s.highlight ? "text-emerald-400" : "text-gray-100"}`}>
                    {s.value}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">{s.unit}</span>
                  <span className={`text-xs font-medium mt-1 ${s.highlight ? "text-emerald-400" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Macro Bars */}
            <div className="flex flex-col gap-3 mb-5">
              {[
                { label: "Protein", g: result.proteinG, kcalPerG: 4, color: "bg-blue-500" },
                { label: "Karbonhidrat", g: result.carbG, kcalPerG: 4, color: "bg-amber-500" },
                { label: "Yağ", g: result.fatG, kcalPerG: 9, color: "bg-rose-500" },
              ].map((m) => {
                const pct = macroPercent(m.g, m.kcalPerG);
                return (
                  <div key={m.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-400">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{pct}%</span>
                        <span className="text-sm font-semibold text-gray-200">{m.g}g</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => router.push("/plan")}
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold py-3 rounded-xl transition text-sm tracking-wide"
            >
              Öğün Planını Gör →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
