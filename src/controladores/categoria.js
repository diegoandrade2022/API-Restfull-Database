const { query } = require('../bancodedados/conexao');

const listarCategorias = async (req, res) => {

    try {
        let categorias = await query('SELECT * FROM categorias')
        return res.status(200).json(categorias.rows)
    } catch (error) {
        return res.status(400).json({ messagem: error.message })
    }
}

module.exports = {
    listarCategorias
}

