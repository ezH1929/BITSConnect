const API_URL = 'http://localhost:3001/api'; // Adjust if your API URL is different

export const getGroups = async () => {
  const response = await fetch(`${API_URL}/groups`);
  return response.json();
};
