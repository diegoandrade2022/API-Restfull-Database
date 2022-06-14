const express = require('express');

const usuario = require('./rotas/usuario');
const login = require('./rotas/login');
const transacao = require('./rotas/transacao');
const categoria = require('./rotas/categoria');

const app = express();

app.use(express.json());

app.use('/usuario', usuario);
app.use('/login', login);
app.use('/transacao', transacao);
app.use('/categoria', categoria);

app.listen(3000, () => {
    console.log('Servidor rodando na porta http://localhost:3000');
});
