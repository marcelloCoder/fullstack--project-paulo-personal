alter table exercicio
    add column observacao varchar(500),
    add column carga_kg numeric(8, 2),
    add column descanso_segundos integer;

-- Converte repetições antigas (ex.: "8-12") para o primeiro número inteiro.
alter table exercicio
    alter column repeticoes type integer
    using greatest(
        1,
        coalesce(
            nullif(regexp_replace(split_part(repeticoes, '-', 1), '[^0-9]', '', 'g'), '')::integer,
            10
        )
    );

-- Extrai kg de textos como "20 kg", "20kg". Valores sem número viram 0 (peso corporal).
update exercicio
set carga_kg = coalesce(
    nullif(
        regexp_replace(replace(coalesce(carga, ''), ',', '.'), '[^0-9.]', '', 'g'),
        ''
    )::numeric,
    0
);

-- Extrai segundos de "90 s", "90s" ou converte minutos ("2 min" -> 120).
update exercicio
set descanso_segundos = case
    when coalesce(descanso, '') ~* 'min' then
        greatest(
            1,
            coalesce(nullif(regexp_replace(descanso, '[^0-9]', '', 'g'), '')::integer, 1) * 60
        )
    else
        greatest(
            1,
            coalesce(nullif(regexp_replace(coalesce(descanso, ''), '[^0-9]', '', 'g'), '')::integer, 60)
        )
end;

alter table exercicio
    alter column carga_kg set not null,
    alter column descanso_segundos set not null;

alter table exercicio
    drop column carga,
    drop column descanso;
