export function validateAuthHeader() {
    const token = localStorage.getItem('authToken');
    return { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' } };
}