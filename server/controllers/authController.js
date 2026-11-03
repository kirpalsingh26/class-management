import * as authService from '../services/authService.js';
import { generateToken } from '../utils/token.js';
import { asyncHandler } from '../utils/errorHandler.js';
import AppError from '../utils/AppError.js';

export const register = asyncHandler(async (req, res) => {
  throw new AppError(
    'Self-registration is disabled. Accounts are provisioned exclusively by Administrators and Teachers.',
    403
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  const user = await authService.loginUser({ email, password });
  const token = generateToken(user._id);
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
});

export const logout = asyncHandler(async (req, res) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    })
    .json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'User retrieved successfully',
    data: { user: req.user },
  });
});