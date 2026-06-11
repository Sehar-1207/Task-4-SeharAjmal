
import { API_BASE, escapeHtml, updateGlobalMetrics } from './api.js';

const patientSelect = document.getElementById('dash-patient-select');
const doctorSelect = document.getElementById('dash-doctor-select');
const appointmentForm = document.getElementById('dash-appointment-form');
const appointmentsList = document.getElementById('dash-appointments-list');
const feedback = document.getElementById('dash-app-feedback');
const submitBtn = document.getElementById('dash-app-submit');

async function initDashboard() {
  try {
    await updateGlobalMetrics();
    
    const [patRes, docRes, appRes] = await Promise.all([
      fetch(`${API_BASE}/patients`),
      fetch(`${API_BASE}/doctors`),
      fetch(`${API_BASE}/appointments`)
    ]);

    const patients = await patRes.json();
    const doctors = await docRes.json();
    const appointments = await appRes.json();

    patientSelect.innerHTML = patients.map(p => `<option value="${p._id}">${escapeHtml(p.name)}</option>`).join('');
    doctorSelect.innerHTML = doctors.map(d => `<option value="${d._id}">Dr. ${escapeHtml(d.name)} (${escapeHtml(d.specialty)})</option>`).join('');

    if (appointments.length === 0) {
      appointmentsList.innerHTML = `<div class="text-center py-4 text-muted small border border-dashed rounded">No clinical slots currently scheduled.</div>`;
      return;
    }

    appointmentsList.innerHTML = appointments.map(a => `
      <div class="p-3 bg-light border rounded d-flex justify-content-between align-items-center">
        <div>
          <h5 class="h6 fw-bold text-dark mb-1">${escapeHtml(a.patient ? a.patient.name : 'Unknown')}</h5>
          <p class="mb-0 text-muted" style="font-size:11px;"><i class="far fa-calendar-alt me-1"></i>${new Date(a.date).toLocaleString()} | <span class="text-info">Dr. ${escapeHtml(a.doctor ? a.doctor.name : 'Unassigned')}</span></p>
          <p class="mb-0 text-dark small mt-1"><strong class="text-secondary">Brief:</strong> ${escapeHtml(a.symptoms)}</p>
        </div>
        <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 text-uppercase" style="font-size:10px;">${escapeHtml(a.status)}</span>
      </div>
    `).join('');
  } catch (err) {
    console.error("Dashboard synchronization error:", err.message);
  }
}

appointmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  feedback.className = "d-none alert";

  const payload = {
    patientId: patientSelect.value,
    doctorId: doctorSelect.value,
    date: document.getElementById('dash-app-date').value,
    symptoms: document.getElementById('dash-app-symptoms').value.trim()
  };

  try {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Filing allocation failure.");

    feedback.className = "mt-3 alert alert-success d-block text-xs font-medium";
    feedback.textContent = "Appointment slot logged successfully!";
    appointmentForm.reset();
    await initDashboard();
  } catch (err) {
    feedback.className = "mt-3 alert alert-danger d-block text-xs font-medium";
    feedback.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
});

document.addEventListener('DOMContentLoaded', initDashboard);