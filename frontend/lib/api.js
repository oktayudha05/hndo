const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// helper untuk fetch dengan cookie
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include", // biar cookie session ikut
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = "Terjadi kesalahan";
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  // kalau response kosong (204 No Content)
  if (res.status === 204) return null;

  return res.json();
}

//
// 🔑 AUTH
//
export async function register({ username, email, password }) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export async function login({ email, password }) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return apiFetch("/auth/logout", { method: "POST" });
}

export async function me() {
  const res = await apiFetch("/auth/me");
  return res.user; // ambil langsung objek user di dalam
}

//
// ✅ TODOS
//
export async function fetchTodos() {
  return apiFetch("/todos", { method: "GET" });
}

export async function createTodo(todo) {
  return apiFetch("/todos", {
    method: "POST",
    body: JSON.stringify(todo),
  });
}

export async function updateTodo(id, todo) {
  return apiFetch(`/todos/${id}`, {
    method: "PUT",
    body: JSON.stringify(todo),
  });
}

export async function deleteTodo(id) {
  return apiFetch(`/todos/${id}`, { method: "DELETE" });
}

export async function toggleTodo(id) {
  return apiFetch(`/todos/${id}/toggle`, { method: "PUT" });
}

//
// 📅 CALENDAR
//
export async function fetchEvents() {
  return apiFetch("/calendar/events", { method: "GET" });
}

export async function createEvent(event) {
  return apiFetch("/calendar/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export async function updateEvent(id, event) {
  return apiFetch(`/calendar/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(event),
  });
}

export async function deleteEvent(id) {
  return apiFetch(`/calendar/events/${id}`, { method: "DELETE" });
}
