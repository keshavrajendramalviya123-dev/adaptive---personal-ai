// All frontend-to-backend communication goes through this shared helper.
async function api(path, options = {}) {
  const config = { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } };
  let response;
  try { response = await fetch(path, config); }
  catch { throw new Error("Cannot reach the server. Check that Flask is running."); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || "Something went wrong.");
  return data;
}
function toast(message, isError = false) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message; el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.className = "toast", 3200);
}
const getJSON = (path) => api(path);
const sendJSON = (path, method, body) => api(path, { method, body: JSON.stringify(body) });
