const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const palavraSecreta = require('../jwt_secreto');
const { usuarioComEmail } = require('../uteis/validacoes');

const login = async (req, res) => {
  let { email, senha } = req.body;

  if (!email) {
    return res.status(400).json({ messagem: 'O email não foi informado' });
  }
  if (!senha) {
    return res.status(400).json({ messagem: 'A senha não foi informado' });
  }

  try {
    let usuario = await usuarioComEmail(email);
    if (!usuario) {
      return res.status(400).json({ messagem: 'Usuário e/ou senha inválido(s).' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.json({ messagem: 'Usuário e/ou senha inválido(s).' });
    }
    let { senha: segredo, ...dadosUsuario } = usuario;

    let token = jwt.sign(
      {
        dadosUsuario
      },
      palavraSecreta,
      { expiresIn: '2h' }
    );
    return res.status(200).json({
      usuario: dadosUsuario,
      token
    });
  } catch (error) {
    return res.status(400).json({ menssagem: error.message });
  }
}

module.exports = { login }

