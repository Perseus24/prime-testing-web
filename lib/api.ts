const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const isForm = init.body instanceof FormData;

    console.log("fetching", `${BASE}${path}`, init);
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
        Accept: 'application/json',
        ...(init.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
        },
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
    }
    if (!res.ok) throw await res.json();
    return res.json();
}