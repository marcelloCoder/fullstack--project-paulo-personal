alter table horario_agenda
    alter column dia_semana type integer using dia_semana::integer;
