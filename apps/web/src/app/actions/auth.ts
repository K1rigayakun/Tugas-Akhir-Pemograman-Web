'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { postApi } from '../../lib/api';
import { serverGetApi } from './apiProxy';

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email');
    const password = formData.get('password');

    const result = await postApi<any>('/auth/login', {
      email,
      password,
    });

    if (result.requires2fa) {
      return { 
        success: true, 
        requires2fa: true, 
        requires2faSetup: result.requires2faSetup,
        tempToken: result.tempToken,
        qrCodeUrl: result.qrCodeUrl,
        secret: result.secret
      };
    }

    const cookieStore = cookies();
    cookieStore.set('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 2 * 60 * 60 });
    cookieStore.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });
    
    revalidatePath('/', 'layout');

    return { success: true, requires2fa: false };
  } catch (error: any) {
    return { success: false, message: error.message || 'Login gagal.' };
  }
}

export async function verifyEmailAction(email: string, formData: FormData) {
  try {
    const otp = formData.get('otp');
    const result = await postApi<{ accessToken: string; refreshToken: string }>('/auth/verify-email', { email, otp });

    const cookieStore = cookies();
    cookieStore.set('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 2 * 60 * 60 });
    cookieStore.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });
    
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Verifikasi gagal.' };
  }
}

export async function setup2faAction(tempToken: string, code: string) {
  try {
    const result = await postApi<{ accessToken: string; refreshToken: string }>('/auth/2fa/setup', { tempToken, code });

    const cookieStore = cookies();
    cookieStore.set('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 2 * 60 * 60 });
    cookieStore.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Setup 2FA gagal.' };
  }
}

export async function verify2faAction(tempToken: string, code: string) {
  try {
    const result = await postApi<{ accessToken: string; refreshToken: string }>('/auth/2fa/verify', { tempToken, code });

    const cookieStore = cookies();
    cookieStore.set('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 2 * 60 * 60 });
    cookieStore.set('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 24 * 60 * 60 });

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Verifikasi 2FA gagal.' };
  }
}

export async function checkKycAction() {
  try {
    const user = await serverGetApi<any>('/auth/me');
    return user.kycStatus || 'UNVERIFIED';
  } catch (error) {
    return 'UNVERIFIED';
  }
}

export async function fetchMyCosmeticsAction() {
  try {
    return await serverGetApi<any[]>('/auth/me/cosmetics');
  } catch (error) {
    return [];
  }
}
