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
        <body style={{ margin: 0 }}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "Arial", background: "#f5f7fb" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: "240px",
              background: "#0f172a",
              color: "white",
              padding: "24px",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#60a5fa" }}>GranaFlow</h2>

            {nomeUsuario && (
              <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: 1.5 }}>
                Olá, {nomeUsuario} 👋
              </p>
            )}

            <nav style={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <a href="/" style={{ color: "white", textDecoration: "none" }}>Home</a>
              <a href="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</a>
              <a href="/gastos" style={{ color: "white", textDecoration: "none" }}>Transações</a>
            </nav>

            <button
              onClick={sair}
              style={{
                marginTop: "30px",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </aside>

          <main style={{ flex: 1, padding: "32px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}