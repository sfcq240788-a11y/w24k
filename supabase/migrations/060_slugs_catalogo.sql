begin;

create or replace function public.generar_slug_catalogo()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := trim(both '-' from regexp_replace(
      lower(translate(new.nombre, 'ÁÉÍÓÚáéíóúÑñÜü', 'AEIOUaeiouNnUu')),
      '[^a-z0-9]+', '-', 'g'));
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tipos_pieza', 'metales', 'piedras'] loop
    execute format('alter table public.%I add column if not exists slug text', t);
    execute format($f$update public.%I set slug = trim(both '-' from regexp_replace(
      lower(translate(nombre, 'ÁÉÍÓÚáéíóúÑñÜü', 'AEIOUaeiouNnUu')),
      '[^a-z0-9]+', '-', 'g'))$f$, t);
    execute format('alter table public.%I alter column slug set not null', t);
    if to_regclass(format('public.%I', t || '_slug_key')) is null then
      execute format('alter table public.%I add constraint %I unique (slug)', t, t || '_slug_key');
    end if;
    execute format('drop trigger if exists %I on public.%I', t || '_slug', t);
    execute format('create trigger %I before insert on public.%I for each row execute function public.generar_slug_catalogo()', t || '_slug', t);
  end loop;
end $$;

alter table public.tipos_pieza add column if not exists nombre_plural text;
update public.tipos_pieza set nombre_plural = case nombre
  when 'Anillo' then 'Anillos' when 'Arete' then 'Aretes'
  when 'Broche' then 'Broches' when 'Collar' then 'Collares'
  when 'Pulsera' then 'Pulseras' else nombre_plural end;

commit;
