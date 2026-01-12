import { Navigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';
import type { JSX } from 'react';

type Props = {
    children: JSX.Element;
    roles?: string[];
};

export default function RequireAuth({ children, roles }: Props) {
    const auth = getAuth();

    // ❌ Chưa login
    if (!auth) {
        return <Navigate to="/login" replace />;
    }

    // ❌ Sai role
    if (roles && !roles.includes(auth.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
