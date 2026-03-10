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
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "36px",
              margin: 0,
              color: "#0f172a",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Acompanhe seu saldo, receitas e despesas em tempo real.
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
          }}
        >
          <label style={{ fontWeight: "bold", color: "#334155" }}>
            Filtrar por mês:
          </label>

          <input
            type="month"
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
            }}
          />

          <button
            onClick={() => setMesSelecionado("")}
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
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "white",
          borderRadius: "24px",
          padding: "28px",
          marginBottom: "28px",
          boxShadow: "0 12px 30px rgba(37,99,235,0.25)",
        }}
      >
        <div style={{ fontSize: "15px", opacity: 0.9 }}>
          Saldo disponível
        </div>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          R$ {saldo.toFixed(2)}
        </div>

        <div
          style={{
            display: "flex",
            gap: "32px",
            marginTop: "22px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Receitas</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              R$ {receitas.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>Despesas</div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              R$ {despesas.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "13px", opacity: 0.85 }}>
              Resultado do período
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold" }}>
              R$ {saldo.toFixed(2)}
            </div>
          </div>
        </div>
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
            background: "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "14px" }}>Receitas</div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "30px",
              fontWeight: "bold",
              color: "#0f766e",
            }}
          >
            R$ {receitas.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "14px" }}>Despesas</div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "30px",
              fontWeight: "bold",
              color: "#dc2626",
            }}
          >
            R$ {despesas.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "14px" }}>Transações</div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "30px",
              fontWeight: "bold",
              color: "#0f172a",
            }}
          >
            {lista.length}
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "22px",
            borderRadius: "18px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            Maior categoria
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1d4ed8",
            }}
          >
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
          marginBottom: "28px",
        }}
      >
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
            Despesas por categoria
          </h2>

          {resumoCategorias.length === 0 ? (
            <p style={{ color: "#64748b" }}>Nenhum dado para o gráfico.</p>
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
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "20px", color: "#0f172a" }}>
            Resumo por categoria
          </h2>

          {resumoCategorias.length === 0 ? (
            <p style={{ color: "#64748b" }}>Nenhuma despesa cadastrada.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {resumoCategorias.map((item) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "999px",
                        background: coresCategorias[item.name] || "#8884d8",
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "#0f172a", fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>

                  <strong style={{ color: "#0f172a" }}>
                    R$ {item.value.toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
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
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
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
                      color: "#1d4ed8",
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

                <div style={{ color: "#64748b" }}>
                  {formatarData(item.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}