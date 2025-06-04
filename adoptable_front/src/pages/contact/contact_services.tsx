import axios from 'axios';

const API_URL = 'http://localhost:8000/api/contact/';

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

export const sendContactMessage = async (
  contact: ContactData
): Promise<void> => {
  try {
    await axios.post(API_URL, contact, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken(),
      },
    });
  } catch (error: unknown) {
    console.error('Error al enviar el mensaje de contacto:', error);
    throw error;
  }
};

export const getCSRFToken = (): string => {
  const csrfCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='));
  return csrfCookie ? csrfCookie.split('=')[1] : '';
};
