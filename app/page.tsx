// app/page.tsx

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16 flex flex-col md:flex-row items-center gap-10">
        {/* Left text */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
            Bangla AI Shopping Chat
            <span className="block text-emerald-400">
              আপনার Facebook কাস্টমারদের জন্য
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-200 mb-5 max-w-md">
            Three-piece, শাড়ি, টু-পিস — সব প্রোডাক্ট দেখুন, প্রশ্ন করুন আর অর্ডার
            করুন একদম WhatsApp/Messenger টাইপ চ্যাটের ভেতরেই।
          </p>
          <a
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold shadow hover:bg-emerald-400 transition"
          >
            Open Chat Now
            <span>💬</span>
          </a>
          <p className="mt-2 text-[11px] text-slate-400">
            আপনার Facebook Page-এর বাটন থেকে কাস্টমার সরাসরি এই পেইজে আসবে।
          </p>
        </div>

        {/* Right: small chat preview box */}
        <div className="flex-1 flex justify-center">
          <div className="w-[320px] h-[520px] rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="px-3 py-2 bg-emerald-700 flex items-center gap-2 text-slate-50">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                AI
              </div>
              <div>
                <div className="text-sm font-semibold">Hope Boutique</div>
                <div className="text-[11px] text-emerald-100">online • now</div>
              </div>
            </div>
            <div className="flex-1 bg-emerald-50/80 p-3 text-[11px] space-y-2">
              <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow text-slate-800">
                আপু, কী দেখতে চান? Three-piece না শাড়ি? 🥰
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-emerald-500 text-slate-900 rounded-2xl rounded-br-sm px-3 py-2 shadow">
                  apu red threepiece chai
                </div>
              </div>
              <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow text-slate-800">
                ঠিক আছে, এই তিনটা ডিজাইন দেখুন, পছন্দ হলে 👉 "apu eta order dibo"
                লিখে দিন।
              </div>
            </div>
            <div className="px-3 py-2 bg-white flex items-center gap-2">
              <div className="flex-1 text-[10px] text-slate-400">
                This is just a preview. Real chat নিচের Start Chat বাটনে।
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* অন্যান্য সেকশন */}
      <section id="products" className="mx-auto max-w-5xl px-4 pb-10">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">Products</h2>
        <p className="text-xs text-slate-400">
          Three-piece, শাড়ি, টু-পিস সহ আপনার সব প্রোডাক্ট AI চ্যাটে suggest হবে।
        </p>
      </section>

      <section id="about" className="mx-auto max-w-5xl px-4 pb-6">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">About</h2>
        <p className="text-xs text-slate-400">
          Hope Boutique হল আপনার অনলাইন ফ্যাশন স্টোর, যেখানে গ্রাহকরা সহজে চ্যাটের
          মাধ্যমে অর্ডার করতে পারবেন।
        </p>
      </section>

      <section id="contact" className="mx-auto max-w-5xl px-4 pb-6">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">Contact</h2>
        <p className="text-xs text-slate-400">
          চাইলে এখানে আপনার WhatsApp নাম্বার, Messenger link, কিংবা ফোন নম্বর future এ
          বসাতে পারো।
        </p>
      </section>

      <section id="policy" className="mx-auto max-w-5xl px-4 pb-8">
        <h2 className="text-sm font-semibold text-slate-100 mb-2">Policy</h2>
        <p className="text-xs text-slate-400">
          Cash on delivery / advance payment, return policy ইত্যাদি লিখে রাখার জন্য
          এই সেকশন।
        </p>
      </section>
    </main>
  );
}
