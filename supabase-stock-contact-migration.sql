-- Add supplier contact fields without modifying existing stock records.
alter table public.stock_movements
  add column if not exists contact_person text;

alter table public.stock_movements
  add column if not exists contact_number text;
