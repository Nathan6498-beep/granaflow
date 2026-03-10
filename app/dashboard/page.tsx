"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type Transacao = {
  id: string
  user_id: string
  description: string
  amount: number
  category: string
  date: string
  type: string
}

type CategoriaResumo = {
  name: string
  value: number
}

const coresCategorias: Record<string, string> = {
  "Alimentação": "#3b82f6",
  "Transporte": "#22c55e",
  "Moradia": "#f97316",
  "Saúde": "#ef4444",
  "Lazer": "#a855f7",
  "Assinaturas": "#eab308",
  "Salário": "#14b8a6",
  "Freelance": "#0ea5e9",
  "Outros": "#6b7280",
}

export default function Dashboard() {
  const [lista, setLista] = useState<Transacao[]>([])
  const [mesSelecionado, setMesSelecionado] = useState("")

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

    if (mesSelecionado) {
      const inicio = `${mesSelecionado}-01`
      const fim = `${mesSelecionado}-31`
      query = query.gte("date", inicio).lte("date", fim)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      console.error("Erro ao carregar dashboard:", error.message)
      alert(`Erro ao carregar dashboard: ${error.message}`)
      return
    }

    setLista(data || [])
  }

  useEffect(() => {
    carregarTransacoes()
  }, [mesSelecionado])

  const receitas = lista
    .filter((item) => item.type === "income")
    .reduce((acc, item) => acc + item.amount, 0)

  const despesas = lista
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => acc + item.amount, 0)

  const saldo = receitas - despesas

  const despesasLista = lista.filter((item) => item.type === "expense")

  const resumoCategorias: CategoriaResumo[] = Object.values(
    despesasLista.reduce((acc: Record<string, CategoriaResumo>, transacao) => {
      if (!acc[transacao.category]) {
        acc[transacao.category] = {
          name: transacao.category,
          value: 0,
        }
      }

      acc[transacao.category].value += transacao.amount
      return acc
    }, {})
  )

  const maiorCategoria =
    resumoCategorias.length > 0
      ? resumoCategorias.reduce((maior, atual) =>
          atual.value > maior.value ? atual : maior
        )
      : null

  function formatarData(data: string) {
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          📊 Dashboard Financeiro
        </h1>
        <p style={{ color: "#666", fontSize: "16px" }}>
          Acompanhe suas finanças e seu saldo acumulado.
        </p>
      </div>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontWeight: "bold" }}>Filtrar por mês:</label>

        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          onClick={() => setMesSelecionado("")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Limpar filtro
        </button>
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
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Saldo acumulado</div>
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

        <div
          style={{
            background: "linear-gradient(135deg, #9333ea, #7e22ce)",
            color: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(147,51,234,0.2)",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Maior categoria</div>
          <div style={{ fontSize: "22px", fontWeight: "bold", marginTop: "10px" }}>
            {maiorCategoria ? maiorCategoria.name : "Sem dados"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "24px",
          alignItems: "start",
          marginBottom: "35px",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Despesas por categoria</h2>

          {resumoCategorias.length === 0 ? (
            <p>Nenhum dado para o gráfico.</p>
          ) : (
            <div style={{ width: "100%", height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resumoCategorias}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    label
                  >
                    {resumoCategorias.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={coresCategorias[entry.name] || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
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
          <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Resumo do período</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                background: "#DCFCE7",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <strong>Receitas</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "bold" }}>
                R$ {receitas.toFixed(2)}
              </p>
            </div>

            <div
              style={{
                background: "#FEE2E2",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <strong>Despesas</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "bold" }}>
                R$ {despesas.toFixed(2)}
              </p>
            </div>

            <div
              style={{
                background: "#DBEAFE",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <strong>Resultado</strong>
              <p style={{ margin: "8px 0 0 0", fontSize: "24px", fontWeight: "bold" }}>
                R$ {saldo.toFixed(2)}
              </p>
            </div>
          </div>
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
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}