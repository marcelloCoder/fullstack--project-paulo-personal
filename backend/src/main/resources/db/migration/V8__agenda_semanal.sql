create table horario_agenda (
    dia_semana smallint not null,
    horario time not null,
    disponivel boolean not null default true,
    constraint horario_agenda_dia_check check (dia_semana between 1 and 5),
    constraint horario_agenda_horario_check check (
        horario >= time '06:00'
        and horario <= time '21:00'
        and extract(minute from horario) in (0, 30)
    ),
    primary key (dia_semana, horario)
);

insert into horario_agenda (dia_semana, horario, disponivel)
select
    dia.n,
    (time '06:00' + (slot.n * interval '30 minutes'))::time,
    true
from generate_series(1, 5) as dia(n)
cross join generate_series(0, 30) as slot(n);
