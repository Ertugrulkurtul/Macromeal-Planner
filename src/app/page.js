import Link from "next/link";
import Nav from "@/components/Nav";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 mb-6">
          Ücretsiz · Bilimsel · Kişisel
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-100 leading-tight">
          Vücuduna özel
          <br />
          <span className="text-emerald-400">makro planı</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
          Kilo, boy, yaş ve aktivite seviyene göre günlük kalori ve makro
          ihtiyacını hesapla. Öğün planını ve alışveriş listeni otomatik oluştur.
        </p>
        <Link
          href="/profile"
          className="mt-10 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-gray-950 font-semibold px-8 py-4 rounded-xl transition text-base"
        >
          Başla
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "🔢",
              title: "Bilimsel Hesaplama",
              desc: "Mifflin-St Jeor formülü ile BMR ve TDEE hesabı. Yağ yakımı, idame veya kütle hedefine göre kalori ayarı.",
            },
            {
              icon: "🍽️",
              title: "10 Farklı Öğün Planı",
              desc: "Her hesaplamada farklı bir plan. Yumurta, lor peyniri, tavuk, hindi ve daha fazlasıyla çeşitli seçenekler.",
            },
            {
              icon: "🛒",
              title: "Alışveriş Listesi",
              desc: "Günlük plandan otomatik üretilen alışveriş listesi. Kopyala veya yazdır.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold text-gray-200">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pro Paket */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5">
                  PRO
                </span>
                <h2 className="text-lg font-bold text-gray-100">Pro Paket</h2>
              </div>
              <ul className="flex flex-col gap-2">
                {["30 günlük plan (PDF)", "Haftalık alışveriş listesi", "Daha fazla öğün alternatifi"].map((item) => (
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
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold px-5 py-2.5 rounded-xl transition text-sm whitespace-nowrap"
              >
                Pro Paketi Satın Al
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
