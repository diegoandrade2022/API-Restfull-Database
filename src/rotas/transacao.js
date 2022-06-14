const express = require('express');

const {
  listarTransacoes,
  listarTransacaoPorId,
  cadastrarTransacao,
  atualizarTransacao,
  deletarTransacao,
  demonstrarExtrato
} = require('../controladores/transacao');
const { validacaoToken } = require('../intermediarios/validacaotoken');

const rotas = express();

rotas.use(validacaoToken);
rotas.get('/', listarTransacoes);
rotas.get('/extrato', demonstrarExtrato);
rotas.get('/:id', listarTransacaoPorId);
rotas.post('/', cadastrarTransacao);
rotas.put('/:id', atualizarTransacao);
rotas.delete('/:id', deletarTransacao);

module.exports = rotas
