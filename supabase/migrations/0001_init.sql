-- Camel Cement platform — initial schema
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "pg_trgm";

-- ── Helpers ──────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Human-readable reference numbers, e.g. QT-2026-04321
create sequence if not exists public.reference_seq;
create or replace function public.generate_reference(prefix text)
returns text language sql volatile as $$
  select prefix || '-' || to_char(now(), 'YYYY') || '-' ||
    lpad(nextval('public.reference_seq')::text, 5, '0');
$$;

-- ── Roles and profiles ───────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'analyst' check (role in (
    'super_admin','marketing_admin','sales_manager','sales_officer',
    'technical_officer','hr_admin','customer_support','analyst'
  )),
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true
  );
$$;

-- Auto-create a profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Site settings ─────────────────────────────────────────────────────

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  description text,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- ── Products ─────────────────────────────────────────────────────────

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  grade text not null,
  friendly_name text not null,
  short_description text,
  full_description text,
  classification text,
  bag_size text default '50 kg',
  strength_development text,
  color text,
  hero_image text,
  key_features jsonb not null default '[]',
  applications jsonb not null default '[]',
  storage_guidance text,
  safety_guidance text,
  comparison_values jsonb not null default '{}',
  order_available boolean not null default true,
  active boolean not null default true,
  display_order int not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ── Dealers ──────────────────────────────────────────────────────────

create table public.dealers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  authorised boolean not null default true,
  contact_person text,
  phone text,
  whatsapp text,
  email text,
  region text not null,
  district text,
  address text,
  latitude double precision,
  longitude double precision,
  opening_hours text,
  products jsonb not null default '[]',
  delivery_available boolean not null default false,
  collection_available boolean not null default true,
  notes text,
  active boolean not null default true,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dealers_region_idx on public.dealers (region, district);
create trigger dealers_updated before update on public.dealers
  for each row execute function public.set_updated_at();

-- ── Enquiries ────────────────────────────────────────────────────────

create table public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.generate_reference('EN'),
  enquiry_type text not null,
  full_name text not null,
  company text,
  email text,
  phone text not null,
  region text,
  district text,
  product text,
  message text not null,
  attachment_url text,
  preferred_contact text,
  source_page text,
  utm jsonb,
  status text not null default 'new' check (status in (
    'new','assigned','contacted','waiting_customer','in_progress',
    'resolved','closed','spam'
  )),
  assigned_to uuid references public.profiles (id),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  internal_notes text,
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index enquiries_status_idx on public.contact_enquiries (status, created_at desc);
create trigger enquiries_updated before update on public.contact_enquiries
  for each row execute function public.set_updated_at();

-- ── Quote requests ───────────────────────────────────────────────────

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.generate_reference('QT'),
  customer_type text not null,
  full_name text not null,
  company text,
  phone text not null,
  email text,
  project_type text,
  project_name text,
  region text,
  district text,
  site_address text,
  start_date date,
  delivery_date date,
  fulfilment text check (fulfilment in ('delivery','collection','dealer')),
  notes text,
  calculator_result_id uuid,
  status text not null default 'new' check (status in (
    'new','reviewing','contacted','quotation_prepared','quotation_sent',
    'negotiating','approved','won','lost','closed'
  )),
  assigned_to uuid references public.profiles (id),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quotes_status_idx on public.quote_requests (status, created_at desc);
create trigger quotes_updated before update on public.quote_requests
  for each row execute function public.set_updated_at();

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests (id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  quantity_bags int not null check (quantity_bags > 0),
  created_at timestamptz not null default now()
);

create table public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quote_requests (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ── Orders ───────────────────────────────────────────────────────────

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.generate_reference('OR'),
  full_name text not null,
  company text,
  phone text not null,
  email text,
  fulfilment text not null default 'delivery' check (fulfilment in ('delivery','collection')),
  region text,
  district text,
  site_address text,
  preferred_date date,
  total_bags int not null default 0,
  estimated_weight_kg numeric(12,2) not null default 0,
  notes text,
  status text not null default 'submitted' check (status in (
    'draft','submitted','under_review','price_confirmed','awaiting_approval',
    'approved','payment_pending','processing','ready_for_collection',
    'out_for_delivery','completed','cancelled'
  )),
  assigned_to uuid references public.profiles (id),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_status_idx on public.orders (status, created_at desc);
create trigger orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  quantity_bags int not null check (quantity_bags > 0),
  created_at timestamptz not null default now()
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status text not null,
  note text,
  changed_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ── Calculator ───────────────────────────────────────────────────────

create table public.calculator_sessions (
  id uuid primary key default gen_random_uuid(),
  calculator_type text not null,
  inputs jsonb not null default '{}',
  results jsonb not null default '{}',
  recommended_product text,
  converted_to_quote boolean not null default false,
  created_at timestamptz not null default now()
);
create index calc_sessions_type_idx on public.calculator_sessions (calculator_type, created_at desc);

create table public.calculator_rules (
  id uuid primary key default gen_random_uuid(),
  calculator_type text not null,
  version int not null default 1,
  config jsonb not null default '{}',
  published boolean not null default true,
  approved_by uuid references public.profiles (id),
  effective_from timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (calculator_type, version)
);

-- ── News / posts ─────────────────────────────────────────────────────

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content_md text,
  category text not null,
  author text default 'Camel Cement',
  featured_image text,
  reading_minutes int default 8,
  tags jsonb not null default '[]',
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft','review','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_status_idx on public.posts (status, published_at desc);
create trigger posts_updated before update on public.posts
  for each row execute function public.set_updated_at();

-- ── Projects ─────────────────────────────────────────────────────────

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  location text,
  completion_year int,
  client_name text,
  product_used text,
  challenge text,
  contribution text,
  result_summary text,
  hero_image text,
  gallery jsonb not null default '[]',
  testimonial text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ── Resources / documents ────────────────────────────────────────────

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  product_slug text,
  language text not null default 'en',
  file_url text,
  file_type text,
  file_size_kb int,
  version text,
  description text,
  published_at date,
  expires_at date,
  public boolean not null default true,
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger resources_updated before update on public.resources
  for each row execute function public.set_updated_at();

-- ── Certifications ───────────────────────────────────────────────────

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuing_body text,
  certificate_number text,
  issue_date date,
  expiry_date date,
  badge_image text,
  certificate_file text,
  description text,
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Careers ──────────────────────────────────────────────────────────

create table public.vacancies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  department text not null,
  location text not null,
  employment_type text not null,
  experience_level text,
  description_md text,
  responsibilities jsonb not null default '[]',
  requirements jsonb not null default '[]',
  benefits jsonb not null default '[]',
  posted_at date not null default current_date,
  closes_at date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger vacancies_updated before update on public.vacancies
  for each row execute function public.set_updated_at();

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.generate_reference('JA'),
  vacancy_id uuid references public.vacancies (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  region text,
  current_location text,
  position text,
  work_experience text,
  education_level text,
  cover_letter text,
  cv_url text,
  supporting_url text,
  consent boolean not null default false,
  status text not null default 'new' check (status in (
    'new','screening','shortlisted','interview','assessment',
    'reference_check','offer','hired','rejected','withdrawn'
  )),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger applications_updated before update on public.job_applications
  for each row execute function public.set_updated_at();

create table public.talent_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  areas_of_interest text,
  cv_url text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── AI assistant ─────────────────────────────────────────────────────

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,
  language text default 'en',
  escalated boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('user','assistant','tool')),
  content text not null,
  tool_name text,
  created_at timestamptz not null default now()
);
create index chat_messages_session_idx on public.chat_messages (session_id, created_at);

create table public.chat_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  message_id uuid references public.chat_messages (id) on delete cascade,
  helpful boolean,
  comment text,
  created_at timestamptz not null default now()
);

-- ── FAQ / knowledge ──────────────────────────────────────────────────

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Misc ─────────────────────────────────────────────────────────────

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  consented_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  properties jsonb not null default '{}',
  path text,
  visitor_id text,
  created_at timestamptz not null default now()
);
create index analytics_event_idx on public.analytics_events (event, created_at desc);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id text,
  before_data jsonb,
  after_data jsonb,
  ip text,
  user_agent text,
  success boolean not null default true,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs (entity, created_at desc);

-- ── Row Level Security ───────────────────────────────────────────────
-- Public users read only published/active content. Public submissions go
-- through validated server routes using the service role. Staff access is
-- gated by profiles. The service role bypasses RLS by design.

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.products enable row level security;
alter table public.dealers enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_status_history enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.calculator_sessions enable row level security;
alter table public.calculator_rules enable row level security;
alter table public.posts enable row level security;
alter table public.projects enable row level security;
alter table public.resources enable row level security;
alter table public.certifications enable row level security;
alter table public.vacancies enable row level security;
alter table public.job_applications enable row level security;
alter table public.talent_profiles enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_feedback enable row level security;
alter table public.faqs enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.analytics_events enable row level security;
alter table public.audit_logs enable row level security;

-- Staff: full access to operational tables
create policy staff_all_profiles on public.profiles
  for all using (public.is_staff()) with check (public.is_staff());
create policy own_profile_read on public.profiles
  for select using (id = auth.uid());
create policy staff_all_settings on public.site_settings
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_products on public.products
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_dealers on public.dealers
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_enquiries on public.contact_enquiries
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_quotes on public.quote_requests
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_quote_items on public.quote_items
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_quote_history on public.quote_status_history
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_orders on public.orders
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_order_items on public.order_items
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_order_history on public.order_status_history
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_calc_sessions on public.calculator_sessions
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_calc_rules on public.calculator_rules
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_posts on public.posts
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_projects on public.projects
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_resources on public.resources
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_certs on public.certifications
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_vacancies on public.vacancies
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_applications on public.job_applications
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_talent on public.talent_profiles
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_chat_sessions on public.chat_sessions
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_chat_messages on public.chat_messages
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_chat_feedback on public.chat_feedback
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_faqs on public.faqs
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_newsletter on public.newsletter_subscribers
  for all using (public.is_staff()) with check (public.is_staff());
create policy staff_all_analytics on public.analytics_events
  for select using (public.is_staff());
create policy staff_read_audit on public.audit_logs
  for select using (public.is_staff());

-- Anonymous: read-only access to published public content
create policy public_read_products on public.products
  for select using (active = true);
create policy public_read_dealers on public.dealers
  for select using (active = true);
create policy public_read_posts on public.posts
  for select using (status = 'published');
create policy public_read_projects on public.projects
  for select using (published = true);
create policy public_read_resources on public.resources
  for select using (public = true);
create policy public_read_certs on public.certifications
  for select using (active = true);
create policy public_read_vacancies on public.vacancies
  for select using (published = true);
create policy public_read_faqs on public.faqs
  for select using (published = true);
create policy public_read_calc_rules on public.calculator_rules
  for select using (published = true);

-- ── Storage buckets ──────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('public-documents', 'public-documents', true),
  ('applications', 'applications', false)
on conflict (id) do nothing;

create policy staff_manage_media on storage.objects
  for all using (bucket_id in ('public-media','public-documents') and public.is_staff())
  with check (bucket_id in ('public-media','public-documents') and public.is_staff());
create policy public_read_media on storage.objects
  for select using (bucket_id in ('public-media','public-documents'));
create policy staff_read_applications on storage.objects
  for select using (bucket_id = 'applications' and public.is_staff());
