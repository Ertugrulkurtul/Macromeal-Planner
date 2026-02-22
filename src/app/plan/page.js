"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { buildMealPlan, itemDisplay, GOAL_LABELS } from "@/lib/macros";

export default function PlanPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("macroResult");
    if (!raw) { router.replace("/calculator"); return; }
    const parsed = JSON.parse(raw);
    setResult(parsed);
    setPlan(buildMealPlan(parsed));
  }, [router]);

  if (!result || !plan) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const handleCopy = () => {
    const lines = [
      `MacroMeal Planner — ${GOAL_LABELS[result.goal]}`,
      `BMR: ${result.bmr} kcal | TDEE: ${result.tdee} kcal | Hedef: ${result.targetCalories} kcal`,
      `Protein: ${result.proteinG}g | Yağ: ${result.fatG}g | Karbonhidrat: ${result.carbG}g`,
      "",
      ...plan.meals.map((meal) =>
        [`${meal.icon} ${meal.name}`, ...meal.items.map((item) => `  • ${itemDisplay(item)}`)].join("\n")
      ),
      "",
      "🛒 Alışveriş Listesi:",
      ...plan.shoppingList.map((item) => `  • ${itemDisplay(item)}`),
    ].join("\n");
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const macroPercent = (g, kcalPerG) =>
    Math.round((g * kcalPerG * 100) / result.targetCalories);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 print:bg-white print:text-gray-900">
      <Nav />
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Günlük Planın</h1>
            <p className="text-gray-400 mt-1 text-sm">{GOAL_LABELS[result.goal]} hedefine göre</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? "Kopyalandı!" : "Kopyala"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-2 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Yazdır
            </button>
          </div>
        </div>

        {/* Calorie + Macro Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl mb-5">
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

          <div className="flex flex-col gap-3">
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
        </div>

        {/* Meal Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {plan.meals.map((meal) => (
            <div key={meal.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{meal.icon}</span>
                <span className="font-semibold text-gray-200 text-sm">{meal.name}</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {meal.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                    {itemDisplay(item)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Shopping List */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🛒</span>
            <h2 className="font-semibold text-gray-200">Alışveriş Listesi</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {plan.shoppingList.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-gray-400">
                <span className="w-4 h-4 rounded border border-gray-700 shrink-0 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-sm bg-gray-700" />
                </span>
                {itemDisplay(item)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => router.push("/calculator")}
            className="text-sm text-gray-500 hover:text-emerald-400 transition"
          >
            Yeniden hesapla →
          </button>
        </div>
      </div>
    </main>
  );
}
