// src/components/auth/SignupForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  role: z.string().min(1, 'Please select a role'), // Fixed: use z.string() instead of z.enum()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      const { confirmPassword, ...signupData } = data;
      await signup(signupData as any); // Type assertion for now
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join the Risk Portal</p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register('role')}
              >
                <option value="">Select a role</option>
                <option value="user">User</option>
                <option value="approver">Approver</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message as string}
                </p>
              )}
            </div>

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />

            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>

            <div className="text-center">
              <Link to="/login" className="text-blue-600 hover:text-blue-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};