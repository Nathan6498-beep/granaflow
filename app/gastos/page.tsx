"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

type Gasto = {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  date: string
  type: string
}

export default function Gastos() {
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [categoria, setCategoria] = useState("")
  const [data, setData] = useState("")
  const [lista, setLista] = useState<Gasto[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)

  async function carregarGastos() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert("Você precisa estar logado.")
      window.location.href = "/login"
      return
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar gastos:", error.message)
      alert(`Erro ao carregar gastos: ${error.message}`)
      return
    }

    setLista(data || [])
  }

  useEffect(() => {
    carregarGastos()
  }, [])

  function limparFormulario() {
    setDescricao("")
    setValor("")
    setCategoria("")
    setData("")
    setEditandoId(null)
  }

  async function adicionarGasto() {
    if (!descricao || !valor || !categoria || !data) {
      alert("Preencha todos os campos.")
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert("Usuário não está logado.")
      return
    }

    const { error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: user.id,
          type: "expense",
          amount: Number(valor),
          category: categoria,
          description: descricao,
          date: data,
        },
      ])

    if (error) {
      console.error("Erro ao salvar gasto:", error.message)
      alert(`Erro ao salvar gasto: ${error.message}`)
      return
    }

    limparFormulario()
    carregarGastos()
  }

  function editarGasto(gasto: Gasto) {
    setDescricao(gasto.description)
    setValor(String(gasto.amount))
    setCategoria(gasto.category)
    setData(gasto.date)
    setEditandoId(gasto.id)
  }

  async function atualizarGasto() {
    if (!editandoId) return

    if (!descricao || !valor || !categoria || !data) {
      alert("Preencha todos os campos.")
      return
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert("Usuário não está logado.")
      return
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        amount: Number(valor),
        category: categoria,
        description: descricao,
        date: data,
      })
      .eq("id", editandoId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao atualizar gasto:", error.message)
      alert(`Erro ao atualizar gasto: ${error.message}`)
      return
    }

    limparFormulario()
    carregarGastos()
  }

  async function excluirGasto(id: string) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      alert("Usuário não está logado.")
      return
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao excluir gasto:", error.message)
      alert(`Erro ao excluir gasto: ${error.message}`)
      return
    }

    carregarGastos()
  }

  const total = lista.reduce((acc, gasto) => acc + gasto.amount, 0)

  return (
    <div>
      <h1>💸 Controle de Gastos</h1>

      <h2>Total gasto: R$ {total}</h2>

      <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <input
          placeholder="Valor"
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Selecione uma categoria</option>
          <option value="Alimentação">Alimentação</option>
          <option value="Transporte">Transporte</option>
          <option value="Moradia">Moradia</option>
          <option value="Saúde">Saúde</option>
          <option value="Lazer">Lazer</option>
          <option value="Assinaturas">Assinaturas</option>
          <option value="Outros">Outros</option>
        </select>

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        {editandoId ? (
          <>
            <button onClick={atualizarGasto}>Atualizar</button>
            <button onClick={limparFormulario}>Cancelar</button>
          </>
        ) : (
          <button onClick={adicionarGasto}>Adicionar</button>
        )}
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Lista de Gastos</h2>

        {lista.length === 0 ? (
          <p>Nenhum gasto cadastrado.</p>
        ) : (
          lista.map((gasto) => (
            <div key={gasto.id} style={{ marginBottom: 12 }}>
              <div><strong>Descrição:</strong> {gasto.description}</div>
              <div><strong>Valor:</strong> R$ {gasto.amount}</div>
              <div><strong>Categoria:</strong> {gasto.category}</div>
              <div><strong>Data:</strong> {gasto.date}</div>

              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <button onClick={() => editarGasto(gasto)}>
                  Editar
                </button>

                <button onClick={() => excluirGasto(gasto.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}