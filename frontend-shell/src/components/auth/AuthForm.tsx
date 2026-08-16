'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import type { AuthResponse, UserRole } from '@/types/auth';

type Mode = 'login' | 'register';

interface AuthFormProps {
  mode: Mode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const guard = useRoleGuard();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('ROLE_OPERADOR');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não conferem.');
        return;
      }
    }

    setSubmitting(true);
    try {
      // The api-gateway mounts auth-service under /api/v1/auth/**.
      const url = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const body = isRegister
        ? { name: fullName, email, password, role }
        : { email, password };

      const { data } = await api.post<AuthResponse>(url, body);
      setSession(data.token, data.user);
      // Change 021: redirect by role (Operador -> /operator/workspace, others -> /dashboard)
      router.push(guard.landingPath(data.user.role));
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      setError(
        apiErr.response?.data?.message ??
          (isRegister
            ? 'Não foi possível concluir o cadastro.'
            : 'Credenciais inválidas.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 animate-fade-in" noValidate>
      {isRegister && (
        <Input
          label="Nome completo"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      )}

      <Input
        label="E-mail Corporativo"
        type="email"
        autoComplete="email"
        leftIcon={<Mail size={16} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="Senha"
        type="password"
        autoComplete={isRegister ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={isRegister ? 'Mínimo de 8 caracteres.' : undefined}
        required
      />

      {isRegister && (
        <Input
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      )}

      <Select
        label="Perfil de Acesso"
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
      >
        <option value="ROLE_OPERADOR">Operador</option>
        <option value="ROLE_AGRONOMO">Agrônomo</option>
        <option value="ROLE_GESTOR">Gestor</option>
      </Select>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical"
        >
          {error}
        </div>
      )}

      <Button type="submit" size="lg" loading={submitting} className="w-full">
        {isRegister ? 'Criar conta' : 'Entrar no sistema'}
      </Button>
    </form>
  );
}
