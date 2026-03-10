"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

type Transacao = {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  date: string
  type: string
}

export default function Transacoes() {
  const [tipo, setTipo] = useState("expense")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [categoria, setCategoria] = useState("")
  const [data, setData] = useState("")
  const [lista, setLista] = useState<Transacao[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)

  async function carregarTransacoes() {
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
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar transações:", error.message)
      alert(`Erro ao carregar transações: ${error.message}`)
      return
    }

    setLista(data || [])
  }

  useEffect(() => {
    carregarTransacoes()
  }, [])

  function limparFormulario() {
    setTipo("expense")
    setDescricao("")
    setValor("")
    setCategoria("")
    setData("")
    setEditandoId(null)
  }

  async function adicionarTransacao() {
    if (!tipo || !descricao || !valor || !categoria || !data) {
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
          type: tipo,
          amount: Number(valor),
          category: categoria,
          description: descricao,
          date: data,
        },
      ])

    if (error) {
      console.error("Erro ao salvar transação:", error.message)
      alert(`Erro ao salvar transação: ${error.message}`)
      return
    }

    limparFormulario()
    carregarTransacoes()
  }

  function editarTransacao(transacao: Transacao) {
    setTipo(transacao.type)
    setDescricao(transacao.description)
    setValor(String(transacao.amount))
    setCategoria(transacao.category)
    setData(transacao.date)
    setEditandoId(transacao.id)
  }

  async function atualizarTransacao() {
    if (!editandoId) return

    if (!tipo || !descricao || !valor || !categoria || !data) {
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
        type: tipo,
        amount: Number(valor),
        category: categoria,
        description: descricao,
        date: data,
      })
      .eq("id", editandoId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao atualizar transação:", error.message)
      alert(`Erro ao atualizar transação: ${error.message}`)
      return
    }

    limparFormulario()
    carregarTransacoes()
  }

  async function excluirTransacao(id: string) {
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
      console.error("Erro ao excluir transação:", error.message)
      alert(`Erro ao excluir transação: ${error.message}`)
      return
    }

    carregarTransacoes()
  }

  const receitas = lista
    .filter((item) => item.type === "income")
    .reduce((acc, item) => acc + item.amount, 0)

  const despesas = lista
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => acc + item.amount, 0)

  const saldo = receitas - despesas

  function formatarData(data: string) {
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          💳 Transações
        </h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Gerencie receitas e despesas de forma simples e visual.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Saldo</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px" }}>
            R$ {saldo.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #14b8a6, #0f766e)",
            color: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(20,184,166,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Receitas</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px" }}>
            R$ {receitas.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(239,68,68,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Despesas</div>
          <div style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px" }}>
            R$ {despesas.toFixed(2)}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "35px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>
          {editandoId ? "Editar transação" : "Nova transação"}
        </h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>

          <input
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              minWidth: "220px",
            }}
          />

          <input
            placeholder="Valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              minWidth: "140px",
            }}
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
            }}
          >
            <option value="">Selecione uma categoria</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Transporte">Transporte</option>
            <option value="Moradia">Moradia</option>
            <option value="Saúde">Saúde</option>
            <option value="Lazer">Lazer</option>
            <option value="Assinaturas">Assinaturas</option>
            <option value="Salário">Salário</option>
            <option value="Freelance">Freelance</option>
            <option value="Outros">Outros</option>
          </select>

          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          {editandoId ? (
            <>
              <button
                onClick={atualizarTransacao}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Atualizar
              </button>

              <button
                onClick={limparFormulario}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={adicionarTransacao}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Adicionar
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Histórico de transações</h2>

        {lista.length === 0 ? (
          <p>Nenhuma transação cadastrada.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lista.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold" }}>{item.description}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {item.type === "income" ? "Receita" : "Despesa"}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      background: "#eef2ff",
                      color: "#3730a3",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.category}
                  </span>
                </div>

                <div
                  style={{
                    fontWeight: "bold",
                    color: item.type === "income" ? "#16a34a" : "#dc2626",
                  }}
                >
                  {item.type === "income" ? "+" : "-"}R$ {item.amount.toFixed(2)}
                </div>

                <div style={{ color: "#666" }}>{formatarData(item.date)}</div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => editarTransacao(item)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => excluirTransacao(item.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}