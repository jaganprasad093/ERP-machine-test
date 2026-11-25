import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const res = await api.get('/admins/stats');
    return res.data;
  },

  getAdmins: async (params = {}) => {
    const res = await api.get('/admins', { params });
    return res.data;
  },

  getAdminById: async (id) => {
    const res = await api.get(`/admins/${id}`);
    return res.data;
  },

  createAdmin: async (adminData) => {
    const res = await api.post('/admins', adminData);
    return res.data;
  },

  updateAdmin: async (id, adminData) => {
    const res = await api.put(`/admins/${id}`, adminData);
    return res.data;
  },

  changeStatus: async (id, status) => {
    const res = await api.patch(`/admins/${id}/status`, { status });
    return res.data;
  },

  resetPassword: async (id, password, confirmPassword) => {
    const res = await api.patch(`/admins/${id}/reset-password`, {
      password,
      confirmPassword
    });
    return res;
  },

  deleteAdmin: async (id) => {
    const res = await api.delete(`/admins/${id}`);
    return res;
  }
};
