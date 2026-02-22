"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { validate } from "@/lib/macros";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ weight: "", height: "", age: "", gender: "male" });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("profileData");
    if (raw) {
      try { setForm(JSON.parse(raw)); } catch {}
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    const errs = validate(form);
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    localStorage.setItem("profileData", JSON.stringify(form));
    router.push("/calculator");
  };

  const inputClass =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";
  const selectClass =
    "bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition appearance-none cursor-pointer";

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Nav />
      <div className="max-w-lg mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-emerald-400 tracking-tight">Profil Bilgilerin</h1>
          <p className="text-gray-400 mt-1 text-sm">Kişisel ölçülerini gir</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Kilo (kg)</label>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="70" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Boy (cm)</label>
              <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="175" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Yaş</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} placeholder="25" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cinsiyet</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
              </select>
            </div>
          </div>

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

          <button
            onClick={handleNext}
            className="mt-5 w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold py-3 rounded-xl transition text-sm tracking-wide"
          >
            Devam → Hesaplama
          </button>
        </div>
      </div>
    </main>
  );
}
