"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const router = useRouter()

  async function cadastrar() {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {
      alert(`Erro ao cadastrar: ${error.message}`)
      return
    }

    alert("Cadastro realizado com sucesso!")
  }

  async function entrar() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      alert(`Erro ao entrar: ${error.message}`)
      return
    }

    alert("Login realizado com sucesso!")
    router.push("/gastos")
  }

  return (
    <div>
      <h1>🔐 Login GranaFlow</h1>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 300,
        }}
      >
        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button onClick={cadastrar}>Criar conta</button>
        <button onClick={entrar}>Entrar</button>
      </div>
    </div>
  )
}