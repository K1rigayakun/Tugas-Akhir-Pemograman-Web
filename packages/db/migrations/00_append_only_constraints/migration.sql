-- ============================================================
-- Emerald Kingdom — Database Constraints
-- ============================================================
-- Constraint untuk mencegah UPDATE dan DELETE pada tabel
-- wallet_transactions dan audit_logs.
-- Ini adalah aturan kritis — kedua tabel ini APPEND ONLY.
-- ============================================================

-- Trigger: Cegah UPDATE pada wallet_transactions
CREATE OR REPLACE FUNCTION prevent_wallet_tx_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE pada wallet_transactions tidak diperbolehkan. Tabel ini append-only.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_wallet_tx_update
  BEFORE UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_wallet_tx_update();

-- Trigger: Cegah DELETE pada wallet_transactions
CREATE OR REPLACE FUNCTION prevent_wallet_tx_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DELETE pada wallet_transactions tidak diperbolehkan. Tabel ini append-only.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_wallet_tx_delete
  BEFORE DELETE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_wallet_tx_delete();

-- Trigger: Cegah UPDATE pada audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'UPDATE pada audit_logs tidak diperbolehkan. Tabel ini append-only.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_log_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_update();

-- Trigger: Cegah DELETE pada audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'DELETE pada audit_logs tidak diperbolehkan. Tabel ini append-only.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_log_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_delete();
