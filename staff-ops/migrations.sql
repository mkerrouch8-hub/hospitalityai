-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hotels table (each subscription)
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  city VARCHAR(255),
  role VARCHAR(50) DEFAULT 'manager',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_plan VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email)
);

-- Staff members table (isolated per hotel)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff', -- manager, housekeeper, maintenance, chef, etc.
  status VARCHAR(50) DEFAULT 'active',
  phone VARCHAR(20),
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hotel_id, email)
);

-- Tasks table (isolated per hotel)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily briefings table (isolated per hotel)
CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(hotel_id, date)
);

-- Incidents table (isolated per hotel)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) DEFAULT 'normal', -- low, normal, high, critical
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved
  reported_by UUID REFERENCES staff(id),
  assigned_to UUID REFERENCES staff(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity logs for audit (isolated per hotel)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Hotels: Users can only see their own hotel
CREATE POLICY hotels_user_policy ON hotels
  FOR SELECT
  USING (auth.uid() = user_id);

-- Staff: Users can only see staff from their hotel(s)
CREATE POLICY staff_hotel_policy ON staff
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );

-- Tasks: Users can only see tasks from their hotel(s)
CREATE POLICY tasks_hotel_policy ON tasks
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );

-- Briefings: Users can only see briefings from their hotel(s)
CREATE POLICY briefings_hotel_policy ON briefings
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );

-- Incidents: Users can only see incidents from their hotel(s)
CREATE POLICY incidents_hotel_policy ON incidents
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );

-- Activity logs: Users can only see logs from their hotel(s)
CREATE POLICY activity_logs_hotel_policy ON activity_logs
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT id FROM hotels WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_hotels_user_id ON hotels(user_id);
CREATE INDEX idx_staff_hotel_id ON staff(hotel_id);
CREATE INDEX idx_tasks_hotel_id ON tasks(hotel_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_briefings_hotel_id ON briefings(hotel_id);
CREATE INDEX idx_incidents_hotel_id ON incidents(hotel_id);
CREATE INDEX idx_activity_logs_hotel_id ON activity_logs(hotel_id);
