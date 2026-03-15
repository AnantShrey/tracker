'use client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({});
  return <div className='content' style={{ maxWidth: 420, margin: '4rem auto' }}>
    <div className='card'><h1>Create account</h1>
      <form className='list' onSubmit={handleSubmit(async (values) => {
        const { error } = await supabase.auth.signUp(values);
        if (error) return toast.error(error.message);
        toast.success('Check your email to confirm.');
      })}>
        <input className='input' placeholder='Email' {...register('email', { required: 'Email required' })} /><small>{errors.email?.message}</small>
        <input className='input' type='password' placeholder='Password' {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} /><small>{errors.password?.message}</small>
        <button className='btn' disabled={isSubmitting}>Sign up</button>
      </form>
      <p><Link href='/login'>Back to login</Link></p>
    </div></div>;
}
