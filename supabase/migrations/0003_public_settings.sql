-- Allow the public site to read whitelisted, non-sensitive settings
-- (retail price, announcement copy, public contact details).

create policy public_read_public_settings on public.site_settings
  for select using (
    key in ('cement_price_tzs', 'announcement_bar', 'sales_phone', 'sales_email')
  );
