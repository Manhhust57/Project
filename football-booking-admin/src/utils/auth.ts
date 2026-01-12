import { jwtDecode } from "jwt-decode";




export function getAuth() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload: any = jwtDecode(token);
        return {
            token,
            role: payload.role,
            userId: payload.userId,
        };
    } catch {
        return null;
    }
}
