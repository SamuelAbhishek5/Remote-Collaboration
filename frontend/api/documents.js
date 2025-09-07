import { API_ENDPOINTS } from '../app.js';
import { getAuthHeader } from '../utils/authHeader.js';
import { renderDocuments } from '../ui/documentsUI.js';
import { logActivity } from './activities.js';

export function loadDocuments() {
    Promise.all([
        fetch(API_ENDPOINTS.DOCUMENTS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([documentsData, projectsData]) => {
        window.documents = documentsData;
        window.projects = projectsData;
        renderDocuments();
    });
}

export function handleDocumentSubmit(e) {
    e.preventDefault();
    const documentData = {
        id: document.getElementById('document-id').value,
        title: document.getElementById('document-title').value,
        description: document.getElementById('document-description').value,
        projectId: document.getElementById('document-project').value,
        type: document.getElementById('document-type').value
    };

    const method = documentData.id ? 'PUT' : 'POST';
    const url = documentData.id ? `${API_ENDPOINTS.DOCUMENTS}/${documentData.id}` : API_ENDPOINTS.DOCUMENTS;

    fetch(url, {
        method,
        headers: getAuthHeader().headers,
        body: JSON.stringify(documentData)
    })
    .then(res => res.json())
    .then(data => {
        if (documentData.id) {
            const idx = window.documents.findIndex(d => d._id === documentData.id);
            window.documents[idx] = data;
        } else {
            window.documents.push(data);
        }
        renderDocuments();
        logActivity(documentData.id ? 'Document updated' : 'Document created', 'document', data.title);
    });
}