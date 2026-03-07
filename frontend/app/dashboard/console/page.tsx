"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "resolve" | "blocklist" | "filter" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("resolve");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // resolve tab
  const [resolveDomain, setResolveDomain] = useState("example.com");
  const [resolveType, setResolveType] = useState("A");
  const [resolveClientId, setResolveClientId] = useState("client-001");

  // blocklist tab
  const [blocklistDomains, setBlocklistDomains] = useState(
    "ads.example.com\ntracker.example.net\nmalware.example.org"
  );
  const [blocklistCategory, setBlocklistCategory] = useState("ads");

  // filter tab
  const [filterAds, setFilterAds] = useState(true);
  const [filterTrackers, setFilterTrackers] = useState(true);
  const [filterMalware, setFilterMalware] = useState(true);
  const [filterClientId, setFilterClientId] = useState("client-001");

  async function post(path: string, body: unknown) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["resolve", "blocklist", "filter", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-6">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-DNS-SaaS / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 space-y-4">
        {/* RESOLVE */}
        {tab === "resolve" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">DNS Resolve</h2>
            <div className="grid grid-cols-3 gap-4">
              <label className="block text-sm col-span-2">
                Domain
                <input
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={resolveDomain}
                  onChange={(e) => setResolveDomain(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                Record Type
                <select
                  className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                  value={resolveType}
                  onChange={(e) => setResolveType(e.target.value)}
                >
                  {["A", "AAAA", "CNAME", "MX", "TXT", "NS", "PTR"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block text-sm">
              Client ID (for per-client filter policy)
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={resolveClientId}
                onChange={(e) => setResolveClientId(e.target.value)}
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  post("/api/v1/dns/resolve", {
                    domain: resolveDomain,
                    record_type: resolveType,
                    client_id: resolveClientId,
                  })
                }
                disabled={loading}
                className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
              >
                {loading ? "Resolving..." : "POST /dns/resolve"}
              </button>
              <button
                onClick={() => get("/api/v1/dns/logs")}
                disabled={loading}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded text-green-400 text-sm disabled:opacity-50"
              >
                GET /dns/logs
              </button>
            </div>
          </>
        )}

        {/* BLOCKLIST */}
        {tab === "blocklist" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Blocklist Management</h2>
            <label className="block text-sm">
              Category
              <select
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={blocklistCategory}
                onChange={(e) => setBlocklistCategory(e.target.value)}
              >
                <option value="ads">Ads</option>
                <option value="trackers">Trackers</option>
                <option value="malware">Malware</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label className="block text-sm">
              Domains (one per line)
              <textarea
                rows={6}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500 resize-none"
                value={blocklistDomains}
                onChange={(e) => setBlocklistDomains(e.target.value)}
              />
            </label>
            <button
              onClick={() =>
                post("/api/v1/dns/blocklist", {
                  category: blocklistCategory,
                  domains: blocklistDomains
                    .split("\n")
                    .map((d) => d.trim())
                    .filter(Boolean),
                })
              }
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Updating..." : "POST /dns/blocklist"}
            </button>
          </>
        )}

        {/* FILTER */}
        {tab === "filter" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">Filter Configuration</h2>
            <label className="block text-sm">
              Client ID
              <input
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-green-400 focus:outline-none focus:border-green-500"
                value={filterClientId}
                onChange={(e) => setFilterClientId(e.target.value)}
              />
            </label>
            <div className="space-y-2">
              {[
                { label: "Block Ads", value: filterAds, set: setFilterAds },
                { label: "Block Trackers", value: filterTrackers, set: setFilterTrackers },
                { label: "Block Malware", value: filterMalware, set: setFilterMalware },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              onClick={() =>
                post("/api/v1/dns/filter/config", {
                  client_id: filterClientId,
                  block_ads: filterAds,
                  block_trackers: filterTrackers,
                  block_malware: filterMalware,
                })
              }
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "POST /dns/filter/config"}
            </button>
          </>
        )}

        {/* STATS */}
        {tab === "stats" && (
          <>
            <h2 className="text-lg font-semibold text-green-300">DNS Stats</h2>
            <p className="text-sm text-gray-400">
              Fetch resolver stats: total queries, blocked counts per category, cache hit rate,
              and estimated bandwidth savings.
            </p>
            <button
              onClick={() => get("/api/v1/dns/stats")}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 rounded text-white text-sm disabled:opacity-50"
            >
              {loading ? "Loading..." : "GET /dns/stats"}
            </button>
          </>
        )}
      </div>

      {/* Result */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Response</p>
        <pre className="text-green-400 text-sm whitespace-pre-wrap break-all min-h-[120px]">
          {loading ? "Waiting for response..." : result || "— no result yet —"}
        </pre>
      </div>
    </div>
  );
}
