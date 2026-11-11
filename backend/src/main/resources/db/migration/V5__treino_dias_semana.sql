create table treino_dia_semana (
    treino_id bigint not null references treino (id) on delete cascade,
    dia_semana smallint not null,
    constraint treino_dia_semana_dia_check check (dia_semana between 0 and 6),
    primary key (treino_id, dia_semana)
);

create index treino_dia_semana_treino_idx on treino_dia_semana (treino_id);
