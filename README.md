# ALICE-DNS-SaaS

DNS resolution service with Bloom filter ad, tracker, and malware blocking. 150,000+ blocklist rules stored in constant memory. Per-client filter policies and query logging with bandwidth savings reporting. Part of Project A.L.I.C.E.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       ALICE-DNS-SaaS                         │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │  Next.js │   │  Rust API    │   │  DNS Resolver      │  │
│  │ Frontend │──▶│  (Axum)      │──▶│  Upstream Query    │  │
│  │          │   │  :8081       │   │  Cache Layer       │  │
│  └──────────┘   └──────────────┘   └────────────────────┘  │
│                        │                      │             │
│                 ┌──────▼──────┐    ┌──────────▼─────────┐  │
│                 │ Bloom Filter│    │  Query Log          │  │
│                 │ 150K+ rules │    │  Per-Client Policy  │  │
│                 │ Ads/Track/  │    │  Bandwidth Tracker  │  │
│                 │ Malware     │    └────────────────────┘  │
│                 └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Detail |
|---|---|
| Bloom filter blocking | 150K+ domain rules in compact constant-memory structure |
| Three blocklist categories | Ads, trackers, malware — independently togglable |
| Per-client filter config | Different blocking policies per client/device |
| Query logging | All queries logged with result, blocked flag, latency |
| Bandwidth savings | Cumulative bytes saved by blocking reported per client |
| Standard record types | A, AAAA, CNAME, MX, TXT, NS, PTR |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/dns/resolve` | Resolve a domain with filter enforcement |
| POST | `/api/v1/dns/blocklist` | Add domains to a blocklist category |
| POST | `/api/v1/dns/filter/config` | Set per-client filter policy |
| GET | `/api/v1/dns/logs` | Retrieve recent query logs |
| GET | `/api/v1/dns/stats` | Resolver stats and bandwidth savings |

## Quick Start

```bash
# Clone and start
git clone https://github.com/ext-sakamoro/ALICE-DNS-SaaS.git
cd ALICE-DNS-SaaS

# Start the API (Rust)
cargo run --release

# Start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000

# Resolve a domain
curl -X POST http://localhost:8081/api/v1/dns/resolve \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com","record_type":"A","client_id":"client-001"}'

# Configure per-client filter
curl -X POST http://localhost:8081/api/v1/dns/filter/config \
  -H "Content-Type: application/json" \
  -d '{"client_id":"client-001","block_ads":true,"block_trackers":true,"block_malware":true}'

# Add domains to blocklist
curl -X POST http://localhost:8081/api/v1/dns/blocklist \
  -H "Content-Type: application/json" \
  -d '{"category":"ads","domains":["ads.example.com","banner.example.net"]}'

# View stats
curl http://localhost:8081/api/v1/dns/stats
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8081` | Backend API base URL |
| `ALICE_DNS_UPSTREAM` | `1.1.1.1:53` | Upstream DNS resolver |
| `ALICE_DNS_BLOOM_SIZE_BITS` | `2097152` | Bloom filter size in bits |
| `ALICE_DNS_BLOCKLIST_DIR` | `/var/lib/alice-dns/blocklists` | Blocklist file directory |

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).

Part of [Project A.L.I.C.E.](https://github.com/ext-sakamoro)
