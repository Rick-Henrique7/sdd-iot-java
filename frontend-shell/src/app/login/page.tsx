import Link from 'next/link';
import { BrandPanel } from '@/components/auth/BrandPanel';
import { AuthForm } from '@/components/auth/AuthForm';
import { routes } from '@/lib/routes';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[3fr_2fr]">
      <BrandPanel />

      <section className="flex items-center justify-center bg-bg p-6 sm:p-10">
        <div className="w-full max-w-sm animate-rise">
          <header className="mb-8">
            <h1 className="text-h1 font-semibold text-fg">Acessar plataforma</h1>
            <p className="mt-1 text-sm text-fg-muted">
              Use suas credenciais corporativas para entrar.
            </p>
          </header>

          <div className="mb-6 inline-flex rounded-md border border-border bg-card p-1 text-sm">
            <span className="rounded bg-brand/20 px-3 py-1.5 font-medium text-fg">
              Entrar
            </span>
            <Link
              href={routes.register}
              className="rounded px-3 py-1.5 text-fg-muted transition-colors hover:bg-card-2 hover:text-fg"
            >
              Cadastrar
            </Link>
          </div>

          <AuthForm mode="login" />

          <p className="mt-6 text-center text-xs text-fg-muted">
            Esqueceu a senha? Fale com o administrador da sua operação.
          </p>
        </div>
      </section>
    </main>
  );
}
