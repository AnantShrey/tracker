'use client';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>();
  return <div className='content' style={{ maxWidth: 420, margin: '4rem auto' }}>
    <div className='card'><h1>Reset password</h1>
      <form className='list' onSubmit={handleSubmit(async ({ email }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` });
        if (error) return toast.error(error.message);
        toast.success('Password reset email sent');
      })}>
        <input className='input' placeholder='Email' {...register('email', { required: true })} />
        <button className='btn' disabled={isSubmitting}>Send reset link</button>
      </form>
    </div></div>;
}
