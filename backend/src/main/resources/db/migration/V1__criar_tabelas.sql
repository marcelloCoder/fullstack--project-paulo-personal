create table usuario (
    id bigserial primary key,
    nome varchar(120) not null,
    email varchar(180) not null,
    senha_hash varchar(100) not null,
    telefone varchar(20),
    papel varchar(20) not null,
    ativo boolean not null,
    objetivo varchar(200),
    observacao varchar(2000),
    criado_em timestamptz not null,
    constraint uk_usuario_email unique (email)
);

create table ficha (
    id bigserial primary key,
    aluno_id bigint not null references usuario (id),
    titulo varchar(120) not null,
    objetivo varchar(200),
    observacao varchar(2000),
    inicio date not null,
    ativa boolean not null,
    criado_em timestamptz not null,
    atualizado_em timestamptz not null
);

create index idx_ficha_aluno on ficha (aluno_id);
create unique index uk_ficha_uma_ativa on ficha (aluno_id) where ativa;

create table treino (
    id bigserial primary key,
    ficha_id bigint not null references ficha (id) on delete cascade,
    nome varchar(80) not null,
    ordem integer not null,
    observacao varchar(1000)
);

create index idx_treino_ficha on treino (ficha_id);

create table exercicio (
    id bigserial primary key,
    treino_id bigint not null references treino (id) on delete cascade,
    ordem integer not null,
    nome varchar(120) not null,
    series integer not null,
    repeticoes varchar(40) not null,
    carga varchar(80),
    descanso varchar(40)
);

create index idx_exercicio_treino on exercicio (treino_id);
