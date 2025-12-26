import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/admin/admin-dashboard';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export default async function AdminPage() {
  if (!hasSupabaseEnv()) {
    return <AdminDashboard />;
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect('/admin/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    // Keep it simple: treat non-admin as unauth.
    redirect('/admin/login');
  }

  return <AdminDashboard />;
}
