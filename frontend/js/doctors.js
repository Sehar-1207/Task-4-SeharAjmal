import { API_BASE, escapeHtml } from './api.js';

const doctorForm = document.getElementById('doctor-form');
const feedback = document.getElementById('doctor-feedback');
const submitBtn = document.getElementById('d-submit-btn');
const doctorsList = document.getElementById('doctors-list');

const updateForm = document.getElementById('update-doctor-form');
const updateFeedback = document.getElementById('edit-d-feedback');
const updateSubmitBtn = document.getElementById('edit-d-submit');
let bsModalInstance = null;

const toastElement = document.getElementById('toast-feedback');
const toastText = document.getElementById('toast-text');
const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });

function showSystemToast(message, isDanger = false) {
  toastElement.className = `toast align-items-center text-white border-0 ${isDanger ? 'bg-danger' : 'bg-dark'}`;
  toastText.textContent = message;
  bsToast.show();
}

async function loadDoctorsList() {
  try {
    const response = await fetch(`${API_BASE}/doctors`);
    const doctors = await response.json();

    if (!response.ok || !Array.isArray(doctors) || doctors.length === 0) {
      doctorsList.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-5 text-muted">
            <p class="mb-0 small">No medical specialists onboarded in the registry.</p>
          </td>
        </tr>`;
      return;
    }

    doctorsList.innerHTML = doctors.map(d => {
      const dData = encodeURIComponent(JSON.stringify(d));
      return `
        <tr>
          <td>
            <div class="fw-bold text-dark">Dr. ${escapeHtml(d.name)}</div>
            <div class="text-muted font-monospace small" style="font-size: 11px;">ID: ${d._id}</div>
          </td>
          <td>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 mb-1 text-uppercase fw-semibold" style="font-size: 11px;">
              ${escapeHtml(d.specialty)}
            </span>
            <div class="small text-muted"><i class="far fa-envelope me-1.5 opacity-70"></i>${escapeHtml(d.email)}</div>
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-secondary btn-edit-doctor" data-doctor="${dData}">
                <i class="fas fa-edit text-dark"></i> Edit
              </button>
              <button type="button" class="btn btn-outline-danger btn-delete-doctor" data-id="${d._id}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachActionEventListeners();
  } catch (err) {
    console.error("Error loading staff directory:", err.message);
    doctorsList.innerHTML = `<tr><td colspan="3" class="text-danger small p-3 text-center">Failed to connect to background directory services.</td></tr>`;
  }
}

function attachActionEventListeners() {
  document.querySelectorAll('.btn-edit-doctor').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rawData = e.currentTarget.getAttribute('data-doctor');
      const doctor = JSON.parse(decodeURIComponent(rawData));

      document.getElementById('edit-d-id').value = doctor._id;
      document.getElementById('edit-d-name').value = doctor.name;
      document.getElementById('edit-d-specialty').value = doctor.specialty;
      document.getElementById('edit-d-email').value = doctor.email;

      updateFeedback.className = "d-none alert";
      
      if (!bsModalInstance) {
        bsModalInstance = new bootstrap.Modal(document.getElementById('updateDoctorModal'));
      }
      bsModalInstance.show();
    });
  });

  document.querySelectorAll('.btn-delete-doctor').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm("Are you sure you want to offboard this clinical specialist and erase their profile?")) return;

      try {
        const response = await fetch(`${API_BASE}/doctors/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Offboarding sequence request denied.");
        
        showSystemToast("Clinician offboarded and file removed from directory records.");
        await loadDoctorsList();
      } catch (err) {
        showSystemToast("Removal action failure: " + err.message, true);
      }
    });
  });
}

doctorForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  feedback.className = "d-none alert";

  const payload = {
    name: document.getElementById('d-name').value.trim(),
    specialty: document.getElementById('d-specialty').value.trim(),
    email: document.getElementById('d-email').value.trim()
  };

  try {
    const response = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Onboarding pipeline breakdown.");

    feedback.className = "mt-3 alert alert-success d-block text-xs font-medium";
    feedback.textContent = `Success! Dr. ${escapeHtml(data.name)} has been onboarded safely.`;
    doctorForm.reset();
    await loadDoctorsList();
  } catch (error) {
    feedback.className = "mt-3 alert alert-danger d-block text-xs font-medium";
    feedback.textContent = error.message;
  } finally {
    submitBtn.disabled = false;
  }
});

if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateSubmitBtn.disabled = true;
    updateFeedback.className = "d-none alert";

    const id = document.getElementById('edit-d-id').value;
    const payload = {
      name: document.getElementById('edit-d-name').value.trim(),
      specialty: document.getElementById('edit-d-specialty').value.trim(),
      email: document.getElementById('edit-d-email').value.trim()
    };

    try {
      const response = await fetch(`${API_BASE}/doctors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Credential modification assignment rejected.");

      bsModalInstance.hide();
      showSystemToast("Changes saved successfully! Staff directory updated.");
      await loadDoctorsList();
    } catch (error) {
      updateFeedback.className = "mt-3 alert alert-danger d-block small fw-medium";
      updateFeedback.textContent = error.message;
    } finally {
      updateSubmitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', loadDoctorsList);