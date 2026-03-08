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

type Gasto = {
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
  "Outros": "#6b7280",
}

export default function Dashboard() {
  const [lista, setLista] = useState<Gasto[]>([])
  const [mesSelecionado, setMesSelecionado] = useState("")

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

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
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
    carregarGastos()
  }, [mesSelecionado])

  const total = lista.reduce((acc, gasto) => acc + gasto.amount, 0)

  const resumoCategorias: CategoriaResumo[] = Object.values(
    lista.reduce((acc: Record<string, CategoriaResumo>, gasto) => {
      if (!acc[gasto.category]) {
        acc[gasto.category] = {
          name: gasto.category,
          value: 0,
        }
      }

      acc[gasto.category].value += gasto.amount
      return acc
    }, {})
  )

  return (
    <div>
      <h1>📊 Dashboard GranaFlow</h1>

      <div style={{ marginTop: 20 }}>
        <label>Filtrar por mês: </label>
        <input
          type="month"
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
        />
        <button
          onClick={() => setMesSelecionado("")}
          style={{ marginLeft: 10 }}
        >
          Limpar filtro
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "30px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "12px",
            minWidth: "220px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Total gasto</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>R$ {total}</p>
        </div>

        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "12px",
            minWidth: "220px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h3>Quantidade de gastos</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{lista.length}</p>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Gastos por categoria</h2>

        {resumoCategorias.length === 0 ? (
          <p>Nenhum dado para o gráfico.</p>
        ) : (
          <div
            style={{
              width: "100%",
              height: 350,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "20px",
            }}
          >
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

      <div style={{ marginTop: "40px" }}>
        <h2>Últimos gastos</h2>

        {lista.length === 0 ? (
          <p>Nenhum gasto cadastrado.</p>
        ) : (
          <div style={{ marginTop: "20px" }}>
            {lista.map((gasto) => (
              <div
                key={gasto.id}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "12px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                <div><strong>Descrição:</strong> {gasto.description}</div>
                <div><strong>Valor:</strong> R$ {gasto.amount}</div>
                <div><strong>Categoria:</strong> {gasto.category}</div>
                <div><strong>Data:</strong> {gasto.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}