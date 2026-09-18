import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as authService from '../services/auth.service';
import { User } from '../models/User';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
    
    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ user, accessToken });
  } catch (error: any) {
    if (error.message === 'Email already in use') {
      res.status(409).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    // Store refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ user, accessToken });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    
    if (!token) {
      res.status(401).json({ message: 'Refresh token missing' });
      return;
    }

    const { accessToken, refreshToken } = await authService.refreshAuthToken(token);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      // Decode locally just to get ID, or we could require authentication for logout
      // For simplicity, we just clear cookie if we can't decode
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token) as { id: string } | null;
        if (decoded && decoded.id) {
          await authService.logoutUser(decoded.id);
        }
      } catch (e) {}
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message.includes('No account found')) {
      res.status(404).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, code, newPassword, password } = req.body;
    const pwd = newPassword || password;
    const result = await authService.resetPassword(email, code, pwd);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message.includes('Invalid or expired')) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const upgradeToVendor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = 'vendor';
    await user.save();

    res.json({
      message: 'Successfully upgraded to vendor',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await authService.updateUserProfile(userId, req.body);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: result.user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const result = await authService.changeUserPassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: result.message });
  } catch (error: any) {
    if (error.message.includes('Current password does not match')) {
      res.status(400).json({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, googleId, avatar } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Google account email is required' });
      return;
    }

    const { user, accessToken, refreshToken } = await authService.googleAuthUser({
      email,
      name,
      googleId,
      avatar,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user,
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};
