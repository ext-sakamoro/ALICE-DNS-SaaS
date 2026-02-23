-- ALICE DNS: Domain-specific tables
CREATE TABLE IF NOT EXISTS dns_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    block_ads BOOLEAN NOT NULL DEFAULT true,
    block_trackers BOOLEAN NOT NULL DEFAULT true,
    block_malware BOOLEAN NOT NULL DEFAULT true,
    block_adult BOOLEAN NOT NULL DEFAULT false,
    custom_blocklist TEXT[] NOT NULL DEFAULT '{}',
    custom_allowlist TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dns_query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES dns_configs(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    record_type TEXT NOT NULL DEFAULT 'A',
    blocked BOOLEAN NOT NULL DEFAULT false,
    category TEXT,
    response_time_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dns_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID NOT NULL REFERENCES dns_configs(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    total_queries BIGINT NOT NULL DEFAULT 0,
    blocked_queries BIGINT NOT NULL DEFAULT 0,
    avg_response_us BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_dns_configs_user ON dns_configs(user_id);
CREATE INDEX idx_dns_query_logs_config ON dns_query_logs(config_id, created_at);
CREATE INDEX idx_dns_metrics_config ON dns_metrics(config_id, period_start);
