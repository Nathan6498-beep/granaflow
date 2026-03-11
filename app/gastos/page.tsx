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

const coresCategorias: Record<string, string> = {
  Alimentação: "#3b82f6",
  Transporte: "#22c55e",
  Moradia: "#f97316",
  Saúde: "#ef4444",
  Lazer: "#a855f7",
  Assinaturas: "#eab308",
  Salário: "#14b8a6",
  Freelance: "#0ea5e9",
  Outros: "#6b7280",
}

const meses = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

const anoAtual = new Date().getFullYear()
const anos = [anoAtual - 1, anoAtual, anoAtual + 1]

export default function Transacoes() {
  const [tipo, setTipo] = useState("expense")
  const [descricao, setDescricao] = useState("")
  const [valor, setValor] = useState("")
  const [categoria, setCategoria] = useState("")
  const [data, setData] = useState("")
  const [lista, setLista] = useState<Transacao[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mesSelecionado, setMesSelecionado] = useState("")
  const [anoSelecionado, setAnoSelecionado] = useState("")
  const [periodoRapido, setPeriodoRapido] = useState("")

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

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)

    const hoje = new Date()

    if (periodoRapido === "hoje") {
      const dataHoje = hoje.toISOString().split("T")[0]
      query = query.eq("date", dataHoje)
    } else if (periodoRapido === "7dias") {
      const inicio = new Date()
      inicio.setDate(hoje.getDate() - 7)
      query = query.gte("date", inicio.toISOString().split("T")[0])
    } else if (periodoRapido === "30dias") {
      const inicio = new Date()
      inicio.setDate(hoje.getDate() - 30)
      query = query.gte("date", inicio.toISOString().split("T")[0])
    } else if (periodoRapido === "mes") {
      const ano = hoje.getFullYear()
      const mes = String(hoje.getMonth() + 1).padStart(2, "0")
      const ultimoDia = new Date(ano, hoje.getMonth() + 1, 0).getDate()

      query = query
        .gte("date", `${ano}-${mes}-01`)
        .lte("date", `${ano}-${mes}-${String(ultimoDia).padStart(2, "0")}`)
    } else if (periodoRapido === "ano") {
      const ano = hoje.getFullYear()
      query = query.gte("date", `${ano}-01-01`).lte("date", `${ano}-12-31`)
    } else if (mesSelecionado && anoSelecionado) {
      const ultimoDia = new Date(
        Number(anoSelecionado),
        Number(mesSelecionado),
        0
      ).getDate()

      const inicio = `${anoSelecionado}-${mesSelecionado}-01`
      const fim = `${anoSelecionado}-${mesSelecionado}-${String(ultimoDia).padStart(2, "0")}`

      query = query.gte("date", inicio).lte("date", fim)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar transações:", error.message)
      alert(`Erro ao carregar transações: ${error.message}`)
      return
    }

    setLista(data || [])
  }

  useEffect(() => {
    carregarTransacoes()
  }, [mesSelecionado, anoSelecionado, periodoRapido])

  function limparFormulario() {
    setTipo("expense")
    setDescricao("")
    setValor("")
    setCategoria("")
    setData("")
    setEditandoId(null)
  }

  function limparFiltros() {
    setPeriodoRapido("")
    setMesSelecionado("")
    setAnoSelecionado("")
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
    window.scrollTo({ top: 0, behavior: "smooth" })
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
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "36px", margin: 0, color: "#0f172a" }}>
          Transações
        </h1>
        <p style={{ marginTop: "8px", color: "#64748b", fontSize: "15px" }}>
          Registre e acompanhe suas receitas e despesas.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "14px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "18px",
        }}
      >
        <label style={{ fontWeight: "bold", color: "#334155" }}>
          Filtrar por período:
        </label>

        <select
          value={mesSelecionado}
          onChange={(e) => {
            setPeriodoRapido("")
            setMesSelecionado(e.target.value)
          }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            background: "white",
          }}
        >
          <option value="">Mês</option>
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>

        <select
          value={anoSelecionado}
          onChange={(e) => {
            setPeriodoRapido("")
            setAnoSelecionado(e.target.value)
          }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            background: "white",
          }}
        >
          <option value="">Ano</option>
          {anos.map((ano) => (
            <option key={ano} value={String(ano)}>
              {ano}
            </option>
          ))}
        </select>

        <button
          onClick={limparFiltros}
          style={{
            padding: "9px 14px",
            borderRadius: "10px",
            border: "none",
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Limpar
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => {
            limparFiltros()
            setPeriodoRapido("hoje")
          }}
          style={botaoPeriodo(periodoRapido === "hoje")}
        >
          Hoje
        </button>

        <button
          onClick={() => {
            limparFiltros()
            setPeriodoRapido("7dias")
          }}
          style={botaoPeriodo(periodoRapido === "7dias")}
        >
          7 dias
        </button>

        <button
          onClick={() => {
            limparFiltros()
            setPeriodoRapido("30dias")
          }}
          style={botaoPeriodo(periodoRapido === "30dias")}
        >
          30 dias
        </button>

        <button
          onClick={() => {
            limparFiltros()
            setPeriodoRapido("mes")
          }}
          style={botaoPeriodo(periodoRapido === "mes")}
        >
          Este mês
        </button>

        <button
          onClick={() => {
            limparFiltros()
            setPeriodoRapido("ano")
          }}
          style={botaoPeriodo(periodoRapido === "ano")}
        >
          Este ano
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Saldo</div>
          <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: "bold" }}>
            R$ {saldo.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #14b8a6, #0f766e)",
            color: "white",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: "0 8px 20px rgba(20,184,166,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Receitas</div>
          <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: "bold" }}>
            R$ {receitas.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            padding: "22px",
            borderRadius: "18px",
            boxShadow: "0 8px 20px rgba(239,68,68,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Despesas</div>
          <div style={{ marginTop: "10px", fontSize: "30px", fontWeight: "bold" }}>
            R$ {despesas.toFixed(2)}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>
          {editandoId ? "Editar transação" : "Nova transação"}
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "white",
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
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />

          <input
            placeholder="Valor"
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "white",
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
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {editandoId ? (
            <>
              <button
                onClick={atualizarTransacao}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Atualizar
              </button>

              <button
                onClick={limparFormulario}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={adicionarTransacao}
              style={{
                padding: "12px 18px",
                borderRadius: "12px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Adicionar transação
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>
          Histórico de transações
        </h2>

        {lista.length === 0 ? (
          <p style={{ color: "#64748b" }}>Nenhuma transação cadastrada.</p>
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
                  borderRadius: "14px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", color: "#0f172a" }}>
                    {item.description}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {item.type === "income" ? "Receita" : "Despesa"}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: coresCategorias[item.category] || "#1d4ed8",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: "bold",
                      display: "inline-block",
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

                <div style={{ color: "#64748b" }}>{formatarData(item.date)}</div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => editarTransacao(item)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => excluirTransacao(item.id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "none",
                      background: "#dc2626",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
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

function botaoPeriodo(ativo: boolean): React.CSSProperties {
  return {
    padding: "9px 14px",
    borderRadius: "10px",
    border: ativo ? "none" : "1px solid #d1d5db",
    background: ativo ? "#2563eb" : "#ffffff",
    color: ativo ? "white" : "#0f172a",
    cursor: "pointer",
    fontWeight: "bold",
  }
}