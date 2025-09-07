export function renderDocuments() {
    const container = document.getElementById('documents-container');
    container.innerHTML = '';
    window.documents.forEach(d => container.innerHTML += `<div>${d.title}</div>`);
}

export function openDocumentModal(docId = null) {
    const modal = document.getElementById('document-modal');
    modal.style.display = 'block';
}