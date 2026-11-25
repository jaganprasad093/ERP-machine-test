const { z } = require('zod');
const { USER_STATUS } = require('../models/User');

const createAdminSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: 'Full name is required' })
        .trim()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
      email: z
        .string({ required_error: 'Email address is required' })
        .trim()
        .email('Please enter a valid email address'),
      phone: z
        .string({ required_error: 'Phone number is required' })
        .trim()
        .min(7, 'Phone number must be at least 7 characters')
        .max(20, 'Phone number cannot exceed 20 characters'),
      password: z
        .string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters long'),
      confirmPassword: z
        .string({ required_error: 'Confirm password is required' })
        .min(1, 'Please confirm password'),
      status: z
        .enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE], {
          errorMap: () => ({ message: 'Status must be ACTIVE or INACTIVE' })
        })
        .default(USER_STATUS.ACTIVE)
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Password and confirm password do not match',
      path: ['confirmPassword']
    })
});

const updateAdminSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 characters')
      .max(20, 'Phone number cannot exceed 20 characters')
      .optional(),
    status: z
      .enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE])
      .optional()
  })
});

const changeStatusSchema = z.object({
  body: z.object({
    status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE], {
      required_error: 'Status is required (ACTIVE or INACTIVE)'
    })
  })
});

const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string({ required_error: 'New password is required' })
        .min(6, 'Password must be at least 6 characters long'),
      confirmPassword: z
        .string({ required_error: 'Confirm password is required' })
        .min(1, 'Please confirm password')
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Password and confirm password do not match',
      path: ['confirmPassword']
    })
});

module.exports = {
  createAdminSchema,
  updateAdminSchema,
  changeStatusSchema,
  resetPasswordSchema
};
