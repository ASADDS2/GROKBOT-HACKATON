-- padrón y hechos de GOTA (schema congelado)
create table if not exists barrios (
  id            text primary key,
  nombre        text not null,
  municipio     text not null,
  comuna        text,
  lat           double precision not null,
  lng           double precision not null,
  personas_est  integer not null,
  es_albergue   boolean default false,
  via_abierta   boolean default true,
  alias         text[] default '{}'
);

create table if not exists reportes (
  id                uuid primary key default gen_random_uuid(),
  barrio_id         text references barrios(id),
  canal             text not null,
  texto_crudo       text not null,
  dias_sin_agua     integer,
  personas          integer,
  sintomas          text[] default '{}',
  casos             integer default 0,
  confianza         numeric(3,2),
  necesita_revision boolean default false,
  sesion_id         text,
  created_at        timestamptz default now()
);

create table if not exists entregas (
  id             uuid primary key default gen_random_uuid(),
  barrio_id      text references barrios(id),
  carrotanque    text,
  litros         integer,
  confirmada_por text,
  created_at     timestamptz default now()
);

create table if not exists rutas (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null,
  carrotanque text not null,
  paradas     jsonb not null,
  estado      text default 'planificada'
);

create table if not exists alertas_salud (
  id            uuid primary key default gen_random_uuid(),
  barrio_id     text references barrios(id),
  sintoma       text not null,
  casos_72h     integer not null,
  linea_base    numeric,
  severidad     text,
  created_at    timestamptz default now()
);

create or replace view indice_sed as
with ultima_entrega as (
  select barrio_id, max(created_at) as ultima
  from entregas
  group by barrio_id
),
ultimo_reporte as (
  select barrio_id, max(created_at) as ultimo
  from reportes
  where barrio_id is not null
  group by barrio_id
),
diarrea_72h as (
  select barrio_id
  from reportes
  where created_at >= now() - interval '72 hours'
    and 'diarrea' = any (sintomas)
  group by barrio_id
)
select
  b.id,
  b.nombre,
  b.municipio,
  b.lat,
  b.lng,
  b.es_albergue,
  b.via_abierta,
  greatest(
    0,
    floor(
      extract(
        epoch from (
          now() - coalesce(ue.ultima, ur.ultimo, now())
        )
      ) / 86400
    )
  )::integer as dias_sin_agua,
  b.personas_est as personas,
  (
    1.0
    + case when b.es_albergue then 0.5 else 0 end
    + case when b.via_abierta = false then 0.4 else 0 end
    + case when d.barrio_id is not null then 0.6 else 0 end
  ) as vulnerabilidad,
  (
    greatest(
      0,
      floor(
        extract(
          epoch from (
            now() - coalesce(ue.ultima, ur.ultimo, now())
          )
        ) / 86400
      )
    )::double precision
    * ln(1 + b.personas_est)
    * (
      1.0
      + case when b.es_albergue then 0.5 else 0 end
      + case when b.via_abierta = false then 0.4 else 0 end
      + case when d.barrio_id is not null then 0.6 else 0 end
    )
  ) as indice_sed,
  case
    when greatest(
      0,
      floor(
        extract(
          epoch from (
            now() - coalesce(ue.ultima, ur.ultimo, now())
          )
        ) / 86400
      )
    ) <= 1 then 0
    when greatest(
      0,
      floor(
        extract(
          epoch from (
            now() - coalesce(ue.ultima, ur.ultimo, now())
          )
        ) / 86400
      )
    ) <= 3 then 1
    when greatest(
      0,
      floor(
        extract(
          epoch from (
            now() - coalesce(ue.ultima, ur.ultimo, now())
          )
        ) / 86400
      )
    ) <= 5 then 2
    else 3
  end as paso_escala
from barrios b
left join ultima_entrega ue on ue.barrio_id = b.id
left join ultimo_reporte ur on ur.barrio_id = b.id
left join diarrea_72h d on d.barrio_id = b.id;
