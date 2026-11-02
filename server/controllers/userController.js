import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Profile retrieved successfully',
    data: { user: req.user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, profileImage } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (profileImage !== undefined) updates.profileImage = profileImage;

  const user = await authService.updateUserProfile(req.user._id, updates);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changeUserPassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  res.json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});