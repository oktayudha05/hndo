import { useState } from "react";
import { login } from "../lib/api";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login({ email, password });
      router.push("/");
    } catch (error) {
      setErr(error.data?.error || error.message || "Login gagal");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm border border-purple-700"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">
          🐝 Login Honedo
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Hayyoowww wekombekkk~ <span className="text-yellow-400">buzz buzz</span>
        </p>

        {err && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {err}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-300">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="cth: kamu@mail.com"
          />
        </label>

        <label className="block mb-6">
          <span className="text-sm font-medium text-gray-300">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="••••••"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-xl hover:from-purple-600 hover:to-purple-800 transition font-medium shadow-md"
        >
          🚀 Masuk
        </button>

        <p className="text-center text-sm mt-6 text-gray-400">
          Belum punya akun?{" "}
          <a href="/register" className="text-yellow-400 hover:underline">
            Daftar sekarang 🐝
          </a>
        </p>
      </form>
    </div>
  );
}
