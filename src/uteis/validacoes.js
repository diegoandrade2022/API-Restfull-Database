const bcrypt = require('bcrypt')

const { query } = require('../bancodedados/conexao')

const usuarioComEmail = async (email) => {
  let script = 'select * from usuarios where email = $1'

  let emailArr = await query(script, [email])
  if (emailArr.rowCount > 0) {
    return emailArr.rows[0]
  }
  return false
}

const retornaHash = async senha => {
  try {
    const hash = await bcrypt.hash(senha, 10);
    return hash
  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}

const existeCategoria = async categoria_id => {
  try {
    let categoria = await query('SELECT * FROM categorias WHERE id = $1', [categoria_id])

    if (categoria.rowCount <= 0) {
      return false
    }
    return categoria
  } catch (error) {
    return res.status(400).json({ menssagem: error.message })
  }
}

const transacaoExiste = async (id, usuario_id) => {
  let transacao = await query(
    'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
    [id, usuario_id]
  )
  if (transacaoExiste.rowCount <= 0) {
    return false
  }
  return transacao.rows[0]
}
const possuiTransacoes = async usuario_id => {
  let transacao = await query(
    'SELECT * FROM transacoes WHERE usuario_id = $1',
    [usuario_id]
  )

  if (transacaoExiste.rowCount <= 0) {
    return false
  }
  return transacao.rows[0]
}

const stringFiltro = arrFiltro => {
  if (arrFiltro) {
    let arrayFormatada = []
    arrFiltro.forEach(item => {
      let palavraSeparada = []
      if (item.includes(' ')) {
        let a = item.split(' ')
        for (itens of a) {
          if (itens.length <= 3) {
            palavraSeparada.push(itens.toLowerCase())
          } else {
            palavraSeparada.push(itens[0].toUpperCase() + itens.slice(1).toLowerCase())
          }
        }
        arrayFormatada.push(palavraSeparada.join(' '))
      } else {
        let palavra = item[0].toUpperCase() + item.slice(1).toLowerCase()
        arrayFormatada.push(palavra)
      }
    })

    let string = arrayFormatada.join("','")
    let filtro = `AND c.descricao in ('${string}')`
    return filtro
  }
  return ''
}
module.exports = {
  usuarioComEmail,
  retornaHash,
  existeCategoria,
  transacaoExiste,
  possuiTransacoes,
  stringFiltro
}
