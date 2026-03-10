"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Login() {
  const [modo, setModo] = useState<"login" | "cadastro">("login")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")

  async function entrar() {
    if (!email || !senha) {
      alert("Preencha email e senha.")
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      alert(error.message)
      return
    }

    window.location.href = "/dashboard"
  }

  async function criarConta() {
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
      alert("Preencha todos os campos.")
      return
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.")
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    })

    if (error) {
      alert(error.message)
      return
    }

    const user = data.user

    if (!user) {
      alert("Usuário criado, mas não foi possível recuperar os dados.")
      return
    }

    const { error: profileError } = await supabase
      .from("users")
      .insert([
        {
          auth_user_id: user.id,
          name: nome,
          email: email,
          phone: telefone,
        },
      ])

    if (profileError) {
      alert(`Conta criada, mas erro ao salvar perfil: ${profileError.message}`)
      return
    }

    alert("Conta criada com sucesso!")
    window.location.href = "/dashboard"
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#f3f4f6",
          padding: "36px",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ color: "#1d4ed8", marginBottom: "6px" }}>GranaFlow</h1>
        <p style={{ color: "#4b5563", marginBottom: "24px" }}>
          Controle suas finanças de forma inteligente
        </p>

        <div
          style={{
            display: "flex",
            background: "#e5e7eb",
            borderRadius: "10px",
            padding: "4px",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setModo("login")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: modo === "login" ? "white" : "transparent",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Entrar
          </button>

          <button
            onClick={() => setModo("cadastro")}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              background: modo === "cadastro" ? "white" : "transparent",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Cadastrar
          </button>
        </div>

        {modo === "cadastro" && (
          <>
            <input
              placeholder="Seu nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />

            <input
              placeholder="Seu celular"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            boxSizing: "border-box",
          }}
        />

        {modo === "cadastro" && (
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "14px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />
        )}

        {modo === "login" ? (
          <button
            onClick={entrar}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Entrar
          </button>
        ) : (
          <button
            onClick={criarConta}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Criar conta
          </button>
        )}
      </div>
    </div>
  )
}