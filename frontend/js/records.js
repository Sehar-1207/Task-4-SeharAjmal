import { API_BASE, escapeHtml } from './api.js';

const patientSelect = document.getElementById('rec-patient-select');
const doctorSelect = document.getElementById('rec-doctor-select');
const recordForm = document.getElementById('record-form');
const feedback = document.getElementById('record-feedback');
const submitBtn = document.getElementById('rec-submit-btn');
const recordsList = document.getElementById('records-list');

const editPatientSelect = document.getElementById('edit-rec-patient');
const editDoctorSelect = document.getElementById('edit-rec-doctor');
const updateForm = document.getElementById('update-record-form');
const updateFeedback = document.getElementById('edit-rec-feedback');
const updateSubmitBtn = document.getElementById('edit-rec-submit');

let editModalInstance = null;
let deleteModalInstance = null;
let recordIdToPurge = null;

const toastElement = document.getElementById('toast-feedback');
const toastText = document.getElementById('toast-text');
const bsToast = new bootstrap.Toast(toastElement, { delay: 4000 });

function showSystemToast(message, isDanger = false) {
  toastElement.className = `toast align-items-center text-white border-0 ${isDanger ? 'bg-danger' : 'bg-dark'}`;
  toastText.textContent = message;
  bsToast.show();
}

async function loadDropdowns() {
  try {
    const [patRes, docRes] = await Promise.all([
      fetch(`${API_BASE}/patients`),
      fetch(`${API_BASE}/doctors`)
    ]);
    const patients = await patRes.json();
    const doctors = await docRes.json();

    const patOptions = patients.map(p => `<option value="${p._id}">${escapeHtml(p.name)}</option>`).join('');
    const docOptions = doctors.map(d => `<option value="${d._id}">Dr. ${escapeHtml(d.name)}</option>`).join('');

    patientSelect.innerHTML = patOptions;
    doctorSelect.innerHTML = docOptions;
    if (editPatientSelect) editPatientSelect.innerHTML = patOptions;
    if (editDoctorSelect) editDoctorSelect.innerHTML = docOptions;
  } catch (err) {
    console.error(err);
    showSystemToast("Failed to initialize registry options.", true);
  }
}

async function loadRecordsList() {
  try {
    const response = await fetch(`${API_BASE}/records`);
    const records = await response.json();

    if (!response.ok || !Array.isArray(records) || records.length === 0) {
      recordsList.innerHTML = `<tr><td colspan="4" class="text-center py-5 text-muted">No charts found in database.</td></tr>`;
      return;
    }

    recordsList.innerHTML = records.map(r => {
      const rData = encodeURIComponent(JSON.stringify(r));
      const pName = r.patient?.name || 'Unknown Case File';
      const dName = r.doctor?.name || 'Unassigned Staff';
      
      return `
        <tr>
          <td>
            <div class="fw-bold">${escapeHtml(pName)}</div>
            <div class="small text-muted">Dr. ${escapeHtml(dName)}</div>
          </td>
          <td><span class="text-break">${escapeHtml(r.diagnosis)}</span></td>
          <td>
            <div class="font-monospace small">BP: ${r.vitals?.bloodPressure || 'N/A'}</div>
            <div class="font-monospace small text-muted">HR: ${r.vitals?.heartRate ? r.vitals.heartRate + ' bpm' : 'N/A'}</div>
          </td>
          <td class="text-end text-nowrap">
            <button class="btn btn-sm btn-outline-secondary me-1 btn-edit-record" data-record="${rData}"><i class="fas fa-edit me-1"></i>Edit</button>
            <button class="btn btn-sm btn-outline-danger btn-delete-record" data-id="${r._id}"><i class="fas fa-trash me-1"></i>Delete</button>
          </td>
        </tr>
      `;
    }).join('');
    attachActionEventListeners();
  } catch (err) {
    recordsList.innerHTML = `<tr><td colspan="4" class="text-danger text-center py-4"><i class="fas fa-exclamation-circle me-2"></i>Failed to fetch clinical records ledger.</td></tr>`;
  }
}

function attachActionEventListeners() {
  document.querySelectorAll('.btn-edit-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rec = JSON.parse(decodeURIComponent(e.currentTarget.getAttribute('data-record')));
      document.getElementById('edit-rec-id').value = rec._id;
      document.getElementById('edit-rec-patient').value = rec.patient?._id || '';
      document.getElementById('edit-rec-doctor').value = rec.doctor?._id || '';
      document.getElementById('edit-rec-diagnosis').value = rec.diagnosis;
      document.getElementById('edit-v-bp').value = rec.vitals?.bloodPressure || '';
      document.getElementById('edit-v-hr').value = rec.vitals?.heartRate || '';
      document.getElementById('edit-v-temp').value = rec.vitals?.temperature || '';
      document.getElementById('edit-med-name').value = rec.prescription?.[0]?.medication || '';
      document.getElementById('edit-med-dosage').value = rec.prescription?.[0]?.dosage || '';
      document.getElementById('edit-med-freq').value = rec.prescription?.[0]?.frequency || '';
      document.getElementById('edit-rec-notes').value = rec.notes || '';
      
      if (!editModalInstance) editModalInstance = new bootstrap.Modal(document.getElementById('updateRecordModal'));
      editModalInstance.show();
    });
  });

  document.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      recordIdToPurge = e.currentTarget.getAttribute('data-id');
      if (!deleteModalInstance) deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
      deleteModalInstance.show();
    });
  });
}

document.getElementById('confirm-purge-btn').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/records/${recordIdToPurge}`, { method: 'DELETE' });
    if (res.ok) {
      if (deleteModalInstance) deleteModalInstance.hide();
      loadRecordsList();
      showSystemToast("Clinical log record purged successfully.", true);
    } else {
      showSystemToast("Could not drop file entry.", true);
    }
  } catch (err) {
    console.error(err);
    showSystemToast("Network gateway timeout exception.", true);
  }
});

recordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    patientId: patientSelect.value,
    doctorId: doctorSelect.value,
    diagnosis: document.getElementById('rec-diagnosis').value,
    vitals: {
      bloodPressure: document.getElementById('v-bp').value,
      heartRate: parseInt(document.getElementById('v-hr').value) || null,
      temperature: parseFloat(document.getElementById('v-temp').value) || null
    },
    prescription: [{
      medication: document.getElementById('med-name').value,
      dosage: document.getElementById('med-dosage').value,
      frequency: document.getElementById('med-freq').value
    }],
    notes: document.getElementById('rec-notes').value
  };

  try {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      recordForm.reset();
      loadRecordsList();
      showSystemToast("Medical ledger update committed.");
    } else {
      showSystemToast("Validation reject received from server.", true);
    }
  } catch (err) {
    showSystemToast("Network transaction error.", true);
  }
});

if (updateForm) {
  updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-rec-id').value;
    const payload = {
      patient: document.getElementById('edit-rec-patient').value,
      doctor: document.getElementById('edit-rec-doctor').value,
      diagnosis: document.getElementById('edit-rec-diagnosis').value,
      vitals: {
        bloodPressure: document.getElementById('edit-v-bp').value,
        heartRate: parseInt(document.getElementById('edit-v-hr').value) || null,
        temperature: parseFloat(document.getElementById('edit-v-temp').value) || null
      },
      prescription: [{
        medication: document.getElementById('edit-med-name').value,
        dosage: document.getElementById('edit-med-dosage').value,
        frequency: document.getElementById('edit-med-freq').value
      }],
      notes: document.getElementById('edit-rec-notes').value
    };

    try {
      const res = await fetch(`${API_BASE}/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editModalInstance) editModalInstance.hide();
        loadRecordsList();
        showSystemToast("Consultation modifications saved.");
      } else {
        showSystemToast("Save rejected by backend validation rules.", true);
      }
    } catch (err) {
      showSystemToast("Unable to complete cloud rewrite pipeline.", true);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadDropdowns();
  loadRecordsList();
});