-- Testimonials and media gallery, both manageable from the admin dashboard.

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  company text,
  quote text not null,
  rating numeric(2,1) not null default 5 check (rating >= 1 and rating <= 5),
  source text not null default 'google' check (source in ('google','direct')),
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger testimonials_updated before update on public.testimonials
  for each row execute function public.set_updated_at();

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('image','video')),
  src text not null,
  poster text,
  category text not null default 'General',
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;
alter table public.gallery_items enable row level security;

create policy staff_all_testimonials on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());
create policy public_read_testimonials on public.testimonials
  for select using (published = true);
create policy staff_all_gallery on public.gallery_items
  for all using (public.is_staff()) with check (public.is_staff());
create policy public_read_gallery on public.gallery_items
  for select using (published = true);
