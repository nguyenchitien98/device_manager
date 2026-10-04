-- ================================================================
-- Flyway V13: Align approval_requests & approval_steps Schema
-- ================================================================

DO $$
BEGIN
    -- approval_requests
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_requests' AND column_name='requester_id') THEN
        ALTER TABLE approval_requests RENAME COLUMN requester_id TO creator_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_requests' AND column_name='current_level') THEN
        ALTER TABLE approval_requests RENAME COLUMN current_level TO current_step;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_requests' AND column_name='total_levels') THEN
        ALTER TABLE approval_requests RENAME COLUMN total_levels TO total_steps;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_requests' AND column_name='reason') THEN
        ALTER TABLE approval_requests RENAME COLUMN reason TO note;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_requests' AND column_name='title') THEN
        ALTER TABLE approval_requests DROP COLUMN title;
    END IF;

    -- approval_steps
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_steps' AND column_name='approval_request_id') THEN
        ALTER TABLE approval_steps RENAME COLUMN approval_request_id TO approval_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_steps' AND column_name='step_level') THEN
        ALTER TABLE approval_steps RENAME COLUMN step_level TO step_number;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_steps' AND column_name='action') THEN
        ALTER TABLE approval_steps RENAME COLUMN action TO status;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_steps' AND column_name='comments') THEN
        ALTER TABLE approval_steps RENAME COLUMN comments TO comment;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='approval_steps' AND column_name='acted_at') THEN
        ALTER TABLE approval_steps RENAME COLUMN acted_at TO action_at;
    END IF;
END $$;
