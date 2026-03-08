"use client"

import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        setEmail(user.email)
      }
    }

    carregarUsuario()
  }, [])

  async function sair() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "Arial" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <aside
            style={{
              width: "220px",
              background: "#111",
              color: "white",
              padding: "20px",
            }}
          >
            <h2>💰 GranaFlow</h2>

            {email && (
              <p style={{ fontSize: "12px", color: "#bbb", marginTop: "10px" }}>
                Logado como:
                <br />
                {email}
              </p>
            )}

            <nav style={{ marginTop: "20px" }}>
              <p><a href="/" style={{ color: "white" }}>Home</a></p>
              <p><a href="/dashboard" style={{ color: "white" }}>Dashboard</a></p>
              <p><a href="/gastos" style={{ color: "white" }}>Gastos</a></p>
              <p><a href="/login" style={{ color: "white" }}>Login</a></p>
            </nav>

            <button
              onClick={sair}
              style={{ marginTop: "20px", padding: "8px 12px", cursor: "pointer" }}
            >
              Sair
            </button>
          </aside>

          <main style={{ flex: 1, padding: "40px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}