import { getCurrentUser } from './auth';
import { API_BASE_URL } from './apiConfig';
import type { FoodRestrictions } from './foodRestrictions';

const API_URL = import.meta.env.VITE_API_DATA_URL || `${API_BASE_URL}/user_data.php`;

function throwForResponse(response: Response, result: { success?: boolean; locked?: boolean; message?: string }): void {
  if (response.status === 403 && result.locked === true) {
    window.dispatchEvent(new Event('fitplanner:subscription-locked'));
  }
  if (!response.ok || result.success === false) throw new Error(result.message || 'Request failed.');
}

export interface UserProfile {
  height_cm: number;
  weight_kg: number;
  bmi: number;
  bmi_category: string;
  goal: string;
}

export interface CustomerProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_photo: string | null;
}

export interface MedicalHistory {
  hasConditions: boolean;
  conditions: string[];
}

async function request<T>(payload: Record<string, unknown>): Promise<T> {
  const user = getCurrentUser();
  if (!user?.id) throw new Error('Please log in first.');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': user.token,
    },
    body: JSON.stringify({ ...payload, userId: user.id }),
  });
  const result = await response.json();
  throwForResponse(response, result);
  return result as T;
}

export function getProfile() {
  return request<{ success: true; profile: UserProfile | null }>({ action: 'get_profile' });
}

export function saveProfile(heightCm: number, weightKg: number, goal: string) {
  return request<{ success: true; profile: UserProfile }>({ action: 'save_profile', heightCm, weightKg, goal });
}

export function getCustomerProfile() {
  return request<{ success: true; profile: CustomerProfile | null }>({ action: 'get_customer_profile' });
}

export async function saveCustomerProfile(
  phone: string,
  email: string,
  currentPassword: string,
  newPassword: string,
  photo?: File
) {
  const user = getCurrentUser();
  if (!user?.id) throw new Error('Please log in first.');

  const formData = new FormData();
  formData.append('action', 'save_customer_profile');
  formData.append('userId', user.id);
  formData.append('phone', phone);
  formData.append('email', email);
  formData.append('currentPassword', currentPassword);
  formData.append('newPassword', newPassword);
  if (photo) formData.append('profilePhoto', photo);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'X-Auth-Token': user.token },
    body: formData,
  });
  const result = await response.json();
  throwForResponse(response, result);
  return result as { success: true; profile: CustomerProfile | null };
}

export function getCustomerPhotoUrl(photoPath: string) {
  return new URL(photoPath, API_URL).toString();
}

export function getMedicalHistory() {
  return request<{ success: true; medicalHistory: MedicalHistory | null }>({ action: 'get_medical' });
}

export function saveMedicalHistory(history: MedicalHistory) {
  return request<{ success: true }>({ action: 'save_medical', ...history });
}

export function getFoodRestrictions() {
  return request<{ success: true; foodRestrictions: FoodRestrictions | null }>({ action: 'get_food' });
}

export function saveFoodRestrictions(restrictions: FoodRestrictions) {
  return request<{ success: true }>({ action: 'save_food', ...restrictions });
}

export function logActivity(activity: string, email?: string) {
  return request<{ success: true }>({ action: 'log_activity', activity, email });
}