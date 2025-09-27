import { useEffect, useState } from "react";
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from "../lib/api";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import withAuth from "../hoc/withAuth";

function Home() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // buat modal di mobile
  const router = useRouter();

  async function load() {
    try {
      setLoading(true);
      const data = await fetchTodos();
      setTodos(data.todos || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) router.push("/login");
      else console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newTitle || !startTime || !endTime) return;
    try {
      await createTodo({
        title: newTitle,
        description: newDescription,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });
      setNewTitle("");
      setNewDescription("");
      setStartTime("");
      setEndTime("");
      await load();
      setShowForm(false); // tutup modal setelah tambah
    } catch (e) {
      console.error("Gagal menambah todo", e);
    }
  }

  async function handleToggle(id) {
    try {
      await toggleTodo(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus todo ini?")) return;
    try {
      await deleteTodo(id);
      await load();
    } catch (e) {
      console.error(e);
    }
  }

  function groupByDate(todos) {
    const groups = {};
    for (const t of todos) {
      const dateKey = new Date(t.start_time).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    }
    return groups;
  }

  const completed = todos.filter((t) => t.is_completed).length;
  const progress = todos.length
    ? Math.round((completed / todos.length) * 100)
    : 0;

  return (
    <>
      <Navbar />
      <main className="flex h-[calc(100vh-64px)] bg-gray-900 text-gray-100">
        {/* Daftar Tugas */}
        <section className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-purple-400">
            ✨ Daftar Tugas Honey 🐝
          </h2>

          {/* Progress */}
          {todos.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1 gap-1">
                <span className="text-gray-300">Progress</span>
                <span className="text-yellow-400">{progress}% selesai</span>
              </div>
              <div className="w-full bg-gray-800 h-3 rounded-xl overflow-hidden">
                <div
                  className="h-3 bg-gradient-to-r from-yellow-400 to-purple-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* List todos */}
          {loading ? (
            <div className="text-center text-gray-400">Memuat...</div>
          ) : todos.length === 0 ? (
            <div className="text-center text-gray-500 italic">
              Belum ada tugas 🐝 ayo buat yang pertama~
            </div>
          ) : (
            Object.entries(groupByDate(todos)).map(([date, list]) => (
              <div key={date} className="mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-400 mb-2">
                  {date}
                </h3>
                <ul className="space-y-3">
                  {list.map((t) => {
                    const overdue =
                      new Date(t.end_time) < new Date() && !t.is_completed;
                    return (
                      <li
                        key={t.id}
                        className={`bg-gray-800 p-3 sm:p-4 rounded-2xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border ${
                          overdue
                            ? "border-red-500"
                            : t.is_completed
                            ? "border-green-500"
                            : "border-gray-700 hover:border-purple-500"
                        } transition`}
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.is_completed}
                            onChange={() => handleToggle(t.id)}
                            className="w-5 h-5 text-purple-500 rounded focus:ring-purple-400 mt-1 sm:mt-0"
                          />
                          <div>
                            <div
                              className={`font-medium ${
                                t.is_completed
                                  ? "line-through text-gray-500"
                                  : ""
                              }`}
                            >
                              {t.title}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(t.start_time).toLocaleString("id-ID")} →{" "}
                              {new Date(t.end_time).toLocaleString("id-ID")}
                            </div>
                            {t.description && (
                              <div className="text-sm text-yellow-400">
                                🍯 {t.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 justify-between">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              t.is_completed
                                ? "bg-green-600 text-white"
                                : overdue
                                ? "bg-red-600 text-white"
                                : "bg-yellow-500 text-gray-900"
                            }`}
                          >
                            {t.is_completed
                              ? "Selesai"
                              : overdue
                              ? "Terlambat"
                              : "Berjalan"}
                          </span>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-400 text-xs hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>

        {/* Sidebar Form (desktop) */}
        <aside className="hidden md:block w-80 bg-gray-800 border-l border-purple-800 p-6">
          <h3 className="text-xl font-semibold text-purple-300 mb-4">
            ➕ Tambah Tugas
          </h3>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div>
              <label className="block text-sm mb-1">Judul</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: Belajar Golang"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Deskripsi</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Detail tugas..."
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Mulai</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Selesai</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition font-medium text-white"
            >
              Simpan
            </button>
          </form>
        </aside>
      </main>

      {/* Floating Add Button (mobile) */}
      <button
        onClick={() => setShowForm(true)}
        className="md:hidden fixed bottom-6 right-6 bg-yellow-400 text-gray-900 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition"
      >
        ➕
      </button>

      {/* Modal Form (mobile) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-purple-300 mb-4">
              ➕ Tambah Tugas
            </h3>
            <form className="space-y-4" onSubmit={handleAdd}>
              <div>
                <label className="block text-sm mb-1">Judul</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Belajar Golang"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Deskripsi</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Detail tugas..."
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mulai</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Selesai</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-medium text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition font-medium text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(Home);
