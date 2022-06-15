const { query } = require('../bancodedados/conexao')
const { existeCategoria, transacaoExiste, possuiTransacoes, stringFiltro } = require('../uteis/validacoes')

const listarTransacoes = async (req, res) => {
  let { logado } = req
  let filtro = req.query.filtro

  try {
    let array = filtro ? filtro : false
    filtro = stringFiltro(array)

    let { rows: transacoes } = await query(
      `SELECT t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, 
      c.descricao as nome_categoria FROM transacoes t 
      JOIN categorias c ON t.categoria_id = c.id 
      WHERE t.usuario_id = $1 ${filtro}`,
      [logado.id]
    )

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

    const { rows: transacoes, rowCount } = await query(
      'INSERT INTO transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) VALUES ($1, $2,$3, $4, $5, $6) RETURNING *',
      [descricao, valor, data, categoria_id, tipo, logado.id]
    )

    if (rowCount <= 0) {
      return res.status(400).json({ messagem: 'Transação não cadastrada' })
    }

    return res.status(201).json({
      id: transacoes[0].id,
      tipo: transacoes[0].tipo,
      descricao: transacoes[0].descricao,
      valor: transacoes[0].valor,
      data: transacoes[0].data,
      usuario_id: logado.id,
      categoria_id: transacoes[0].categoria_id,
      categoria_nome: categoria.rows[0].descricao
    })
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

    if (atualizar.rowCount > 0) {
      return res.status(204).json()
    }
    return res.status(404).json({ menssagem: 'Transação não encontrada' })
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
      'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, logado.id]
    )

    if (deletar.rowCount > 0) {
      return res.status(204).json()
    }
    return res.status(404).json({ menssagem: 'Não foi possível deletar transação' })
  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}

const demonstrarExtrato = async (req, res) => {
  const { logado } = req

  try {
    let transacao = await possuiTransacoes(logado.id)

    if (!transacao) {
      return res.status(404).json({ menssagem: 'Você não possui transações' })
    }
    const entradas = await query(
      'SELECT sum(valor) FROM transacoes WHERE tipo = $2 and usuario_id = $1;',
      [logado.id, 'entrada']
    )

    const saidas = await query(
      'SELECT sum(valor) FROM transacoes WHERE tipo = $2 and usuario_id = $1;',
      [logado.id, 'saida']
    )

    if (entradas.rowCount > 0 && saidas.rowCount > 0) {
      let entrada = Number(entradas.rows[0].sum)
      let saida = Number(saidas.rows[0].sum)

      return res.status(200).json({
        entrada: entrada > 0 ? entrada : 0,
        saida: saida > 0 ? saida : 0
      })
    }
    return res.status(404).json({ menssagem: 'Não foi possível demonstrar  extrato' })
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

