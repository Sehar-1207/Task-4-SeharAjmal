
export const API_BASE = 'http://localhost:3000/api';

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function updateGlobalMetrics() {
  try {
    const [patRes, docRes, appRes] = await Promise.all([
      fetch(`${API_BASE}/patients`),
      fetch(`${API_BASE}/doctors`),
      fetch(`${API_BASE}/appointments`)
    ]);

    const patients = await patRes.json();
    const doctors = await docRes.json();
    const appointments = await appRes.json();

    const pMetric = document.getElementById('dash-metric-patients');
    const dMetric = document.getElementById('dash-metric-doctors');
    const aMetric = document.getElementById('dash-metric-appointments');

    if (pMetric) pMetric.textContent = patients.length;
    if (dMetric) dMetric.textContent = doctors.length;
    if (aMetric) aMetric.textContent = appointments.length;
  } catch (err) {
    console.error("Metrics synchronization error:", err.message);
  }
}