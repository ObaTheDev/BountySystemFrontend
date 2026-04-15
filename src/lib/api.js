export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://gigs-ugkz.onrender.com/api/v1';

export const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const setAuthToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
    }
};

export const getAuthRole = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('userRole');
    }
    return null;
}

export const setAuthRole = (role) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', role);
    }
}

export const clearAuth = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('activeTaskId');
    }
};

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            if (typeof window !== 'undefined') {
                clearAuth();
                window.location.href = '/';
            }
        }

        const errorText = await response.text();
        let errorObj;
        try {
            errorObj = JSON.parse(errorText);
        } catch (e) {
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        let errorMessage = errorObj.message || errorObj.detail;

        if (typeof errorObj === 'object' && !errorObj.message && !errorObj.detail) {
            errorMessage = "Validation Error: " + JSON.stringify(errorObj);
        }

        throw new Error(errorMessage || 'API request failed');
    }
    return response.json();
}

export const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    return handleResponse(response);
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
    const res = await apiCall('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (res.data && res.data.access) {
        setAuthToken(res.data.access);
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', res.data.refresh);
        }
        setAuthRole(res.data.role);
    }
    return res;
}

export const register = async (data) => {
    return await apiCall('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

/**
 * Logout — blacklists the refresh token on the server then clears local auth.
 */
export const logout = async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    try {
        if (refreshToken) {
            await apiCall('/auth/logout/', {
                method: 'POST',
                body: JSON.stringify({ refresh: refreshToken })
            });
        }
    } catch (err) {
        // Even if the server call fails, clear client-side tokens
        console.warn('Logout API call failed (token may be expired):', err.message);
    } finally {
        clearAuth();
    }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export const getProfile = async () => {
    return await apiCall('/profile/me/');
}

export const updateProfile = async (data) => {
    return await apiCall('/profile/me/', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export const updateBankDetails = async (data) => {
    return await apiCall('/profile/bank-details/', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

// ─── Student ─────────────────────────────────────────────────────────────────

export const getStudentDashboard = async () => {
    return await apiCall('/student/dashboard/');
}

export const getStudentAssignments = async () => {
    return await apiCall('/tasks/student/assignments/');
}

// ─── Department ──────────────────────────────────────────────────────────────

export const getDeptTasks = async () => {
    return await apiCall('/profile/dept/tasks/');
}

export const getDepartmentAssignments = async () => {
    return await apiCall('/tasks/department/assignments/');
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const getOpenTasks = async () => {
    return await apiCall('/tasks/');
}

export const createTask = async (data) => {
    return await apiCall('/tasks/', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

export const getTaskDetails = async (id) => {
    return await apiCall(`/tasks/${id}/`);
}

export const acceptTask = async (id) => {
    return await apiCall(`/tasks/${id}/accept/`, { method: 'POST' });
}

export const submitTask = async (id) => {
    return await apiCall(`/tasks/${id}/submit/`, { method: 'POST' });
}

export const confirmTask = async (id) => {
    return await apiCall(`/tasks/${id}/confirm/`, { method: 'POST' });
}

/**
 * Raise a dispute on a task.
 * Access: Student or Task Poster (Department)
 * api_reference: POST /tasks/<id>/raise-dispute/
 */
export const raiseDispute = async (id, reason) => {
    return await apiCall(`/tasks/${id}/raise-dispute/`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    });
}

/**
 * Legacy alias kept for backward compatibility — prefer raiseDispute().
 * The old endpoint /tasks/<id>/dispute/ is superseded by the hybrid dispute system.
 */
export const disputeTask = async (id, reason) => {
    return raiseDispute(id, reason);
}

/**
 * Department responds to a dispute with evidence.
 * api_reference: POST /tasks/disputes/<id>/respond/
 * Status after: automatically moves to `in_review`.
 */
export const respondToDispute = async (disputeId, deptResponse) => {
    return await apiCall(`/tasks/disputes/${disputeId}/respond/`, {
        method: 'POST',
        body: JSON.stringify({ dept_response: deptResponse })
    });
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export const getWalletBalance = async () => {
    return await apiCall('/wallet/balance/');
}

export const getWalletTransactions = async () => {
    return await apiCall('/wallet/transactions/');
}

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async () => {
    return await apiCall('/notifications/');
}

export const markNotificationRead = async (id) => {
    return await apiCall(`/notifications/${id}/read/`, { method: 'POST' });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/**
 * Admin resolves a dispute.
 * api_reference: POST /admin/disputes/<id>/resolve/
 * decision: "student" → credits wallet + marks task completed
 *           "department" → task cancelled
 */
export const resolveDispute = async (disputeId, decision, adminNotes = '') => {
    return await apiCall(`/admin/disputes/${disputeId}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({ decision, admin_notes: adminNotes })
    });
}

/**
 * Admin delete user.
 * api_reference: DELETE /admin/users/<id>/
 */
export const deleteUser = async (userId) => {
    return await apiCall(`/admin/users/${userId}/`, { method: 'DELETE' });
}
