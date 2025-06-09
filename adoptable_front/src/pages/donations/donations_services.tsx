// src/pages/donations/donations_services.ts

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

/**
 * Fetch all donations (incluye anonimo flag para cada entrada)
 */
export const fetchDonations = async (): Promise<Donation[]> => {
  const resp = await api.get<Donation[]>('donations/');
  return resp.data;
};

/**
 * Make a donation.
 * - amount: euros to donate
 * - token: your auth Bearer token
 * - anonimo: if true, appears as "Anonimo" in public feed
 */
export const donate = async (
  amount: number,
  token: string,
  anonimo: boolean
): Promise<Donation> => {
  // Ensure CSRF cookie and header present
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
