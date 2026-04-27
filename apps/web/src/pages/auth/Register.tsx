import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { isValidCPF } from '@/utils/formatters';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  confirmPassword: z.string(),
  cpf: z.string().refine((v) => !v || isValidCPF(v), 'CPF inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v, 'Você deve aceitar os termos de uso'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ name, email, password, cpf, phone }: FormData) => {
    try {
      await registerAuth({ name, email, password, cpf, phone });
    } catch {
      setError('root', { message: 'Erro ao criar conta. Verifique se o e-mail já está cadastrado.' });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-neutral-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              IDE
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">Criar conta</h1>
            <p className="mt-1 text-sm text-neutral-500">Junte-se a milhares de empresas no IDEBRASIL</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">Nome completo *</label>
              <input {...register('name')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">E-mail *</label>
              <input {...register('email')} type="email" autoComplete="email" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Senha *</label>
                <input {...register('password')} type="password" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Confirmar *</label>
                <input {...register('confirmPassword')} type="password" className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">CPF (opcional)</label>
              <input {...register('cpf')} className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none" placeholder="000.000.000-00" />
              {errors.cpf && <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2">
                <input {...register('acceptTerms')} type="checkbox" className="mt-0.5" />
                <span className="text-sm text-neutral-600">
                  Aceito os{' '}
                  <Link to="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link>
                  {' '}e a{' '}
                  <Link to="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>
                </span>
              </label>
              {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms.message}</p>}
            </div>

            {errors.root && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{errors.root.message}</div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Já tem conta?{' '}
            <Link to="/auth/login" className="font-medium text-blue-600 hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
