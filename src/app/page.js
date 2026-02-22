"use client";

import { useState } from "react";

const GOAL_MULTIPLIERS = { fat_loss: 0.85, maintenance: 1.0, lean_bulk: 1.1 };
const GOAL_LABELS = { fat_loss: "Yağ Yakımı", maintenance: "İdame", lean_bulk: "Lean Bulk" };

function calculate({ weight, height, age, gender, activity, goal, protein }) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);
  const act = parseFloat(activity);
  const prot = parseFloat(protein);

  const bmr =
    gender === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

  const tdee = bmr * act;
  const targetCalories = tdee * GOAL_MULTIPLIERS[goal];
  const proteinG = prot * w;
  const fatG = (targetCalories * 0.25) / 9;
  const carbG = (targetCalories - (proteinG * 4 + fatG * 9)) / 4;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbG: Math.round(carbG),
  };
}

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const toNumber = (v) => {
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// Besin değerleri (g protein / g karbonhidrat / g yağ — her 100g için)
const MACROS_PER_100G = {

  tavuk:       { p: 31,   c: 0,   f: 3.5 },
  kiyma:       { p: 26,   c: 0,   f: 5   },
  yulaf:       { p: 17,   c: 66,  f: 7   },
  pirinc:      { p: 2.7,  c: 28,  f: 0.3 },
  patates:     { p: 2,    c: 17,  f: 0.1 },
  zeytinyagi:  { p: 0,    c: 0,   f: 100 },
  badem:       { p: 21,   c: 22,  f: 50  },
};

function buildMealPlan({ proteinG, carbG, fatG }) {
  const MIN_P = 25; // minimum protein per meal (g)

  // Adım 1: Öğün başına başlangıç protein hedefleri
  let pB = proteinG * 0.25; // kahvaltı
  let pL = proteinG * 0.30; // öğle
  let pS = proteinG * 0.15; // ara
  let pD = proteinG * 0.30; // akşam

  // Adım 2: Minimum protein zorla — açığı öğle/akşamdan al
  // (Ara öğün badem+elma'dan oluştuğu için protein minimum uygulanmaz)
  const borrow = (deficit) => {
    if (pL >= pD) {
      pL = Math.max(MIN_P, pL - deficit);
    } else {
      pD = Math.max(MIN_P, pD - deficit);
    }
  };
  if (pB < MIN_P) { borrow(MIN_P - pB); pB = MIN_P; }

  // Adım 3: Öğün başına karbonhidrat ve yağ hedefleri
  const cB = carbG * 0.25;
  const cL = carbG * 0.30;
  const cD = carbG * 0.30;
  const fL = fatG  * 0.30;
  const fS = fatG  * 0.15;

  // Adım 4: Gramaj hesapla + limitler

  // KAHVALTI
  // Karbonhidrat: yulaf (66g/100g)
  const yulaf_g  = clamp(Math.round(cB / MACROS_PER_100G.yulaf.c  * 100), 40,  90);

  // ÖĞLE
  // Protein: tavuk (31g/100g) — taşarsa fazlayı akşama aktar
  const tavuk_raw      = Math.round(pL / MACROS_PER_100G.tavuk.p * 100);
  const tavuk_g        = clamp(tavuk_raw, 120, 220);
  const tavuk_p_overflow = Math.max(0, tavuk_raw - 220) * (MACROS_PER_100G.tavuk.p / 100);
  // Karbonhidrat: pirinç (28g/100g) — taşarsa fazlayı patatesle akşama aktar
  const pirinc_raw     = Math.round(cL / MACROS_PER_100G.pirinc.c * 100);
  const pirinc_g       = clamp(pirinc_raw, 60, 120);
  const pirinc_c_overflow = Math.max(0, pirinc_raw - 120) * (MACROS_PER_100G.pirinc.c / 100);
  // Yağ: zeytinyağı (100g fat/100g = 1:1)
  const zeytinyagi_g   = clamp(Math.round(fL), 5, 15);

  // ARA ÖĞÜN
  // Yağ: badem (50g fat/100g)
  const badem_g = clamp(Math.round(fS / MACROS_PER_100G.badem.f * 100), 10, 30);

  // AKŞAM
  // Protein: kıyma (26g/100g) + taşan tavuk proteini
  const kiyma_raw = Math.round((pD + tavuk_p_overflow) / MACROS_PER_100G.kiyma.p * 100);
  const kiyma_g   = clamp(kiyma_raw, 140, 250);
  // Karbonhidrat: patates (17g/100g) + taşan pirinç karbı
  const patates_raw = Math.round((cD + pirinc_c_overflow) / MACROS_PER_100G.patates.c * 100);
  const patates_g   = clamp(patates_raw, 150, 350);

  // Yapısal öğün verisi: { key, label, amount, unit }
  const meals = [
    {
      name: "Kahvaltı", icon: "☀️",
      items: [
        { key: "yulaf",    label: "Yulaf",   amount: yulaf_g,   unit: "g"    },

        { key: "muz",      label: "Muz",     amount: 1,         unit: "adet" },
      ],
    },
    {
      name: "Öğle", icon: "🍽️",
      items: [
        { key: "tavuk",      label: "Tavuk göğsü",  amount: tavuk_g,      unit: "g"   },
        { key: "pirinc",     label: "Pirinç",        amount: pirinc_g,     unit: "g"   },
        { key: "zeytinyagi", label: "Zeytinyağı",    amount: zeytinyagi_g, unit: "g"   },
        { key: "sebze1",     label: "Karışık sebze", amount: null,         unit: null  },
      ],
    },
    {
      name: "Ara", icon: "🥜",
      items: [
        { key: "badem", label: "Badem", amount: badem_g, unit: "g"    },
        { key: "elma",  label: "Elma",  amount: 1,       unit: "adet" },
      ],
    },
    {
      name: "Akşam", icon: "🌙",
      items: [
        { key: "kiyma",   label: "Yağsız kıyma",  amount: kiyma_g,   unit: "g"  },
        { key: "patates", label: "Patates",         amount: patates_g, unit: "g"  },
        { key: "sebze2",  label: "Karışık sebze",  amount: null,      unit: null },
      ],
    },
  ];

  // Alışveriş listesi: aynı gıdaları birleştir
  const totalsMap = {};
  for (const meal of meals) {
    for (const item of meal.items) {
      const existing = totalsMap[item.label];
      if (!existing) {
        totalsMap[item.label] = { label: item.label, amount: item.amount, unit: item.unit };
      } else if (item.amount !== null && existing.amount !== null) {
        existing.amount += item.amount;
      }
    }
  }
  const shoppingList = Object.values(totalsMap);

  return { meals, shoppingList };
}

function itemDisplay({ label, amount, unit }) {
  if (amount === null) return label;
  if (unit === "g")    return `${amount}g ${label}`;
  return `${amount} ${unit} ${label}`;
}

function validate({ weight, height, age }) {
  const errors = [];
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);

  if (!weight || isNaN(w) || w < 30 || w > 250)
    errors.push("Kilo 30–250 kg arasında olmalıdır.");
  if (!height || isNaN(h) || h < 120 || h > 230)
    errors.push("Boy 120–230 cm arasında olmalıdır.");
  if (!age || isNaN(a) || a < 12 || a > 80)
    errors.push("Yaş 12–80 arasında olmalıdır.");

  return errors;
}

function StatRow({ label, value, unit, highlight }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0 ${
        highlight ? "text-emerald-400" : "text-gray-200"
      }`}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`font-semibold text-sm ${highlight ? "text-emerald-400" : ""}`}>
        {value}{" "}
        <span className={`text-xs font-normal ${highlight ? "text-emerald-500/70" : "text-gray-500"}`}>
          {unit}
        </span>
      </span>
    </div>
  );
}

function MacroBar({ label, grams, calories, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-medium">{grams} g</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${Math.min(100, (calories / 600) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [form, setForm] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "male",
    activity: "1.55",
    goal: "maintenance",
    protein: "2.0",
  });

  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCalculate = () => {
    const validationErrors = validate(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }
    setErrors([]);
    setResult(calculate(form));
  };

  const plan = result ? buildMealPlan(result) : null;

  const handleCopy = () => {
    if (!result || !plan) return;
    const mealLines = plan.meals
      .map((meal) => `${meal.name}:\n${meal.items.map((i) => `  - ${itemDisplay(i)}`).join("\n")}`)
      .join("\n\n");
    const shopLines = plan.shoppingList
      .map((i) => `  - ${i.label}: ${i.amount !== null ? `${i.amount} ${i.unit}` : "—"}`)
      .join("\n");
    const text = [
      "MacroMeal Planner",
      "",
      `Kalori: ${result.targetCalories} kcal`,
      `Protein: ${result.proteinG} g`,
      `Karbonhidrat: ${result.carbG} g`,
      `Yağ: ${result.fatG} g`,
      "",
      "--- Günlük Plan ---",
      mealLines,
      "",
      "--- Alışveriş Listesi ---",
      shopLines,
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const inputClass =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";
  const selectClass =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none cursor-pointer";

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-400 tracking-tight">
            MacroMeal Planner
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Günlük kalori ve makro ihtiyacını hesapla
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form Card */}
          <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-200 mb-5">
              Bilgilerini Gir
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Kilo (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Boy (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={form.height}
                  onChange={handleChange}
                  placeholder="175"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Yaş
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="25"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Cinsiyet
                </label>
                <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Aktivite Seviyesi
                </label>
                <select name="activity" value={form.activity} onChange={handleChange} className={selectClass}>
                  <option value="1.2">Sedentary (1.2) — Hareketsiz</option>
                  <option value="1.375">Light (1.375) — Hafif aktif</option>
                  <option value="1.55">Moderate (1.55) — Orta aktif</option>
                  <option value="1.725">Active (1.725) — Çok aktif</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Hedef
                </label>
                <select name="goal" value={form.goal} onChange={handleChange} className={selectClass}>
                  <option value="fat_loss">Yağ Yakımı (−15%)</option>
                  <option value="maintenance">İdame (0%)</option>
                  <option value="lean_bulk">Lean Bulk (+10%)</option>
                </select>
              </div>
            </div>

            {/* Protein Radio */}
            <div className="mt-5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-3">
                Protein Hedefi
              </label>
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
                    <input
                      type="radio"
                      name="protein"
                      value={opt.value}
                      checked={form.protein === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs opacity-70">{opt.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 flex flex-col gap-1">
                {errors.map((err, i) => (
                  <p key={i} className="text-red-400 text-xs flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleCalculate}
              className="mt-5 w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold py-3 rounded-xl transition text-sm tracking-wide"
            >
              Hesapla
            </button>
          </div>

          {/* Result Card */}
          <div className="lg:w-80 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl flex flex-col">
            {result ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-gray-200">Sonuçlar</h2>
                  <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-medium">
                    {GOAL_LABELS[form.goal]}
                  </span>
                </div>

                {/* Kalori Bloğu */}
                <div className="bg-gray-800/60 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Hedef Kalori</p>
                  <p className="text-4xl font-bold text-emerald-400">
                    {result.targetCalories}
                    <span className="text-base font-normal text-emerald-500/70 ml-1">kcal</span>
                  </p>
                </div>

                {/* BMR / TDEE */}
                <div className="mb-4">
                  <StatRow label="BMR" value={result.bmr} unit="kcal" />
                  <StatRow label="TDEE" value={result.tdee} unit="kcal" />
                </div>

                {/* Makrolar */}
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Makrolar
                </p>
                <div className="flex flex-col gap-3">
                  <MacroBar
                    label={`Protein — ${result.proteinG} g`}
                    grams={result.proteinG}
                    calories={result.proteinG * 4}
                    color="bg-blue-500"
                  />
                  <MacroBar
                    label={`Karbonhidrat — ${result.carbG} g`}
                    grams={result.carbG}
                    calories={result.carbG * 4}
                    color="bg-amber-400"
                  />
                  <MacroBar
                    label={`Yağ — ${result.fatG} g`}
                    grams={result.fatG}
                    calories={result.fatG * 9}
                    color="bg-rose-500"
                  />
                </div>

                {/* Kalori dağılımı */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Protein", kcal: result.proteinG * 4, color: "text-blue-400" },
                    { label: "Karb", kcal: result.carbG * 4, color: "text-amber-400" },
                    { label: "Yağ", kcal: result.fatG * 9, color: "text-rose-400" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-800/60 rounded-lg py-2 px-1">
                      <p className={`text-sm font-semibold ${m.color}`}>{m.kcal}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.label} kcal</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Hesaplamak için bilgileri gir</p>
              </div>
            )}
          </div>
        </div>

        {/* Örnek Günlük Plan + Alışveriş Listesi */}
        {result && (
          <>
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-200 mb-5">Örnek Günlük Plan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {plan.meals.map((meal) => (
                  <div key={meal.name} className="bg-gray-800/60 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-200 mb-3">
                      <span className="mr-1.5">{meal.icon}</span>
                      {meal.name}
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {meal.items.map((item) => (
                        <li key={item.key} className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {itemDisplay(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Alışveriş Listesi */}
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">Alışveriş Listesi</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {plan.shoppingList.map((item) => (
                  <li key={item.label} className="flex items-center justify-between border-b border-gray-800 py-2 text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-200">
                      {item.amount !== null ? `${item.amount} ${item.unit}` : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Aksiyon Butonları */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 border border-gray-700 text-gray-200 font-medium py-3 rounded-xl transition text-sm"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-400">Plan panoya kopyalandı ✅</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Planı Kopyala
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 border border-gray-700 text-gray-200 font-medium py-3 rounded-xl transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF Yazdır
              </button>
            </div>
          </>
        )}
        {/* Pro Paket */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
                  PRO
                </span>
                <h2 className="text-lg font-bold text-gray-100">Pro Paket</h2>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  "30 günlük plan (PDF)",
                  "Haftalık alışveriş listesi",
                  "Daha fazla öğün alternatifi",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <div>
                <p className="text-2xl font-bold text-gray-100">₺199</p>
                <p className="text-xs text-gray-500">tek sefer ödeme</p>
              </div>
              <a
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap"
              >
                Pro Paketi Satın Al
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
