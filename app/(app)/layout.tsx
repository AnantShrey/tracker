import { AppShell } from '@/components/app-shell';
import { Protected } from '@/components/protected';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <Protected><AppShell>{children}</AppShell></Protected>;
}
