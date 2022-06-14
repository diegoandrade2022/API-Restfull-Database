CREATE DATABASE dindin;


CREATE TABLE IF NOT EXISTS usuarios (
  id serial primary key,
  nome varchar(50) not null,
  email varchar(50) not null unique,
  senha text not null
);

CREATE TABLE IF NOT EXISTS categorias (
  id serial primary key,
  descricao text not null
);

CREATE TABLE IF NOT EXISTS transacoes (
  id serial primary key,
  descricao text not null,
  valor int not null,
  data date not null,
  categoria_id int not null,
  usuario_id int not null,
  tipo varchar(7) check (tipo = 'entrada' or tipo = 'saida') not null,
  CONSTRAINT fk_transacoes_categorias 
  foreign key (categoria_id) references categorias(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE,
  CONSTRAINT fk_transacoes_usuarios 
  foreign key (usuario_id) references usuarios(id)
  ON DELETE CASCADE 
  ON UPDATE CASCADE
);

INSERT INTO categorias (
  descricao)
VALUES 
('Alimentação'), ('Assinaturas e Serviços'), ('Casa'),
('Mercado'), ('Cuidados Pessoais'), ('Educação'),
('Família'), ('Lazer'), ('Pets'), ('Presentes'),
('Roupas'), ('Saúde'), ('Transporte'), ('Salário'), 
('Vendas'), ('Outras Receitas'), ('Outras Despesas')


