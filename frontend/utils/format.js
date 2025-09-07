export function formatDate(date) { return date.toLocaleDateString(); }
export function formatTimeAgo(date) { return 'just now'; }
export function formatStatus(status) { return status; }
export function formatDocType(type) { return type; }
export function formatDateForInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}