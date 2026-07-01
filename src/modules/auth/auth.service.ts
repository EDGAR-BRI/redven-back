import { supabase } from '../../lib/supabase';
import { RegisterInput, LoginInput, VerifyOtpInput, ForgotPasswordInput, ResetPasswordInput, UpdateProfileInput } from './auth.schema';
import { prisma } from '../../lib/prisma';

export async function register(data: RegisterInput) {
  const { data: authData, error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: 'user',
    },
  });

  if (error) throw new Error(error.message);

  await prisma.user.create({
    data: {
      id: authData.user!.id,
      email: data.email,
      full_name: data.full_name,
      role: 'user',
    },
  });

  return {
    user: {
      id: authData.user!.id,
      email: authData.user!.email,
      full_name: data.full_name,
    },
  };
}

export async function login(data: LoginInput) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);

  return {
    user: {
      id: authData.user!.id,
      email: authData.user!.email,
    },
    session: {
      access_token: authData.session!.access_token,
      refresh_token: authData.session!.refresh_token,
      expires_at: authData.session!.expires_at,
    },
  };
}

export async function verifyOtp(data: VerifyOtpInput) {
  const { data: authData, error } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.otpCode,
    type: 'signup',
  });

  if (error) throw new Error(error.message);

  return {
    user: {
      id: authData.user!.id,
      email: authData.user!.email,
    },
    session: {
      access_token: authData.session!.access_token,
      refresh_token: authData.session!.refresh_token,
      expires_at: authData.session!.expires_at,
    },
  };
}

export async function forgotPassword(data: ForgotPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
  });

  if (error) throw new Error(error.message);
  return { message: 'Correo de recuperación enviado' };
}

export async function resetPassword(data: ResetPasswordInput) {
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword,
  });

  if (error) throw new Error(error.message);
  return { message: 'Contraseña actualizada' };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}

export async function updateMe(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
  });

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { full_name: data.full_name },
  });

  return user;
}
