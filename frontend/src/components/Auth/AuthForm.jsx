import { useState } from "react"
import axios from "axios"

const api = axios.create({ baseURL: "http://localhost:8000" })

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password }

      const { data } = await api.post(endpoint, payload)
      localStorage.setItem("token", data.access_token)
      localStorage.setItem("username", data.username)
      onLogin(data.username)
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-green-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">🌱 Rootine</h1>
        <h2 className="text-center text-gray-500 text-sm">
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>

        {!isLogin && (
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Username"
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        )}
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Password"
          type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <button onClick={handleSubmit}
          className="bg-green-400 text-white rounded-lg py-2 font-semibold hover:bg-green-500">
          {isLogin ? "Log in" : "Sign up"}
        </button>

        <p className="text-center text-xs text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-green-600 underline">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  )
}