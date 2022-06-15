const { query } = require('../bancodedados/conexao');
const { usuarioComEmail, retornaHash } = require('../uteis/validacoes');


const cadastrarUsuario = async (req, res) => {
  let { nome, email, senha } = req.body

  if (!nome) {
    return res.status(400).json({ messagem: 'O nome não foi informado' })
  }
  if (!email) {
    return res.status(400).json({ messagem: 'O email não foi informado' })
  }
  if (!senha) {
    return res.status(400).json({ messagem: 'A senha não foi informado' })
  }

  try {
    if (await usuarioComEmail(email)) {
      return res.status(400).json({ messagem: 'Já existe usuário cadastrado com o e-mail informado' });
    }
  } catch (error) {
    return res.status(400).json({ messagem: error.message });
  }

  try {
    const hash = await retornaHash(senha);
    const usuario = await query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2,$3) RETURNING *',
      [nome, email, hash]
    );

    if (usuario.rowCount <= 0) {
      return res.status(400).json({ messagem: 'Usuario não cadastrado' });
    }

    let { senha: segredo, ...cadastro } = usuario.rows[0];

    return res.status(201).json(cadastro);
  } catch (error) {
    return res.status(400).json({ messagem: error.message });
  }
}

const consultarUsuario = async (req, res) => {
  return res.status(200).json(req.logado);
}

const atualizarUsuario = async (req, res) => {
  let { logado } = req;

  let { nome, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json({ messagem: 'O nome não foi informado' });
  }
  if (!email) {
    return res.status(400).json({ messagem: 'O email não foi informado' });
  }
  if (!senha) {
    return res.status(400).json({ messagem: 'A senha não foi informado' });
  }

  try {
    let emailExistente = await usuarioComEmail(email);
    if (emailExistente && emailExistente.id !== logado.id) {
      return res.status(400).json({
        messagem: 'Já existe usuário cadastrado com o e-mail informado'
      });
    }
  } catch (error) {
    return res.status(400).json({ messagem: error.message });
  }

  try {
    const hash = await retornaHash(senha);
    const usuario = await query(
      'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4',
      [nome, email, hash, logado.id]
    );

    if (usuario.rowCount <= 0) {
      return res.status(400).json({ messagem: 'Usuario não cadastrado' });
    }

    return res.status(204).json();

  } catch (error) {
    return res.status(400).json({ messagem: error.message });
  }
}

module.exports = {
  cadastrarUsuario,
  consultarUsuario,
  atualizarUsuario
}

