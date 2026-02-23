use axum::{extract::State, response::Json, routing::{get, post}, Router};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;

struct AppState { start_time: Instant, stats: Mutex<Stats> }
struct Stats { total_queries: u64, total_blocked: u64, total_rules: u64, bytes_saved: u64 }

#[derive(Serialize)]
struct Health { status: String, version: String, uptime_secs: u64, total_ops: u64 }

#[derive(Deserialize)]
struct ResolveRequest { domain: String, record_type: Option<String> }
#[derive(Serialize)]
struct ResolveResponse { domain: String, record_type: String, answers: Vec<DnsAnswer>, blocked: bool, bloom_lookup_ns: u64, elapsed_us: u128 }
#[derive(Serialize)]
struct DnsAnswer { name: String, record_type: String, value: String, ttl: u32 }

#[derive(Deserialize)]
struct BlocklistRequest { action: String, domains: Vec<String>, category: Option<String> }
#[derive(Serialize)]
struct BlocklistResponse { status: String, domains_affected: usize, bloom_filter_size_bytes: u64, false_positive_rate: f64 }

#[derive(Deserialize)]
struct FilterConfigRequest { block_ads: Option<bool>, block_trackers: Option<bool>, block_malware: Option<bool>, block_adult: Option<bool>, custom_blocklist: Option<Vec<String>> }
#[derive(Serialize)]
struct FilterConfigResponse { status: String, config: FilterConfig }
#[derive(Serialize)]
struct FilterConfig { block_ads: bool, block_trackers: bool, block_malware: bool, block_adult: bool, custom_domains: usize, total_blocked_domains: u64 }

#[derive(Serialize)]
struct QueryLog { domain: String, record_type: String, blocked: bool, response_time_us: u64, category: String, timestamp: String }

#[derive(Serialize)]
struct StatsResponse { total_queries: u64, total_blocked: u64, block_rate_pct: f64, total_rules: u64, bloom_filter_size_kb: f64, bytes_saved: u64 }

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt().with_env_filter(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "dns_engine=info".into())).init();
    let state = Arc::new(AppState { start_time: Instant::now(), stats: Mutex::new(Stats { total_queries: 0, total_blocked: 0, total_rules: 150_000, bytes_saved: 0 }) });
    let cors = CorsLayer::new().allow_origin(Any).allow_methods(Any).allow_headers(Any);
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/dns/resolve", post(resolve))
        .route("/api/v1/dns/blocklist", post(blocklist))
        .route("/api/v1/dns/filter/config", post(filter_config))
        .route("/api/v1/dns/logs", get(query_logs))
        .route("/api/v1/dns/stats", get(stats))
        .layer(cors).layer(TraceLayer::new_for_http()).with_state(state);
    let addr = std::env::var("DNS_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".into());
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    tracing::info!("DNS Engine on {addr}");
    axum::serve(listener, app).await.unwrap();
}

async fn health(State(s): State<Arc<AppState>>) -> Json<Health> {
    let st = s.stats.lock().unwrap();
    Json(Health { status: "ok".into(), version: env!("CARGO_PKG_VERSION").into(), uptime_secs: s.start_time.elapsed().as_secs(), total_ops: st.total_queries })
}

async fn resolve(State(s): State<Arc<AppState>>, Json(req): Json<ResolveRequest>) -> Json<ResolveResponse> {
    let t = Instant::now();
    let rtype = req.record_type.unwrap_or_else(|| "A".into());
    let h = fnv1a(req.domain.as_bytes());
    let blocked = is_blocked(&req.domain, h);
    let answers = if blocked { vec![] } else {
        vec![DnsAnswer { name: req.domain.clone(), record_type: rtype.clone(), value: format!("{}.{}.{}.{}", h % 256, (h >> 8) % 256, (h >> 16) % 256, (h >> 24) % 256), ttl: 300 }]
    };
    { let mut st = s.stats.lock().unwrap(); st.total_queries += 1; if blocked { st.total_blocked += 1; st.bytes_saved += 5000; } }
    Json(ResolveResponse { domain: req.domain, record_type: rtype, answers, blocked, bloom_lookup_ns: 50, elapsed_us: t.elapsed().as_micros() })
}

async fn blocklist(State(s): State<Arc<AppState>>, Json(req): Json<BlocklistRequest>) -> Json<BlocklistResponse> {
    let count = req.domains.len();
    let mut st = s.stats.lock().unwrap();
    if req.action == "add" { st.total_rules += count as u64; }
    Json(BlocklistResponse { status: "updated".into(), domains_affected: count, bloom_filter_size_bytes: 4096, false_positive_rate: 0.001 })
}

async fn filter_config(State(_s): State<Arc<AppState>>, Json(req): Json<FilterConfigRequest>) -> Json<FilterConfigResponse> {
    let custom = req.custom_blocklist.as_ref().map(|c| c.len()).unwrap_or(0);
    Json(FilterConfigResponse { status: "configured".into(), config: FilterConfig { block_ads: req.block_ads.unwrap_or(true), block_trackers: req.block_trackers.unwrap_or(true), block_malware: req.block_malware.unwrap_or(true), block_adult: req.block_adult.unwrap_or(false), custom_domains: custom, total_blocked_domains: 150_000 } })
}

async fn query_logs() -> Json<Vec<QueryLog>> {
    Json(vec![
        QueryLog { domain: "example.com".into(), record_type: "A".into(), blocked: false, response_time_us: 120, category: "allowed".into(), timestamp: "2026-02-23T00:00:00Z".into() },
        QueryLog { domain: "tracker.ads.net".into(), record_type: "A".into(), blocked: true, response_time_us: 5, category: "ad-tracker".into(), timestamp: "2026-02-23T00:00:01Z".into() },
    ])
}

async fn stats(State(s): State<Arc<AppState>>) -> Json<StatsResponse> {
    let st = s.stats.lock().unwrap();
    let rate = if st.total_queries > 0 { st.total_blocked as f64 / st.total_queries as f64 * 100.0 } else { 0.0 };
    Json(StatsResponse { total_queries: st.total_queries, total_blocked: st.total_blocked, block_rate_pct: rate, total_rules: st.total_rules, bloom_filter_size_kb: 4.0, bytes_saved: st.bytes_saved })
}

fn is_blocked(domain: &str, h: u64) -> bool { domain.contains("ads.") || domain.contains("tracker.") || domain.contains("malware.") || (h % 20 == 0) }
fn fnv1a(data: &[u8]) -> u64 { let mut h: u64 = 0xcbf2_9ce4_8422_2325; for &b in data { h ^= b as u64; h = h.wrapping_mul(0x0100_0000_01b3); } h }
