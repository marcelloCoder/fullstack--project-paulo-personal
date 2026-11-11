alter table usuario add column idade integer;
alter table usuario add column profissao varchar(120);
alter table usuario add column altura_m numeric(3, 2);

alter table usuario add constraint ck_usuario_idade
    check (idade is null or (idade >= 1 and idade <= 120));

alter table usuario add constraint ck_usuario_altura_m
    check (altura_m is null or (altura_m >= 0.50 and altura_m <= 2.50));
