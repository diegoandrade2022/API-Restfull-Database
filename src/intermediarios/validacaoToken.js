const jwt = require('jsonwebtoken');

const palavraSecreta = require('../jwt_secreto');
const { query } = require('../bancodedados/conexao');

const validacaoToken = async (req, res, next) => {
    const { authorization: autorizacao } = req.headers;

    if (!autorizacao) {
        return res.status(401).json({ messagem: 'O usuário deve está logado' });
    }

    try {
        let token = autorizacao.replace('Bearer ', "").trim();

        let { dadosUsuario } = jwt.verify(token, palavraSecreta);

        console.log(`O usuário ${dadosUsuario.nome} está utilizando o sistema`);

        let { rows, rowCount } = await query('SELECT * FROM usuarios WHERE id = $1', [dadosUsuario.id]);

        if (rowCount <= 0) {
            return res.status(401).json({ messagem: 'Sem autorização' });
        }

        let usuario = rows[0];
        req.logado = usuario;

        next();

    } catch (error) {

        if (error.message === 'invalid signature') {
            return res.status(400).json({ messagem: 'O usuário deve passar um token válido.' });
        }
        if (error.message === 'jwt malformed') {
            return res.status(400).json({ messagem: 'O token deve ser informado.' });
        }
        if (error.message === 'jwt expired') {
            return res.status(400).json({ messagem: 'O token expirou, adicione um novo' });
        }

        return res.status(400).json({ messagem: error.message });
    }

}

module.exports = { validacaoToken }
