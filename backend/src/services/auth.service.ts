import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { emailService } from './email.service';
import logger from '../common/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export const generateAccessToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: IUser) => {
  return jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

const sanitizeUser = (user: IUser) => ({
  _id: user._id,
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  deliveryAddress: user.deliveryAddress,
  city: user.city,
  state: user.state,
  zipCode: user.zipCode,
  country: user.country,
  storeName: user.storeName,
  businessType: user.businessType,
  taxId: user.taxId,
  businessPhone: user.businessPhone,
  bankAccount: user.bankAccount,
  payoutEmail: user.payoutEmail,
  bio: user.bio,
  createdAt: (user as any).createdAt,
});

export const registerUser = async (data: Partial<IUser>) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const user = await User.create(data);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  // Trigger welcome email asynchronously
  emailService.sendWelcomeEmail(user.email, user.name, user.role).catch(err => {
    logger.warn('Failed to dispatch welcome email:', err);
  });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('No account found with this email address');
  }

  // Generate 6-digit verification OTP
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const resetExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  user.resetPasswordCode = resetCode;
  user.resetPasswordExpire = resetExpire;
  await user.save();

  // Send genuine email via EmailService
  const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, resetCode);

  return {
    success: true,
    message: `Verification code sent to ${user.email}. Please check your inbox.`,
    email: user.email,
    previewUrl: emailResult.previewUrl,
    debugResetCode: resetCode,
  };
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  const user = await User.findOne({ 
    email,
    resetPasswordCode: code,
    resetPasswordExpire: { $gt: new Date() }
  }).select('+password +resetPasswordCode +resetPasswordExpire');

  if (!user) {
    throw new Error('Invalid or expired reset code. Please request a new code.');
  }

  user.password = newPassword;
  user.set('resetPasswordCode', undefined);
  user.set('resetPasswordExpire', undefined);
  await user.save();

  return { message: 'Password has been updated successfully. You can now sign in.' };
};

export const refreshAuthToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    const user = await User.findOne({ _id: decoded.id, refreshToken: token });

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const updateUserProfile = async (userId: string, data: Partial<IUser>) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const allowedFields: (keyof IUser)[] = [
    'name', 'phone', 'address', 'deliveryAddress', 'city', 'state', 'zipCode', 'country',
    'storeName', 'businessType', 'taxId', 'businessPhone', 'bankAccount', 'payoutEmail', 'bio'
  ];

  allowedFields.forEach((field) => {
    if ((data as any)[field] !== undefined) {
      (user as any)[field] = (data as any)[field];
    }
  });

  await user.save();
  return { user: sanitizeUser(user) };
};

export const changeUserPassword = async (userId: string, currentPass: string, newPass: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPass);
  if (!isMatch) {
    throw new Error('Current password does not match');
  }

  user.password = newPass;
  await user.save();
  return { message: 'Password updated successfully' };
};
