const WEEK = 60 * 60 * 24 * 7;

export function setSession(token: string, role: string) {
    document.cookie = `token=${token}; path=/; max-age=${WEEK}; SameSite=Lax`;
    document.cookie = `role=${role}; path=/; max-age=${WEEK}; SameSite=Lax`;
    localStorage.setItem('token', token);
}

export function clearSession() {
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'role=; path=/; max-age=0';
    localStorage.removeItem('token');
}