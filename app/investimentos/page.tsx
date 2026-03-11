"use client"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

type Ativo = {
  id: string
  user_id: string
  asset_type: string
  ticker: string
  name: string
  category: string
  quantity: number
  average_price: number
  current_price: number
  invested_amount: number
  current_amount: number
  profit_amount: number
  profitability: number
}

export default function Investimentos() {
  const [assetType, setAssetType] = useState("crypto")
  const [ticker, setTicker] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [averagePrice, setAveragePrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [lista, setLista] = useState<Ativo[]>([])

  async function carregarAtivos() {
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
      .from("investment_assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar investimentos:", error.message)
      alert(`Erro ao carregar investimentos: ${error.message}`)
      return
    }

    setLista((data || []) as Ativo[])
  }

  useEffect(() => {
    carregarAtivos()
  }, [])

  function limparFormulario() {
    setAssetType("crypto")
    setTicker("")
    setName("")
    setCategory("")
    setQuantity("")
    setAveragePrice("")
    setCurrentPrice("")
  }

  async function adicionarInvestimento() {
    if (
      !assetType ||
      !ticker ||
      !name ||
      !category ||
      !quantity ||
      !averagePrice ||
      !currentPrice
    ) {
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

    const quantidadeNum = Number(quantity)
    const precoMedioNum = Number(averagePrice)
    const precoAtualNum = Number(currentPrice)

    const investedAmount = quantidadeNum * precoMedioNum
    const currentAmount = quantidadeNum * precoAtualNum
    const profitAmount = currentAmount - investedAmount
    const profitability =
      investedAmount > 0 ? (profitAmount / investedAmount) * 100 : 0

    const { error } = await supabase
      .from("investment_assets")
      .insert([
        {
          user_id: user.id,
          asset_type: assetType,
          ticker: ticker.toUpperCase(),
          name,
          category,
          quantity: quantidadeNum,
          average_price: precoMedioNum,
          current_price: precoAtualNum,
          invested_amount: investedAmount,
          current_amount: currentAmount,
          profit_amount: profitAmount,
          profitability: profitability,
        },
      ])

    if (error) {
      console.error("Erro ao salvar investimento:", error.message)
      alert(`Erro ao salvar investimento: ${error.message}`)
      return
    }

    limparFormulario()
    carregarAtivos()
  }

  const patrimonioTotal = lista.reduce((acc, item) => acc + item.current_amount, 0)
  const valorInvestido = lista.reduce((acc, item) => acc + item.invested_amount, 0)
  const lucroTotal = lista.reduce((acc, item) => acc + item.profit_amount, 0)
  const rentabilidadeTotal =
    valorInvestido > 0 ? (lucroTotal / valorInvestido) * 100 : 0

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "36px", margin: 0, color: "#0f172a" }}>
          Investimentos
        </h1>
        <p style={{ marginTop: "8px", color: "#64748b", fontSize: "15px" }}>
          Cadastre seus ativos e acompanhe seu patrimônio e rentabilidade.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginBottom: "28px",
        }}
      >
        <div style={cardAzul}>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Patrimônio total</div>
          <div style={valorCardBranco}>R$ {patrimonioTotal.toFixed(2)}</div>
        </div>

        <div style={cardVerde}>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Valor investido</div>
          <div style={valorCardBranco}>R$ {valorInvestido.toFixed(2)}</div>
        </div>

        <div style={cardCinza}>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Lucro total</div>
          <div style={valorCardBranco}>R$ {lucroTotal.toFixed(2)}</div>
        </div>

        <div style={cardRoxo}>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>Rentabilidade</div>
          <div style={valorCardBranco}>{rentabilidadeTotal.toFixed(2)}%</div>
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
          Novo investimento
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            style={inputStyle}
          >
            <option value="crypto">Cripto</option>
            <option value="stock">Ação</option>
            <option value="fii">FII</option>
            <option value="etf">ETF</option>
            <option value="fixed_income">Renda Fixa</option>
          </select>

          <input
            placeholder="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Nome do ativo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Quantidade"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Preço médio"
            type="number"
            value={averagePrice}
            onChange={(e) => setAveragePrice(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Preço atual"
            type="number"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
          <button onClick={adicionarInvestimento} style={botaoPrimario}>
            Adicionar investimento
          </button>

          <button onClick={limparFormulario} style={botaoSecundario}>
            Limpar
          </button>
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
          Meus ativos
        </h2>

        {lista.length === 0 ? (
          <p style={{ color: "#64748b" }}>Nenhum investimento cadastrado.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lista.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 1fr",
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
                    {item.ticker}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {item.name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Quantidade</div>
                  <div style={{ fontWeight: "bold" }}>{item.quantity}</div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Preço médio</div>
                  <div style={{ fontWeight: "bold" }}>
                    R$ {item.average_price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Preço atual</div>
                  <div style={{ fontWeight: "bold" }}>
                    R$ {item.current_price.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Lucro</div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: item.profit_amount >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    R$ {item.profit_amount.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Rentabilidade</div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color: item.profitability >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {item.profitability.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "white",
}

const botaoPrimario: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
}

const botaoSecundario: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontWeight: "bold",
}

const valorCardBranco: React.CSSProperties = {
  marginTop: "10px",
  fontSize: "30px",
  fontWeight: "bold",
}

const cardAzul: React.CSSProperties = {
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(37,99,235,0.2)",
}

const cardVerde: React.CSSProperties = {
  background: "linear-gradient(135deg, #14b8a6, #0f766e)",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(20,184,166,0.2)",
}

const cardCinza: React.CSSProperties = {
  background: "linear-gradient(135deg, #475569, #334155)",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(71,85,105,0.2)",
}

const cardRoxo: React.CSSProperties = {
  background: "linear-gradient(135deg, #9333ea, #7e22ce)",
  color: "white",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 8px 20px rgba(147,51,234,0.2)",
}