export const GOAL_MULTIPLIERS = { fat_loss: 0.85, maintenance: 1.0, lean_bulk: 1.1 };
export const GOAL_LABELS = { fat_loss: "Yağ Yakımı", maintenance: "İdame", lean_bulk: "Lean Bulk" };

export function calculate({ weight, height, age, gender, activity, goal, protein }) {
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

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const toNumber = (v) => {
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

export const FOOD_DB = {
  yumurta:    { label: "Yumurta",      isUnit: true, pPerUnit: 7,   unit: "adet", min: 2,   max: 6   },
  lor:        { label: "Lor peyniri",  p100: 12,     unit: "g",     min: 100, max: 250 },
  tavuk:      { label: "Tavuk göğsü",  p100: 31,     unit: "g",     min: 120, max: 220 },
  hindi:      { label: "Hindi göğsü",  p100: 29,     unit: "g",     min: 120, max: 220 },
  kiyma:      { label: "Yağsız kıyma", p100: 26,     unit: "g",     min: 140, max: 250 },
  yulaf:      { label: "Yulaf",        c100: 66,     unit: "g",     min: 40,  max: 90  },
  pirinc:     { label: "Pirinç",       c100: 28,     unit: "g",     min: 60,  max: 120 },
  bulgur:     { label: "Bulgur",       c100: 23,     unit: "g",     min: 60,  max: 130 },
  patates:    { label: "Patates",      c100: 17,     unit: "g",     min: 150, max: 350 },
  zeytinyagi: { label: "Zeytinyağı",   f100: 100,    unit: "g",     min: 5,   max: 15  },
  badem:      { label: "Badem",        f100: 50,     unit: "g",     min: 10,  max: 30  },
};

export const PLAN_TEMPLATES = [
  { bp: "yumurta", bc: "yulaf", lp: "tavuk", lc: "pirinc", dp: "kiyma",  dc: "patates" },
  { bp: "lor",     bc: "yulaf", lp: "hindi", lc: "pirinc", dp: "kiyma",  dc: "patates" },
  { bp: "yumurta", bc: "yulaf", lp: "kiyma", lc: "bulgur", dp: "tavuk",  dc: "patates" },
  { bp: "lor",     bc: "yulaf", lp: "tavuk", lc: "bulgur", dp: "hindi",  dc: "patates" },
  { bp: "yumurta", bc: "yulaf", lp: "hindi", lc: "pirinc", dp: "tavuk",  dc: "patates" },
  { bp: "lor",     bc: "yulaf", lp: "kiyma", lc: "pirinc", dp: "hindi",  dc: "patates" },
  { bp: "yumurta", bc: "yulaf", lp: "tavuk", lc: "bulgur", dp: "hindi",  dc: "patates" },
  { bp: "lor",     bc: "yulaf", lp: "hindi", lc: "bulgur", dp: "kiyma",  dc: "patates" },
  { bp: "yumurta", bc: "yulaf", lp: "kiyma", lc: "pirinc", dp: "hindi",  dc: "patates" },
  { bp: "lor",     bc: "yulaf", lp: "tavuk", lc: "pirinc", dp: "kiyma",  dc: "bulgur"  },
];

export function buildMealPlan({ proteinG, carbG, fatG, planIdx = 0 }) {
  const t = PLAN_TEMPLATES[planIdx % PLAN_TEMPLATES.length];
  const MIN_P = 25;

  let pB = proteinG * 0.25;
  let pL = proteinG * 0.30;
  let pD = proteinG * 0.30;

  const borrow = (d) => {
    if (pL >= pD) pL = Math.max(MIN_P, pL - d);
    else           pD = Math.max(MIN_P, pD - d);
  };
  if (pB < MIN_P) { borrow(MIN_P - pB); pB = MIN_P; }

  const cB = carbG * 0.25, cL = carbG * 0.30, cD = carbG * 0.30;
  const fL = fatG * 0.30,  fS = fatG * 0.15;

  const proteinAmount = (foodKey, target) => {
    const f = FOOD_DB[foodKey];
    if (f.isUnit) return { amount: clamp(Math.round(target / f.pPerUnit), f.min, f.max), unit: f.unit };
    return { amount: clamp(Math.round(target * 100 / f.p100), f.min, f.max), unit: "g" };
  };
  const carbAmount = (foodKey, target) => {
    const f = FOOD_DB[foodKey];
    return { amount: clamp(Math.round(target * 100 / f.c100), f.min, f.max), unit: "g" };
  };
  const fatAmount = (foodKey, target) => {
    const f = FOOD_DB[foodKey];
    return { amount: clamp(Math.round(target * 100 / f.f100), f.min, f.max), unit: "g" };
  };

  const bp = proteinAmount(t.bp, pB);
  const bc = carbAmount(t.bc, cB);

  const lpFood = FOOD_DB[t.lp];
  const lpRaw = lpFood.isUnit
    ? Math.round(pL / lpFood.pPerUnit)
    : Math.round(pL * 100 / lpFood.p100);
  const lp = proteinAmount(t.lp, pL);
  const lp_overflow = lpFood.isUnit
    ? Math.max(0, lpRaw - lpFood.max) * lpFood.pPerUnit
    : Math.max(0, lpRaw - lpFood.max) * (lpFood.p100 / 100);

  const lcRaw = Math.round(cL * 100 / FOOD_DB[t.lc].c100);
  const lc = carbAmount(t.lc, cL);
  const lc_overflow = Math.max(0, lcRaw - FOOD_DB[t.lc].max) * (FOOD_DB[t.lc].c100 / 100);

  const zey = fatAmount("zeytinyagi", fL);
  const bad = fatAmount("badem", fS);

  const dp = proteinAmount(t.dp, pD + lp_overflow);
  const dc = carbAmount(t.dc, cD + lc_overflow);

  const meals = [
    {
      name: "Kahvaltı", icon: "☀️",
      items: [
        { key: t.bp,  label: FOOD_DB[t.bp].label, ...bp },
        { key: t.bc,  label: FOOD_DB[t.bc].label, ...bc },
        { key: "muz", label: "Muz", amount: 1, unit: "adet" },
      ],
    },
    {
      name: "Öğle", icon: "🍽️",
      items: [
        { key: t.lp,         label: FOOD_DB[t.lp].label, ...lp },
        { key: t.lc,         label: FOOD_DB[t.lc].label, ...lc },
        { key: "zeytinyagi", label: "Zeytinyağı", ...zey },
        { key: "sebze1",     label: "Karışık sebze", amount: null, unit: null },
      ],
    },
    {
      name: "Ara", icon: "🥜",
      items: [
        { key: "badem", label: "Badem", ...bad },
        { key: "elma",  label: "Elma",  amount: 1, unit: "adet" },
      ],
    },
    {
      name: "Akşam", icon: "🌙",
      items: [
        { key: t.dp,     label: FOOD_DB[t.dp].label, ...dp },
        { key: t.dc,     label: FOOD_DB[t.dc].label, ...dc },
        { key: "sebze2", label: "Karışık sebze", amount: null, unit: null },
      ],
    },
  ];

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

  return { meals, shoppingList: Object.values(totalsMap) };
}

export function itemDisplay({ label, amount, unit }) {
  if (amount === null) return label;
  if (unit === "g")    return `${amount}g ${label}`;
  return `${amount} ${unit} ${label}`;
}

export function validate({ weight, height, age }) {
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
