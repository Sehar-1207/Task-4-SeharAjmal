import { API_BASE, escapeHtml } from './api.js';

const patientForm = document.getElementById('standalone-patient-form');
const patientsList = document.getElementById('standalone-patients-list');
const feedback = document.getElementById('sp-patient-feedback');
const submitBtn = document.getElementById('sp-submit-btn');
const countBadge = document.getElementById('total-patient-badge');

// Elements for the Update Modal Context Window Box
const updateForm = document.getElementById('update-patient-form');
const updateFeedback = document.getElementById('edit-p-feedback');
const updateSubmitBtn = document.getElementById('edit-p-submit');
let bsModalInstance = null;

async function loadPatientsList() {
  try {
    const response = await fetch(`${API_BASE}/patients`);
    const patients = await response.json();
    
    if (countBadge) countBadge.textContent = `${patients.length} Cases`;

    if (!response.ok || !Array.isArray(patients) || patients.length === 0) {
      patientsList.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-5 text-muted">
            <p class="mb-0 small">No patient files exist in the registry.</p>
          </td>
        </tr>`;
      return;
    }

    patientsList.innerHTML = patients.map(p => {
      const pData = encodeURIComponent(JSON.stringify(p));
      return `
        <tr>
          <td>
            <div class="fw-bold text-dark">${escapeHtml(p.name)}</div>
            <div class="text-muted font-monospace small" style="font-size: 11px;">ID: ${p._id}</div>
          </td>
          <td>
            <div class="small"><i class="far fa-envelope me-1.5 opacity-70"></i>${escapeHtml(p.email)}</div>
            <div class="small text-muted"><i class="fas fa-phone me-1.5 opacity-70"></i>${escapeHtml(p.phone)}</div>
          </td>
          <td>
            <span class="badge bg-secondary bg-opacity-10 text-dark border me-1">${escapeHtml(p.gender || 'N/A')}</span>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Blood: ${escapeHtml(p.bloodType || 'N/A')}</span>
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-secondary btn-edit-patient" data-patient="${pData}">
                <i class="fas fa-edit text-dark"></i> Edit
              </button>
              <button type="button" class="btn btn-outline-danger btn-delete-patient" data-id="${p._id}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachActionEventListeners();
  } catch (err) {
    console.error("Error loading patient list:", err.message);
    patientsList.innerHTML = `<tr><td colspan="4" class="text-danger small p-3 text-center">Failed to connect to backend registry database.</td></tr>`;
  }
}

function attachActionEventListeners() {
  // Bind Action: Launch Update Window and Bind Data
  document.querySelectorAll('.btn-edit-patient').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rawData = e.currentTarget.getAttribute('data-patient');
      const patient = JSON.parse(decodeURIComponent(rawData));

      document.getElementById('edit-p-id').value = patient._id;
      document.getElementById('edit-p-name').value = patient.name;
      document.getElementById('edit-p-email').value = patient.email;
      document.getElementById('edit-p-phone').value = patient.phone;
      document.getElementById('edit-p-gender').value = patient.gender || 'Male';
      document.getElementById('edit-p-blood').value = patient.bloodType || 'A+';

      updateFeedback.className = "d-none alert";
      
      if (!bsModalInstance) {
        bsModalInstance = new bootstrap.Modal(document.getElementById('updatePatientModal'));
      }
      bsModalInstance.show();
    });
  });

  // Bind Action: Discard/Purge Entry via Delete Request Pipeline
  document.querySelectorAll('.btn-delete-patient').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm("Are you absolutely sure you want to completely purge this historical file directory?")) return;

      try {
        const response = await fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Purge sequence execution rejection exception.");
        await loadPatientsList();
      } catch (err) {
        alert("Removal failure action error: " + err.message);
      }
    });
  });
}

// Global Submission Pipeline Handling: Creating Entries
if (patientForm) {
  patientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    feedback.className = "d-none alert";

    const payload = {
      name: document.getElementById('sp-name').value.trim(),
      email: document.getElementById('sp-email').value.trim(),
      phone: document.getElementById('sp-phone').value.trim(),
      dateOfBirth: document.getElementById('sp-dob').value,
      gender: document.getElementById('sp-gender').value,
      bloodType: document.getElementById('sp-blood').value
    };

    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || data.details || "Profile registration error.");

      feedback.className = "mt-3 alert alert-success d-block small fw-medium";
      feedback.textContent = "Success! Patient added to system records.";
      patientForm.reset();
      await loadPatientsList();
    } catch (error) {
      feedback.className = "mt-3 alert alert-danger d-block small fw-medium";
      feedback.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Global Submission Pipeline Handling: Mutating Existing Entries
if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateSubmitBtn.disabled = true;
    updateFeedback.className = "d-none alert";

    const id = document.getElementById('edit-p-id').value;
    const payload = {
      name: document.getElementById('edit-p-name').value.trim(),
      email: document.getElementById('edit-p-email').value.trim(),
      phone: document.getElementById('edit-p-phone').value.trim(),
      gender: document.getElementById('edit-p-gender').value,
      bloodType: document.getElementById('edit-p-blood').value
    };

    try {
      const response = await fetch(`${API_BASE}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Modification adjustment engine exception.");

      bsModalInstance.hide();
      await loadPatientsList();
    } catch (error) {
      updateFeedback.className = "mt-3 alert alert-danger d-block small fw-medium";
      updateFeedback.textContent = error.message;
    } finally {
      updateSubmitBtn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', loadPatientsList);