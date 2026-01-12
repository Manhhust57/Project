import { jwtDecode } from "jwt-decode";


type Payload = {
    userId: number;
    role: 'ADMIN' | 'OWNER' | 'USER';
};

export function getAuth() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        return jwtDecode<Payload>(token);
    } catch {
        return null;
    }
}
