
-- Priority 5: Organizations & Firm accounts
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  subscription_tier TEXT DEFAULT 'firm'
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orgs" ON organizations FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "Users can create orgs" ON organizations FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own orgs" ON organizations FOR UPDATE USING (created_by = auth.uid());

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'drafter',
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  invited_by UUID,
  UNIQUE(org_id, user_id)
);
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own org members" ON org_members FOR SELECT USING (auth.uid() = user_id OR org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners can insert members" ON org_members FOR INSERT WITH CHECK (auth.uid() = invited_by OR auth.uid() = user_id);
CREATE POLICY "Members can update own" ON org_members FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE pe_review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  calculation_id UUID NOT NULL,
  calculation_type TEXT NOT NULL,
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT
);
ALTER TABLE pe_review_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view queue" ON pe_review_queue FOR SELECT USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "Users can submit to queue" ON pe_review_queue FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- Priority 7: Revision history
ALTER TABLE wind_calculations ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE wind_calculations ADD COLUMN IF NOT EXISTS version_notes TEXT;

ALTER TABLE fastener_calculations ADD COLUMN IF NOT EXISTS version_notes TEXT;

CREATE TABLE calculation_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculation_id UUID NOT NULL,
  calculation_type TEXT NOT NULL,
  version INTEGER NOT NULL,
  inputs_json JSONB NOT NULL,
  results_json JSONB,
  saved_at TIMESTAMPTZ DEFAULT now(),
  saved_by UUID,
  notes TEXT
);
ALTER TABLE calculation_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own revisions" ON calculation_revisions FOR SELECT USING (auth.uid() = saved_by);
CREATE POLICY "Users can create revisions" ON calculation_revisions FOR INSERT WITH CHECK (auth.uid() = saved_by);
