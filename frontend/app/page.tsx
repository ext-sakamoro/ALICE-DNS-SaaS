import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight text-green-400">
          ALICE-DNS-SaaS
        </span>
        <Link
          href="/dashboard/console"
          className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-medium transition-colors"
        >
          Dashboard
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl font-extrabold mb-6 leading-tight">
          DNS Resolution with{" "}
          <span className="text-green-400">Bloom Filter Blocking</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          150,000+ blocklist rules for ads, trackers, and malware domains.
          Bloom filter lookups in constant time. Per-client filter policies,
          query logging, and real-time bandwidth savings reporting.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard/console"
            className="px-6 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors"
          >
            Open Console
          </Link>
          <a
            href="#features"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 font-semibold transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-green-300">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Bloom Filter Blocking",
              desc: "150,000+ blocklist rules stored in a compact Bloom filter. O(1) lookup per DNS query.",
              icon: "B",
            },
            {
              title: "Ad / Tracker / Malware",
              desc: "Three independent blocklist categories. Enable or disable each per client independently.",
              icon: "X",
            },
            {
              title: "Filter Configuration",
              desc: "Per-client filter policies. Different users or devices can have different blocking rules.",
              icon: "F",
            },
            {
              title: "Query Logging",
              desc: "All DNS queries logged with resolution result, blocked flag, and latency.",
              icon: "L",
            },
            {
              title: "Bandwidth Savings",
              desc: "Track how many bytes of ad and tracker content were blocked across all clients.",
              icon: "S",
            },
            {
              title: "Standard Record Types",
              desc: "Supports A, AAAA, CNAME, MX, TXT, NS, and PTR record types.",
              icon: "R",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-700 transition-colors"
            >
              <div className="text-2xl mb-3 font-mono text-green-500 font-bold w-10 h-10 flex items-center justify-center bg-gray-900 rounded">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-300">
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
        ALICE-DNS-SaaS — Project A.L.I.C.E. &mdash; AGPL-3.0-or-later
      </footer>
    </div>
  );
}
