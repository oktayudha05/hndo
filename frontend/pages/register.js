import { useState } from "react";
import { register } from "../lib/api";
import { useRouter } from "next/router";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await register({ username, email, password });
      router.push("/");
    } catch (error) {
      setErr(error.data?.error || error.message || "Registrasi gagal");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm border border-purple-700"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">
          🐝 Buat Akun
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Selamat datang di <span className="text-yellow-400">Honedo (Honey Todo)</span> 🐝
        </p>

        {err && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {err}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-300">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full bg-gray-900 text-gray-100 border border-gray-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            placeholder="cth: lebah_madu"
          />
        </label>

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
          🐝 Daftar
        </button>

        <p className="text-center text-sm mt-6 text-gray-400">
          Sudah punya akun?{" "}
          <a href="/login" className="text-yellow-400 hover:underline">
            Masuk sekarang
          </a>
        </p>
      </form>
    </div>
  );
}
