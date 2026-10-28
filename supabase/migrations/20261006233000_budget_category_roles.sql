-- Per-user need / want / leave-out choice. Built-in and custom category ids.
CREATE TABLE IF NOT EXISTS budget_category_roles (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id TEXT        NOT NULL,
  role        TEXT        NOT NULL CHECK (role IN ('need', 'want', 'out')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, category_id)
);

ALTER TABLE budget_category_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own category roles"
  ON budget_category_roles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
