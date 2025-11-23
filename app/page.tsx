"use client";

import { motion } from "framer-motion";
import ProductExplorer from "@/components/ProductExplorer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          {/* Left text */}
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200"
            >
              <span className="text-xs">✨ AI Shop Assistant</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-100">
                Facebook Page থেকে direct chat
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-3xl md:text-4xl font-bold leading-tight"
            >
              Bangla AI Shopping Chat
              <span className="block text-emerald-400">
                আপনার Facebook কাস্টমারদের জন্য
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="text-sm md:text-base text-slate-200 max-w-md"
            >
              Three-piece, শাড়ি, টু-পিস — সব প্রোডাক্ট দেখুন, প্রশ্ন করুন আর অর্ডার
              করুন একদম WhatsApp/Messenger টাইপ চ্যাটের ভেতরেই। কাস্টমার কথা বলবে,
              AI বুঝে প্রোডাক্ট দেখাবে আর অর্ডার কনফার্ম করবে।
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3"
            >
              <a
                href="/chat"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold shadow hover:bg-emerald-400 transition"
              >
                Open Chat Now
                <span>💬</span>
              </a>
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-600 text-xs md:text-sm text-slate-100 hover:border-emerald-500 hover:text-emerald-300 transition"
              >
                See how products work
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="flex flex-wrap gap-4 text-[11px] text-slate-300"
            >
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✅</span>
                <span>100% Bangla chat flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✅</span>
                <span>RAG দিয়ে প্রোডাক্ট suggest</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✅</span>
                <span>Email অর্ডার কনফার্মেশন</span>
              </div>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mt-1 text-[11px] text-slate-500"
            >
              আপনার Facebook Page-এর বাটন থেকে কাস্টমার সরাসরি এই পেইজে আসবে।
            </motion.p>
          </motion.div>

          {/* Right: chat preview card */}
          <motion.div
            className="flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <motion.div
              className="w-[280px] sm:w-[320px] h-[480px] sm:h-[520px] rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* header */}
              <div className="px-3 py-2 bg-emerald-700 flex items-center gap-2 text-slate-50">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                  AI
                </div>
                <div>
                  <div className="text-sm font-semibold">Hope Boutique</div>
                  <div className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span>online • now</span>
                  </div>
                </div>
              </div>

              {/* chat preview body */}
              <div className="flex-1 bg-[url('/chatbot.png')] bg-cover bg-center p-3 text-[11px] space-y-3">
                <div className="max-w-[80%] bg-black/60 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3 py-2 shadow text-slate-50">
                  আপু, কী দেখতে চান? Three-piece না শাড়ি? 🥰
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-emerald-500 text-slate-900 rounded-2xl rounded-br-sm px-3 py-2 shadow">
                    apu red threepiece chai
                  </div>
                </div>
                <div className="max-w-[80%] bg-black/60 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3 py-2 shadow text-slate-50">
                  ঠিক আছে, এই তিনটা ডিজাইন দেখুন, পছন্দ হলে 👉{" "}
                  <span className="font-semibold">"apu eta order dibo"</span>{" "}
                  লিখে দিন।
                </div>
              </div>

              {/* footer note */}
              <div className="px-3 py-2 bg-slate-900 flex items-center gap-2">
                <div className="flex-1 text-[10px] text-slate-400">
                  এটি শুধু প্রিভিউ। আসল চ্যাটের জন্য উপরের{" "}
                  <span className="text-emerald-400 font-semibold">
                    Open Chat Now
                  </span>{" "}
                  বাটনে ক্লিক করুন।
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-sm md:text-base font-semibold text-slate-100 mb-2"
          >
            Products
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400 mb-4"
          >
            Three-piece, শাড়ি, টু-পিস সহ আপনার সব প্রোডাক্ট AI চ্যাটে suggest হবে।
            কাস্টমার Bangla তে যা লিখবে, AI সেই অনুযায়ী প্রোডাক্ট বেছে দেখাবে।
          </motion.p>

          {/* 🔥 Product Explorer: category buttons + search + list */}
          <ProductExplorer />

          {/* চাইলে নিচের static cards রাখতেও পারো, না চাইলে বাদ দাও */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] md:text-xs">
            {[
              {
                title: "Three-piece Collection",
                desc: "রেড, পিংক, বেবি ব্লু — সব কালার আর সাইজ data থেকে RAG দিয়ে উঠবে।",
              },
              {
                title: "Silk & Cotton শাড়ি",
                desc: 'কাস্টমার বলবে "red katan shari", AI সাথে সাথে অপশন দেবে ছবি সহ।',
              },
              {
                title: "Daily Wear & Offers",
                desc: "Offer, discount, নতুন কালেকশন – সব কিছু চ্যাটেই auto mention হবে।",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                variants={fadeIn}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 cursor-default"
              >
                <div className="font-semibold text-slate-100 mb-1">
                  {item.title}
                </div>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="mx-auto max-w-5xl px-4 pb-6 md:pb-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-sm md:text-base font-semibold text-slate-100 mb-2"
          >
            About
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400 mb-3"
          >
            Hope Boutique হল আপনার অনলাইন ফ্যাশন স্টোর, যেখানে গ্রাহকরা সহজে চ্যাটের
            মাধ্যমে অর্ডার করতে পারবেন। এই অ্যাপটি মূলত Facebook পেজ থেকে আসা
            কাস্টমারদের জন্য বানানো — যাতে তারা ইনবক্সের বদলে সরাসরি AI এর সাথে
            কথা বলে প্রোডাক্ট দেখে নিতে পারে।
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400"
          >
            আপনি ভবিষ্যতে চাইলে নতুন ক্যাটাগরি, সাইজ, স্টক স্ট্যাটাস সব কিছু এই
            সিস্টেমের সঙ্গে কানেক্ট করে নিতে পারবেন।
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="mx-auto max-w-5xl px-4 pb-6 md:pb-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-sm md:text-base font-semibold text-slate-100 mb-2"
          >
            Contact
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400 mb-3"
          >
            চাইলে এখানে আপনার WhatsApp নাম্বার, Messenger link, বা কল করার নাম্বার
            future এ বসাতে পারো। কাস্টমার চাইলে সরাসরি চ্যাট শেষ করে এখান থেকেও
            যোগাযোগ করতে পারবে।
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="text-[11px] md:text-xs text-slate-400"
          >
            উদাহরণ:
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>WhatsApp: +8801XXXXXXXXX</li>
              <li>Messenger: m.me/hopeboutique</li>
              <li>Phone: 01XXXXXXXXX (10am – 10pm)</li>
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* Policy Section */}
      <section id="policy" className="mx-auto max-w-5xl px-4 pb-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-sm md:text-base font-semibold text-slate-100 mb-2"
          >
            Policy
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400 mb-2"
          >
            Cash on delivery / advance payment, return policy ইত্যাদি লিখে রাখার জন্য
            এই সেকশন। কাস্টমার চাইলে চ্যাটেই এসব পলিসি সম্পর্কে জানতে পারবে।
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="text-xs md:text-sm text-slate-400"
          >
            ভবিষ্যতে আপনি এই পলিসি ডেটাও RAG data সোর্সে যোগ করলে, AI সরাসরি পলিসি
            থেকে উত্তর দিতে পারবে —{" "}
            <span className="text-emerald-300">
              "apu return policy ki?" → সাথে সাথে ডিটেইলস
            </span>
            ।
          </motion.p>
        </motion.div>
      </section>
    </main>
  );
}
