import Link from 'next/link';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { AuthForm } from '@/components/auth/AuthForm';
import { routes } from '@/lib/routes';

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">
      <BrandPanel />

      <section className="flex items-center justify-center bg-bg p-6 sm:p-10">
        <div className="w-full max-w-sm animate-rise">
          <header className="mb-8">
            <h1 className="text-h1 font-semibold text-fg">Criar conta</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Primeiro acesso? Defina suas credenciais de operacao.
            </p>
          </header>

          <div className="mb-6 inline-flex rounded-md border border-border bg-card p-1 text-sm">
            <Link
              href={routes.login}
              className="rounded px-3 py-1.5 text-fg-muted transition-colors hover:bg-card-2 hover:text-fg"
            >
              Entrar
            </Link>
            <span className="rounded bg-brand/20 px-3 py-1.5 font-medium text-fg">
              Cadastrar
            </span>
          </div>

          <AuthForm mode="register" />

          <p className="mt-6 text-center text-xs text-fg-muted">
            Ja tem conta?{' '}
            <Link
              href={routes.login}
              className="font-medium text-brand hover:underline"
            >
              Entrar
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
