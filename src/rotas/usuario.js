const express = require('express');
const rotas = express();

const { cadastrarUsuario, consultarUsuario, atualizarUsuario } = require('../controladores/usuario');
const { validacaoToken } = require('../intermediarios/validacaotoken');

rotas.post('/', cadastrarUsuario);

rotas.use(validacaoToken);

rotas.get('/', consultarUsuario);
rotas.put('/', atualizarUsuario);


module.exports = rotas
