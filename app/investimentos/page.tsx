"use client"

import { useEffect, useMemo, useState } from "react"
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

type AtivoCatalogo = {
  ticker: string
  name: string
  category: string
}

const catalogoAtivos: Record<string, AtivoCatalogo[]> = {
  crypto: [
    { ticker: "BTC", name: "Bitcoin", category: "Cripto" },
    { ticker: "ETH", name: "Ethereum", category: "Cripto" },
    { ticker: "SOL", name: "Solana", category: "Cripto" },
    { ticker: "USDC", name: "USD Coin", category: "Cripto" },
  ],
  stock: [
    { ticker: "PETR4", name: "Petrobras PN", category: "Ações" },
    { ticker: "VALE3", name: "Vale ON", category: "Ações" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", category: "Ações" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", category: "Ações" },
  ],
  fii: [
    { ticker: "HGLG11", name: "CSHG Logística", category: "FIIs" },
    { ticker: "MXRF11", name: "Maxi Renda", category: "FIIs" },
    { ticker: "KNRI11", name: "Kinea Renda Imobiliária", category: "FIIs" },
  ],
  etf: [
    { ticker: "IVVB11", name: "iShares S&P 500", category: "ETFs" },
    { ticker: "BOVA11", name: "iShares Ibovespa", category: "ETFs" },
    { ticker: "SMAL11", name: "iShares Small Cap", category: "ETFs" },
  ],
  fixed_income: [
    { ticker: "TESOURO-SELIC", name: "Tesouro Selic", category: "Renda Fixa" },
    { ticker: "TESOURO-IPCA", name: "Tesouro IPCA+", category: "Renda Fixa" },
    { ticker: "CDB", name: "CDB", category: "Renda Fixa" },
    { ticker: "LCI-LCA", name: "LCI/LCA", category: "Renda Fixa" },
  ],
}

export default function Investimentos() {
  const [assetType, setAssetType] = useState("crypto")
  const [buscaAtivo, setBuscaAtivo] = useState("")
  const [ticker, setTicker] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [averagePrice, setAveragePrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [lista, setLista] = useState<Ativo[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const ativosDisponiveis = useMemo(() => {
    return catalogoAtivos[assetType] || []
  }, [assetType])

  const ativosFiltrados = useMemo(() => {
    const termo = buscaAtivo.trim().toLowerCase()

    if (!termo) {
      return ativosDisponiveis
    }

    return ativosDisponiveis.filter((ativo) => {
      return (
        ativo.ticker.toLowerCase().includes(termo) ||
        ativo.name.toLowerCase().includes(termo)
      )
    })
  }, [ativosDisponiveis, buscaAtivo])

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
      alert("Erro ao carregar investimentos: " + error.message)
      return
    }

    setLista((data || []) as Ativo[])
  }

  useEffect(() => {
    carregarAtivos()
  }, [])

  function limparFormulario() {
    setAssetType("crypto")
    setBuscaAtivo("")
    setTicker("")
    setName("")
    setCategory("")
    setQuantity("")
    setAveragePrice("")
    setCurrentPrice("")
    setMostrarSugestoes(false)
  }

  function selecionarAtivo(ativo: AtivoCatalogo) {
    setTicker(ativo.ticker)
    setName(ativo.name)
    setCategory(ativo.category)
    setBuscaAtivo(ativo.ticker + " - " + ativo.name)
    setMostrarSugestoes(false)
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

    if (quantidadeNum <= 0 || precoMedioNum <= 0 || precoAtualNum <= 0) {
      alert("Quantidade e preços devem ser maiores que zero.")
      return
    }

    const investedAmount = quantidadeNum * precoMedioNum
    const currentAmount = quantidadeNum * precoAtualNum
    const profitAmount = currentAmount - investedAmount
    const profitability =
      investedAmount > 0 ? (profitAmount / investedAmount) * 100 : 0

    const { error } = await supabase.from("investment_assets").insert([
      {
        user_id: user.id,
        asset_type: assetType,
        ticker: ticker,
        name: name,
        category: category,
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
      alert("Erro ao salvar investimento: " + error.message)
      return
    }

    limparFormulario()
    carregarAtivos()
  }

  const patrimonioTotal = lista.reduce((acc, item) => {
    return acc + Number(item.current_amount)
  }, 0)

  const valorInvestido = lista.reduce((acc, item) => {
    return acc + Number(item.invested_amount)
  }, 0)

  const lucroTotal = lista.reduce((acc, item) => {
    return acc + Number(item.profit_amount)
  }, 0)

  const rentabilidadeTotal =
    valorInvestido > 0 ? (lucroTotal / valorInvestido) * 100 : 0

  const labelQuantidade =
    assetType === "fixed_income"
      ? "Valor aplicado"
      : assetType === "crypto"
      ? "Quantidade (aceita fração)"
      : "Quantidade"

  const labelPrecoMedio =
    assetType === "fixed_income" ? "Taxa / preço de entrada" : "Preço médio"

  const labelPrecoAtual =
    assetType === "fixed_income" ? "Valor atual / taxa atual" : "Preço atual"

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "36px", margin: 0, color: "#0f172a" }}>
          Investimentos
        </h1>
        <p style={{ marginTop: "8px", color: "#64748b", fontSize: "15px" }}>
          Cadastre seus ativos e acompanhe patrimônio e rentabilidade.
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
            onChange={(e) => {
              setAssetType(e.target.value)
              setBuscaAtivo("")
              setTicker("")
              setName("")
              setCategory("")
              setQuantity("")
              setAveragePrice("")
              setCurrentPrice("")
              setMostrarSugestoes(false)
            }}
            style={inputStyle}
          >
            <option value="crypto">Cripto</option>
            <option value="stock">Ação</option>
            <option value="fii">FII</option>
            <option value="etf">ETF</option>
            <option value="fixed_income">Renda fixa</option>
          </select>

          <div style={{ position: "relative", gridColumn: "span 2" }}>
            <input
              placeholder="Buscar ativo"
              value={buscaAtivo}
              onChange={(e) => {
                setBuscaAtivo(e.target.value)
                setMostrarSugestoes(true)
              }}
              onFocus={() => setMostrarSugestoes(true)}
              style={{
                ...inputStyle,
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            {mostrarSugestoes && ativosFiltrados.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  left: 0,
                  right: 0,
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: "12px",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                  zIndex: 20,
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {ativosFiltrados.map((ativo) => (
                  <button
                    key={ativo.ticker + "-" + ativo.name}
                    type="button"
                    onClick={() => selecionarAtivo(ativo)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      border: "none",
                      background: "#ffffff",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <strong>{ativo.ticker}</strong> - {ativo.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            placeholder="Ticker"
            value={ticker}
            readOnly
            style={{ ...inputStyle, background: "#f8fafc" }}
          />

          <input
            placeholder="Nome do ativo"
            value={name}
            readOnly
            style={{ ...inputStyle, background: "#f8fafc" }}
          />

          <input
            placeholder="Categoria"
            value={category}
            readOnly
            style={{ ...inputStyle, background: "#f8fafc" }}
          />

          <input
            placeholder={labelQuantidade}
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder={labelPrecoMedio}
            type="number"
            step="any"
            value={averagePrice}
            onChange={(e) => setAveragePrice(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder={labelPrecoAtual}
            type="number"
            step="any"
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
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Quantidade
                  </div>
                  <div style={{ fontWeight: "bold" }}>{Number(item.quantity)}</div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Preço médio
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    R$ {Number(item.average_price).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Preço atual
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    R$ {Number(item.current_price).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>Lucro</div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        Number(item.profit_amount) >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    R$ {Number(item.profit_amount).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    Rentabilidade
                  </div>
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        Number(item.profitability) >= 0 ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {Number(item.profitability).toFixed(2)}%
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