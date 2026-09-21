export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      userId: payload.userId,
      username: payload.username,
      userRole: payload.role,
    };
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};

