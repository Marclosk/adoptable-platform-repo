import axios from 'axios';
import { fetchCSRFToken, getCSRFToken } from '../profile/user_services';

export interface Donation {
  id: number;
  usuario: string;
  cantidad: number;
  fecha: string;
  anonimo: boolean;
}

const api = axios.create({
  baseURL: '/api/',
  withCredentials: true,
});

export const fetchDonations = async (): Promise<Donation[]> => {
  const resp = await api.get<Donation[]>('donations/');
  return resp.data;
};

export const donate = async (
  amount: number,
  token: string,
  anonimo: boolean
): Promise<Donation> => {
  await fetchCSRFToken();

  const resp = await api.post<Donation>(
    'donations/add/',
    { cantidad: amount, anonimo },
    {
      headers: {
        'X-CSRFToken': getCSRFToken(),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return resp.data;
};
