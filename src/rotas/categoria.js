const express = require('express');

const { listarCategorias } = require('../controladores/categoria');
const { validacaoToken } = require('../intermediarios/validacaotoken');

const rotas = express();

rotas.use(validacaoToken);
rotas.get('/', listarCategorias);

module.exports = rotas;

