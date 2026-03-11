"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useRouter, usePathname } from "next/navigation"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [logado, setLogado] = useState(false)
  const [nomeUsuario, setNomeUsuario] = useState("")
  const [menuAberto, setMenuAberto] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function verificarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setLogado(true)

        const { data } = await supabase
          .from("users")
          .select("name")
          .eq("auth_user_id", user.id)
          .single()

        if (data?.name) {
          setNomeUsuario(data.name)
        } else if (user.email) {
          setNomeUsuario(user.email)
        }
      }
    }

    verificarUsuario()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const paginaLogin = pathname === "/login"

  if (!logado || paginaLogin) {
    return (
      <html>
        <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#f5f7fb",
        }}
      >
        {/* TOPO */}
        <header
          style={{
            height: "70px",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "24px",
                cursor: "pointer",
                color: "#1d4ed8",
              }}
            >
              ☰
            </button>

            <a
              href="/dashboard"
              style={{
                textDecoration: "none",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              GranaFlow
            </a>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <span
              style={{
                color: "#374151",
                fontSize: "14px",
              }}
            >
              👤 {nomeUsuario}
            </span>

            <button
              onClick={sair}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Sair
            </button>
          </div>
        </header>

        {/* MENU SUSPENSO */}
{menuAberto && (
  <div
    style={{
      position: "absolute",
      top: "72px",
      left: "24px",
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "14px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
      padding: "12px",
      minWidth: "220px",
      zIndex: 999,
    }}
  >
    <a
      href="/dashboard"
      style={{
        display: "block",
        padding: "12px",
        textDecoration: "none",
        color: pathname === "/dashboard" ? "#2563eb" : "#111827",
        fontWeight: pathname === "/dashboard" ? "bold" : "normal",
        borderRadius: "10px",
        background: pathname === "/dashboard" ? "#eff6ff" : "transparent",
      }}
    >
      Dashboard
    </a>

    <a
      href="/gastos"
      style={{
        display: "block",
        padding: "12px",
        textDecoration: "none",
        color: pathname === "/gastos" ? "#2563eb" : "#111827",
        fontWeight: pathname === "/gastos" ? "bold" : "normal",
        borderRadius: "10px",
        background: pathname === "/gastos" ? "#eff6ff" : "transparent",
      }}
    >
      Transações
    </a>
  </div>
)}

        {/* CONTEÚDO */}
        <main
          style={{
            padding: "32px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}