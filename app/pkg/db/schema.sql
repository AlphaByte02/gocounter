CREATE TABLE
    groups (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

CREATE TABLE
    users (
        id UUID PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

CREATE TABLE
    group_users (
        user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        group_id UUID NOT NULL REFERENCES groups (id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        PRIMARY KEY (user_id, group_id)
    );

CREATE INDEX idx_user_groups_user_id ON group_users (user_id);

CREATE INDEX idx_user_groups_group_id ON group_users (group_id);

CREATE TABLE
    counters (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users (id) ON DELETE CASCADE,
        name TEXT NOT NULL UNIQUE,
        soft_reset TIMESTAMPTZ DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

CREATE INDEX idx_counters_soft_reset ON counters (soft_reset);

CREATE INDEX idx_counters_user_id ON counters (user_id);

CREATE TABLE
    data (
        id UUID PRIMARY KEY,
        counter_id UUID NOT NULL REFERENCES counters (id) ON DELETE CASCADE,
        value INTEGER NOT NULL,
        recorded_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

CREATE INDEX idx_data_recorded_at ON data (recorded_at);

CREATE INDEX idx_data_counter_id ON data (counter_id);
