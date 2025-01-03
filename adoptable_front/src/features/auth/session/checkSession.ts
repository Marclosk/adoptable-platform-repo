import axios from 'axios'; 

const API_URL_session = "http://localhost:8000/users/check_session/";

export const checkSession = async () => {
  try {
    const response = await axios.get(API_URL_session); 
    if (response.status === 200) {
      return true; 
    }
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    return false; 
  }
};
