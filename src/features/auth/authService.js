export const saveToken = (token) => {
  localStorage.setItem("adminToken", token);
};

export const getToken = () => {
  return localStorage.getItem("adminToken");
};

export const removeToken = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminLoginId");
};

export const isAuthenticated = () => {
  return !!getToken();
};
