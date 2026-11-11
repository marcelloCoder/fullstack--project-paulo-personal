alter table usuario add column peso_kg numeric(5, 1);

alter table usuario add constraint ck_usuario_peso_kg
    check (peso_kg is null or (peso_kg >= 1 and peso_kg <= 500));
