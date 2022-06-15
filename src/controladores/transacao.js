const { query } = require('../bancodedados/conexao')
const { existeCategoria, transacaoExiste } = require('../uteis/validacoes')

const listarTransacoes = async (req, res) => {
  let { logado } = req
  let { filtro } = req.query;

  if (filtro && !Array.isArray(filtro)) {
    return res.status(400).json({ messagem: 'O filtro tem que ser um array' })
  }

  try {
    let ilike = '';
    let arrayFiltro;

    if (filtro) {
      arrayFiltro = filtro.map(f => `%${f}%`);
      ilike += `AND c.descricao ILIKE ANY($2)`;
    }

    const transacoesQuery = `SELECT t.*, c.descricao as categoria_nome FROM transacoes t 
    LEFT JOIN categorias c ON t.categoria_id = c.id 
    WHERE t.usuario_id = $1 
    ${ilike}`;

    const existeFiltro = filtro ? [logado.id, arrayFiltro] : [logado.id];

    const { rows: transacoes } = await query(transacoesQuery, existeFiltro);

    return res.status(200).json(transacoes)
  } catch (error) {
    return res.status(400).json({ messagem: error.message })
  }
}

const listarTransacaoPorId = async (req, res) => {
  let { logado } = req
  let { id } = req.params

  try {
    let { rows: transacoes, rowCount } = await query(
      `SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, 
      c.descricao as nome_categoria FROM transacoes t 
      JOIN categorias c ON t.categoria_id = c.id 
      WHERE t.usuario_id = $1 and t.id = $2`,
      [logado.id, id]
    )

    if (rowCount <= 0) {
      return res.status(404).json({
        messagem: 'Transação não encontrada'
      })
    }
    return res.status(200).json(transacoes)
  } catch (error) {
    return res.status(400).json({ messagem: error.message })
  }
}

const cadastrarTransacao = async (req, res) => {
  let { descricao, valor, data, categoria_id, tipo } = req.body
  let { logado } = req

  if (!descricao) {
    return res.status(400).json({ messagem: 'A descrição não foi informada' })
  }
  if (!valor) {
    return res.status(400).json({ messagem: 'O valor não foi informado' })
  }
  if (!data) {
    return res.status(400).json({ messagem: 'A data não foi informada' })
  }
  if (!categoria_id) {
    return res.status(400).json({ messagem: 'A categoria não foi informada' })
  }
  if (!tipo) {
    return res.status(400).json({ messagem: 'O tipo não foi informado' })
  }
  if (tipo !== 'entrada' && tipo !== 'saida') {
    return res.status(400).json({ messagem: 'O tipo deve ser entrada ou saida' })
  }

  try {
    const categoria = await existeCategoria(categoria_id)

    if (!categoria) {
      return res.status(400).json({ messagem: 'Categoria não encontrada' })
    }

    const { rows, rowCount } = await query(
      'INSERT INTO transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) VALUES ($1, $2,$3, $4, $5, $6) RETURNING *',
      [descricao, valor, data, categoria_id, tipo, logado.id]
    )

    if (rowCount <= 0) {
      return res.status(400).json({ messagem: 'Transação não cadastrada' })
    }

    const [transacao] = rows
    transacao.categoria_nome = categoria.rows[0].descricao

    return res.status(201).json(transacao)
  } catch (error) {
    return res.status(400).json({ messagem: error.message })
  }
}

const atualizarTransacao = async (req, res) => {
  let { id } = req.params
  let { descricao, valor, data, categoria_id, tipo } = req.body
  let { logado } = req

  if (!id) {
    return res.status(400).json({ messagem: 'O id não foi informado' })
  }
  if (!descricao) {
    return res.status(400).json({ messagem: 'A descrição não foi informada' })
  }
  if (!valor) {
    return res.status(400).json({ messagem: 'O valor não foi informado' })
  }
  if (!data) {
    return res.status(400).json({ messagem: 'A data não foi informada' })
  }
  if (!categoria_id) {
    return res.status(400).json({ messagem: 'A categoria não foi informada' })
  }
  if (!tipo) {
    return res.status(400).json({ messagem: 'O tipo não foi informado' })
  }
  if (tipo !== 'entrada' && tipo !== 'saida') {
    return res.status(400).json({ messagem: 'O tipo deve ser entrada ou saida' })
  }

  try {
    const categoria = await existeCategoria(categoria_id)

    if (!categoria) {
      return res.status(400).json({ messagem: 'Categoria não encontrada' })
    }
    let transacao = await transacaoExiste(id, logado.id)

    if (!transacao) {
      return res.status(404).json({ menssagem: 'Transação não encontrada' })
    }

    const atualizar = await query(
      `UPDATE transacoes 
      SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 
      WHERE id = $6 AND usuario_id = $7`,
      [descricao, valor, data, categoria_id, tipo, id, logado.id]
    )

    if (atualizar.rowCount <= 0) {
      return res.status(404).json({ menssagem: 'Transação não encontrada' })
    }

    return res.status(204).json()
  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}

const deletarTransacao = async (req, res) => {
  let { id } = req.params
  let { logado } = req

  if (!id) {
    return res.status(400).json({ messagem: 'O id não foi informado' })
  }

  try {
    let transacao = await transacaoExiste(id, logado.id)

    if (!transacao) {
      return res.status(404).json({ menssagem: 'Transação não encontrada' })
    }

    const deletar = await query(
      'DELETE FROM transacoes WHERE id = $1',
      [id]
    )

    if (deletar.rowCount <= 0) {
      return res.status(404).json({ menssagem: 'Não foi possível deletar transação' })
    }

    return res.status(204).json()

  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}

const demonstrarExtrato = async (req, res) => {
  const { logado } = req

  try {
    const extrato = 'SELECT sum(valor) as saldo FROM transacoes WHERE usuario_id = $1 and tipo = $2'

    const entrada = await query(extrato, [logado.id, 'entrada'])
    const saida = await query(extrato, [logado.id, 'saida'])

    return res.status(200).json({
      entrada: Number(entrada.rows[0].saldo) ?? 0,
      saida: Number(saida.rows[0].saldo) ?? 0
    })

  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}
module.exports = {
  listarTransacoes,
  listarTransacaoPorId,
  cadastrarTransacao,
  atualizarTransacao,
  deletarTransacao,
  demonstrarExtrato
}

