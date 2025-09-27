import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { logout } from "../lib/api";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (e) {
      console.error("Logout gagal", e);
    }
  }

  return (
    <nav className="bg-gray-800 border-b border-purple-700 px-4 md:px-6 py-3 flex items-center justify-between relative">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">🐝</span>
        <span className="text-lg md:text-xl font-bold text-purple-400">
          Honey<span className="text-yellow-400">Todo</span>
        </span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/"
          className={`${
            router.pathname === "/" ? "text-purple-400" : "text-gray-300"
          } hover:text-purple-300 transition`}
        >
          Tugas
        </Link>
        <Link
          href="/calendar"
          className={`${
            router.pathname === "/calendar"
              ? "text-purple-400"
              : "text-gray-300"
          } hover:text-purple-300 transition`}
        >
          Kalender
        </Link>
        <button
          onClick={handleLogout}
          className="text-gray-300 hover:text-red-400 transition"
        >
          Keluar
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-gray-300 hover:text-purple-300 transition"
      >
        ☰
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full right-0 bg-gray-800 border-t border-purple-700 w-full flex flex-col items-start p-4 space-y-3 md:hidden z-50">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={`${
              router.pathname === "/" ? "text-purple-400" : "text-gray-300"
            } hover:text-purple-300 transition w-full`}
          >
            Tugas
          </Link>
          <Link
            href="/calendar"
            onClick={() => setMenuOpen(false)}
            className={`${
              router.pathname === "/calendar"
                ? "text-purple-400"
                : "text-gray-300"
            } hover:text-purple-300 transition w-full`}
          >
            Kalender
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="text-gray-300 hover:text-red-400 transition w-full text-left"
          >
            Keluar
          </button>
        </div>
      )}
    </nav>
  );
}
