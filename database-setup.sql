-- Create User table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MEMBER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    profile_photo TEXT,
    fcm_token TEXT,
    two_factor_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ActivityRequest table
CREATE TABLE activity_requests (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_time TEXT NOT NULL,
    expected_attendance INTEGER NOT NULL,
    organiser_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    attachment_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    submitted_by_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (submitted_by_id) REFERENCES users(id)
);

-- Create Activity table
CREATE TABLE activities (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    venue TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UPCOMING',
    request_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (request_id) REFERENCES activity_requests(id)
);

-- Create AttendedEvent table
CREATE TABLE attended_events (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id TEXT UNIQUE NOT NULL,
    date_attended TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT NOT NULL,
    participant_count INTEGER NOT NULL,
    notes TEXT,
    photos TEXT[] DEFAULT '{}',
    logged_by_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (activity_id) REFERENCES activities(id),
    FOREIGN KEY (logged_by_id) REFERENCES users(id)
);

-- Create Notification table
CREATE TABLE notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create AuditLog table
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    description TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create PasswordResetToken table
CREATE TABLE password_reset_tokens (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RefreshToken table
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_activity_requests_status ON activity_requests(status);
CREATE INDEX idx_activity_requests_event_date ON activity_requests(event_date);
CREATE INDEX idx_activity_requests_submitted_by_id ON activity_requests(submitted_by_id);

CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_event_date ON activities(event_date);

CREATE INDEX idx_attended_events_date_attended ON attended_events(date_attended);
CREATE INDEX idx_attended_events_venue ON attended_events(venue);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens(email);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
