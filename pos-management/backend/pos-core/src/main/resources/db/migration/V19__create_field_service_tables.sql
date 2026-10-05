-- Migration V19: Field Service CRM & Maintenance Ticket System Schema

-- 1. Maintenance Tickets Table
CREATE TABLE maintenance_tickets (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number     VARCHAR(50) NOT NULL UNIQUE,
    merchant_id       UUID        REFERENCES merchants(id),
    terminal_id       UUID        REFERENCES terminal_ids(id),
    device_id         UUID        REFERENCES devices(id),
    issue_type        VARCHAR(50) NOT NULL DEFAULT 'HARDWARE', -- HARDWARE, SOFTWARE, PAPER, SIM, REPLACEMENT
    priority          VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',  -- LOW, MEDIUM, HIGH, URGENT
    status            VARCHAR(30) NOT NULL DEFAULT 'OPEN',    -- OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED
    description       TEXT,
    technician_id     UUID        REFERENCES users(id),
    resolution_notes  TEXT,
    handover_doc_url  VARCHAR(500),
    version           BIGINT      NOT NULL DEFAULT 0,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ticket Activities Audit Trail
CREATE TABLE ticket_activities (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id    UUID        NOT NULL REFERENCES maintenance_tickets(id),
    actor_id     UUID        REFERENCES users(id),
    action       VARCHAR(100) NOT NULL,
    comment      TEXT,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tickets_number ON maintenance_tickets(ticket_number);
CREATE INDEX idx_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_tickets_merchant ON maintenance_tickets(merchant_id);
CREATE INDEX idx_tickets_technician ON maintenance_tickets(technician_id);
