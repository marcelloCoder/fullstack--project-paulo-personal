alter table horario_agenda
    drop constraint if exists horario_agenda_horario_check;

alter table horario_agenda
    alter column horario type varchar(5)
    using to_char(horario, 'HH24:MI');

alter table horario_agenda
    add constraint horario_agenda_horario_check check (
        horario ~ '^(0[6-9]|1[0-9]|20|21):[03]0$'
        and horario >= '06:00'
        and horario <= '21:00'
    );
