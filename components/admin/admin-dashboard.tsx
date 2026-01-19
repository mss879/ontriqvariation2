'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent as AlertDialogContentUI,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowRight, BarChart3, ClipboardList, Columns3, LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Inquiry = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string;
  source_url: string | null;
  converted_to_lead: boolean;
  lead_id: string | null;
};

type Stage = {
  id: string;
  name: string;
  position: number;
};

type Lead = {
  id: string;
  stage_id: string;
  inquiry_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const supabaseConfigured = supabase !== null;

  const [view, setView] = useState<'dashboard' | 'inquiries' | 'crm'>('dashboard');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [stages, setStages] = useState<Stage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const [addStageName, setAddStageName] = useState('');

  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const [deleteInquiryConfirmOpen, setDeleteInquiryConfirmOpen] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState<Inquiry | null>(null);

  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [deleteLeadConfirmOpen, setDeleteLeadConfirmOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadDraft, setEditLeadDraft] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  );

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const activeLead = useMemo(
    () => (activeLeadId ? leads.find((l) => l.id === activeLeadId) : null),
    [activeLeadId, leads]
  );

  const leadsByStage = useMemo(() => {
    const map = new Map<string, Lead[]>();
    for (const stage of stages) map.set(stage.id, []);
    for (const lead of leads) {
      const arr = map.get(lead.stage_id) ?? [];
      arr.push(lead);
      map.set(lead.stage_id, arr);
    }
    return map;
  }, [leads, stages]);

  const refreshAll = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const [inqRes, stagesRes, leadsRes] = await Promise.all([
        supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('crm_stages').select('*').order('position', { ascending: true }),
        supabase.from('crm_leads').select('*').order('created_at', { ascending: false }),
      ]);

      if (inqRes.error) throw new Error(inqRes.error.message);
      if (stagesRes.error) throw new Error(stagesRes.error.message);
      if (leadsRes.error) throw new Error(leadsRes.error.message);

      setInquiries((inqRes.data ?? []) as Inquiry[]);
      setStages((stagesRes.data ?? []) as Stage[]);
      setLeads((leadsRes.data ?? []) as Lead[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setBusy(false);
    }
  }, [supabase]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const onLogout = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logout failed');
    } finally {
      setBusy(false);
    }
  }, [router]);

  const openEditLead = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setEditLeadDraft({
      first_name: lead.first_name ?? '',
      last_name: lead.last_name ?? '',
      email: lead.email ?? '',
      phone: lead.phone ?? '',
      company: lead.company ?? '',
      notes: lead.notes ?? '',
    });
    setEditLeadOpen(true);
  }, []);

  const openDeleteLeadConfirm = useCallback((lead: Lead) => {
    setEditingLead(lead);
    setDeleteLeadConfirmOpen(true);
  }, []);

  const onSaveLead = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (!editingLead) return;

    const firstName = editLeadDraft.first_name.trim();
    const lastName = editLeadDraft.last_name.trim();

    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: editLeadDraft.email.trim() || null,
        phone: editLeadDraft.phone.trim() || null,
        company: editLeadDraft.company.trim() || null,
        notes: editLeadDraft.notes.trim() || null,
      };

      const res = await supabase.from('crm_leads').update(payload).eq('id', editingLead.id);
      if (res.error) throw new Error(res.error.message);

      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? { ...l, ...payload } : l)));
      setEditLeadOpen(false);
      setEditingLead(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save lead');
    } finally {
      setBusy(false);
    }
  }, [editLeadDraft.company, editLeadDraft.email, editLeadDraft.first_name, editLeadDraft.last_name, editLeadDraft.notes, editLeadDraft.phone, editingLead, supabase]);

  const onDeleteLead = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (!editingLead) return;

    setBusy(true);
    setError('');
    try {
      const res = await supabase.from('crm_leads').delete().eq('id', editingLead.id);
      if (res.error) throw new Error(res.error.message);

      setLeads((prev) => prev.filter((l) => l.id !== editingLead.id));
      setInquiries((prev) =>
        prev.filter(
          (i) => i.id !== editingLead.inquiry_id && i.lead_id !== editingLead.id
        )
      );
      setDeleteLeadConfirmOpen(false);
      setEditLeadOpen(false);
      setEditingLead(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete lead');
    } finally {
      setBusy(false);
    }
  }, [editingLead, supabase]);

  const onConvertInquiry = useCallback(
    async (inquiry: Inquiry) => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      setBusy(true);
      setError('');
      try {
        const stage =
          stages.find((s) => s.name.toLowerCase() === 'new lead') ??
          [...stages].sort((a, b) => a.position - b.position)[0];

        if (!stage) {
          throw new Error('No CRM stages found. Add a stage first.');
        }

        const insertLeadRes = await supabase
          .from('crm_leads')
          .insert({
            stage_id: stage.id,
            inquiry_id: inquiry.id,
            first_name: inquiry.first_name,
            last_name: inquiry.last_name,
            email: inquiry.email,
            phone: inquiry.phone,
            company: null,
            notes: inquiry.message,
          })
          .select('id')
          .single();

        if (insertLeadRes.error) throw new Error(insertLeadRes.error.message);

        const leadId = insertLeadRes.data.id as string;

        const updateInquiryRes = await supabase
          .from('inquiries')
          .update({ converted_to_lead: true, lead_id: leadId })
          .eq('id', inquiry.id);

        if (updateInquiryRes.error) throw new Error(updateInquiryRes.error.message);

        await refreshAll();
        setView('crm');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Convert failed');
      } finally {
        setBusy(false);
      }
    },
    [refreshAll, stages, supabase]
  );

  const openDeleteInquiryConfirm = useCallback((inquiry: Inquiry) => {
    setDeletingInquiry(inquiry);
    setDeleteInquiryConfirmOpen(true);
  }, []);

  const onDeleteInquiry = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    if (!deletingInquiry) return;

    setBusy(true);
    setError('');
    try {
      const res = await supabase.from('inquiries').delete().eq('id', deletingInquiry.id);
      if (res.error) throw new Error(res.error.message);

      setInquiries((prev) => prev.filter((i) => i.id !== deletingInquiry.id));
      if (deletingInquiry.lead_id) {
        setLeads((prev) => prev.filter((l) => l.id !== deletingInquiry.lead_id));
      }
      setDeleteInquiryConfirmOpen(false);
      setDeletingInquiry(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete inquiry');
    } finally {
      setBusy(false);
    }
  }, [deletingInquiry, supabase]);

  const onAddStage = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    const name = addStageName.trim();
    if (!name) return;

    setBusy(true);
    setError('');
    try {
      const nextPosition = (stages.at(-1)?.position ?? 0) + 1;
      const res = await supabase.from('crm_stages').insert({ name, position: nextPosition });
      if (res.error) throw new Error(res.error.message);
      setAddStageName('');
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add stage');
    } finally {
      setBusy(false);
    }
  }, [addStageName, refreshAll, stages, supabase]);

  const onRenameStage = useCallback(
    async (stageId: string, name: string) => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      const trimmed = name.trim();
      if (!trimmed) return;

      setBusy(true);
      setError('');
      try {
        const res = await supabase.from('crm_stages').update({ name: trimmed }).eq('id', stageId);
        if (res.error) throw new Error(res.error.message);
        await refreshAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to rename stage');
      } finally {
        setBusy(false);
      }
    },
    [refreshAll, supabase]
  );

  const onDeleteStage = useCallback(
    async (stageId: string) => {
      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      setBusy(true);
      setError('');
      try {
        const countInStage = leads.filter((l) => l.stage_id === stageId).length;
        if (countInStage > 0) {
          throw new Error('Move leads out of this stage before deleting it.');
        }

        const res = await supabase.from('crm_stages').delete().eq('id', stageId);
        if (res.error) throw new Error(res.error.message);
        await refreshAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to delete stage');
      } finally {
        setBusy(false);
      }
    },
    [leads, refreshAll, supabase]
  );

  const onCreateLead = useCallback(async () => {
    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    const firstName = newLead.first_name.trim();
    const lastName = newLead.last_name.trim();
    if (!firstName || !lastName) return;

    setBusy(true);
    setError('');
    try {
      const stage =
        stages.find((s) => s.name.toLowerCase() === 'new lead') ??
        [...stages].sort((a, b) => a.position - b.position)[0];

      if (!stage) throw new Error('No CRM stages found.');

      const res = await supabase.from('crm_leads').insert({
        stage_id: stage.id,
        inquiry_id: null,
        first_name: firstName,
        last_name: lastName,
        email: newLead.email.trim() || null,
        phone: newLead.phone.trim() || null,
        company: newLead.company.trim() || null,
        notes: newLead.notes.trim() || null,
      });

      if (res.error) throw new Error(res.error.message);

      setNewLeadOpen(false);
      setNewLead({ first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' });
      await refreshAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create lead');
    } finally {
      setBusy(false);
    }
  }, [newLead, refreshAll, stages, supabase]);

  function findStageIdFromOverId(overId: string) {
    // We only treat stage ids as drop targets.
    const asStage = stages.find((s) => s.id === overId);
    return asStage?.id ?? null;
  }

  const onDragStart = useCallback((event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveLeadId(id);
  }, []);

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveLeadId(null);

      if (!supabase) {
        setError('Supabase is not configured.');
        return;
      }

      const activeId = String(event.active.id);
      const overId = event.over?.id ? String(event.over.id) : null;
      if (!overId) return;

      const lead = leads.find((l) => l.id === activeId);
      if (!lead) return;

      const targetStageId = findStageIdFromOverId(overId);
      if (!targetStageId || targetStageId === lead.stage_id) return;

      // Optimistic update
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, stage_id: targetStageId } : l)));

      const res = await supabase.from('crm_leads').update({ stage_id: targetStageId }).eq('id', lead.id);
      if (res.error) {
        setError(res.error.message);
        await refreshAll();
      }
    },
    [leads, refreshAll, stages, supabase]
  );

  const unconvertedInquiries = useMemo(
    () => inquiries.filter((i) => !i.converted_to_lead),
    [inquiries]
  );

  const recentInquiries = useMemo(() => inquiries.slice(0, 5), [inquiries]);

  const inquiryMonthly = useMemo(() => {
    // Last 12 months buckets, computed client-side from inquiries.
    const now = new Date();
    const buckets: { key: string; label: string; count: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString(undefined, { month: 'short' });
      buckets.push({ key, label, count: 0 });
    }

    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const inq of inquiries) {
      const d = new Date(inq.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byKey.get(key);
      if (bucket) bucket.count += 1;
    }

    return buckets;
  }, [inquiries]);

  const metrics = useMemo(() => {
    const total = inquiries.length;
    const converted = inquiries.filter((i) => i.converted_to_lead).length;
    const conversionRate = total === 0 ? 0 : Math.round((converted / total) * 100);
    return {
      totalInquiries: total,
      converted,
      conversionRate,
      totalLeads: leads.length,
    };
  }, [inquiries, leads.length]);

  if (!supabaseConfigured) {
    return (
      <main className="min-h-screen bg-white pt-32 pb-24 text-slate-900 md:pt-40 md:pb-28">
        <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-600">
              Supabase is not configured. Set <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
              <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>.
              <br />
              Local: put them in <span className="font-medium">.env.local</span> and restart.
              <br />
              Hosting (Netlify): add them in Site settings → Environment variables, then redeploy (Clear cache & redeploy).
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 gap-6 pt-10 md:pt-12 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-b from-orange-50/80 to-white p-4 sm:p-6 shadow-lg shadow-orange-500/10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-6 left-0 w-1 rounded-r-full bg-gradient-to-b from-orange-400 to-orange-600"
              />
              <div className="space-y-2">
                <div className="mb-6">
                  <Image
                    src="/ontriq-logo.png"
                    alt="Ontriq Logo"
                    width={180}
                    height={72}
                    className="h-12 sm:h-14 w-auto object-contain"
                    priority
                  />
                </div>
                <div className="text-sm font-semibold text-slate-900">Admin Panel</div>
                <div className="text-xs text-slate-500">Ontriq</div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 lg:block lg:space-y-2">
                <SideItem
                  active={view === 'dashboard'}
                  icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />}
                  label="Dashboard"
                  onClick={() => setView('dashboard')}
                />
                <SideItem
                  active={view === 'inquiries'}
                  icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />}
                  label="Inquiries"
                  onClick={() => setView('inquiries')}
                />
                <SideItem
                  active={view === 'crm'}
                  icon={<Columns3 className="h-4 w-4" aria-hidden="true" />}
                  label="CRM"
                  onClick={() => setView('crm')}
                />
              </div>

              <div className="mt-6 lg:mt-8">
                <button
                  type="button"
                  onClick={onLogout}
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="lg:col-span-9">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {view === 'dashboard' ? 'Dashboard' : view === 'inquiries' ? 'Inquiries' : 'CRM'}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {view === 'dashboard'
                      ? 'Analytics and recent activity.'
                      : view === 'inquiries'
                        ? 'Convert inquiries into CRM leads.'
                        : 'Drag leads between pipelines.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void refreshAll()}
                  disabled={busy}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Refresh
                </button>
              </div>

              {error ? (
                <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {/* Dashboard */}
              {view === 'dashboard' ? (
                <div className="mt-8 space-y-8">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Total inquiries" value={String(metrics.totalInquiries)} />
                    <MetricCard label="Converted to leads" value={String(metrics.converted)} />
                    <MetricCard label="Conversion rate" value={`${metrics.conversionRate}%`} />
                    <MetricCard label="Total leads" value={String(metrics.totalLeads)} />
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">Inquiries per month</div>
                          <div className="text-xs text-slate-500">Last 12 months</div>
                        </div>
                      </div>
                      <div className="mt-4 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inquiryMonthly} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#F75834" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Recent inquiries</div>
                        <div className="text-xs text-slate-500">Latest 5</div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {recentInquiries.length === 0 ? (
                          <p className="text-sm text-slate-500">No inquiries yet.</p>
                        ) : (
                          recentInquiries.map((inq) => (
                            <div key={inq.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {inq.first_name} {inq.last_name}
                                  </div>
                                  <div className="text-xs text-slate-500">{formatDate(inq.created_at)}</div>
                                  <div className="mt-1 text-xs text-slate-600">{inq.email}</div>
                                </div>
                                {!inq.converted_to_lead ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void onConvertInquiry(inq)}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#F75834] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e04826] disabled:opacity-60"
                                  >
                                    Send to CRM
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                ) : (
                                  <div className="text-xs font-semibold text-slate-500">Converted</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Inquiries */}
              {view === 'inquiries' ? (
                <div className="mt-8">
                  <div className="grid gap-4">
                    {unconvertedInquiries.length === 0 ? (
                      <p className="text-sm text-slate-500">No new inquiries.</p>
                    ) : (
                      unconvertedInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-2">
                              <div className="text-sm text-slate-500">{formatDate(inq.created_at)}</div>
                              <div className="text-lg font-semibold text-slate-900">
                                {inq.first_name} {inq.last_name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {inq.email}{inq.phone ? ` • ${inq.phone}` : ''}
                              </div>
                              <div className="text-sm text-slate-600 whitespace-pre-wrap">{inq.message}</div>
                            </div>

                            <div className="flex flex-col items-start gap-3 md:items-end">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void onConvertInquiry(inq)}
                                className="group inline-flex items-center gap-3 rounded-full bg-[#F75834] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#e04826] disabled:opacity-60"
                              >
                                Send to CRM
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => openDeleteInquiryConfirm(inq)}
                                className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}

              {/* CRM */}
              {view === 'crm' ? (
                <div className="mt-8">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="space-y-2">
                          <Label htmlFor="add-stage" className="text-slate-700">Add pipeline</Label>
                          <div className="flex gap-3">
                            <Input
                              id="add-stage"
                              value={addStageName}
                              onChange={(e) => setAddStageName(e.target.value)}
                              placeholder="e.g. Negotiation"
                              className="h-12 rounded-2xl bg-slate-50 border-slate-200 focus-visible:ring-[#F75834]"
                            />
                            <button
                              type="button"
                              onClick={() => void onAddStage()}
                              disabled={busy}
                              className="inline-flex items-center gap-2 rounded-full bg-[#F75834] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e04826] disabled:opacity-60"
                            >
                              <Plus className="h-4 w-4" aria-hidden="true" />
                              Add
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setNewLeadOpen((v) => !v)}
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          New lead
                        </button>
                      </div>
                    </div>

                    {newLeadOpen ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-slate-700">First name</Label>
                            <Input
                              value={newLead.first_name}
                              onChange={(e) => setNewLead((p) => ({ ...p, first_name: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Last name</Label>
                            <Input
                              value={newLead.last_name}
                              onChange={(e) => setNewLead((p) => ({ ...p, last_name: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Email</Label>
                            <Input
                              value={newLead.email}
                              onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Phone</Label>
                            <Input
                              value={newLead.phone}
                              onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Company</Label>
                            <Input
                              value={newLead.company}
                              onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-700">Notes</Label>
                            <Input
                              value={newLead.notes}
                              onChange={(e) => setNewLead((p) => ({ ...p, notes: e.target.value }))}
                              className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                            />
                          </div>
                        </div>

                        <div className="mt-5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void onCreateLead()}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-full bg-[#F75834] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e04826] disabled:opacity-60"
                          >
                            Create lead
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewLeadOpen(false)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragStart={onDragStart}
                      onDragEnd={(e) => void onDragEnd(e)}
                    >
                      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                        {stages.map((stage) => (
                          <StageColumn
                            key={stage.id}
                            stage={stage}
                            leads={leadsByStage.get(stage.id) ?? []}
                            busy={busy}
                            onEditLead={openEditLead}
                            onDeleteLead={openDeleteLeadConfirm}
                            onDeleteStage={onDeleteStage}
                            onRenameStage={onRenameStage}
                          />
                        ))}
                      </div>

                      <DragOverlay>
                        {activeLead ? (
                          <div className="w-[320px] rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="text-sm font-semibold text-slate-900">
                              {activeLead.first_name} {activeLead.last_name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{activeLead.email || '—'}</div>
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                </div>
              ) : null}

              {busy ? <p className="mt-6 text-sm text-slate-500">Working…</p> : null}

              <AlertDialog
                open={deleteInquiryConfirmOpen}
                onOpenChange={(open) => {
                  setDeleteInquiryConfirmOpen(open);
                  if (!open) setDeletingInquiry(null);
                }}
              >
                <AlertDialogContentUI>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete inquiry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the inquiry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        void onDeleteInquiry();
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                      disabled={busy}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContentUI>
              </AlertDialog>

              <Dialog
                open={editLeadOpen}
                onOpenChange={(open) => {
                  setEditLeadOpen(open);
                  if (!open) {
                    setEditingLead(null);
                    setDeleteLeadConfirmOpen(false);
                  }
                }}
              >
                <DialogContent className="w-[calc(100vw-2rem)] max-w-none sm:max-w-[560px] max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden border-orange-200 bg-gradient-to-b from-orange-50/70 to-white/40 backdrop-blur-xl shadow-2xl shadow-orange-500/20">
                  <DialogHeader>
                    <DialogTitle>Edit lead</DialogTitle>
                    <DialogDescription>
                      Update lead details or delete the lead.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-700">First name</Label>
                        <Input
                          value={editLeadDraft.first_name}
                          onChange={(e) =>
                            setEditLeadDraft((p) => ({ ...p, first_name: e.target.value }))
                          }
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Last name</Label>
                        <Input
                          value={editLeadDraft.last_name}
                          onChange={(e) =>
                            setEditLeadDraft((p) => ({ ...p, last_name: e.target.value }))
                          }
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Email</Label>
                        <Input
                          value={editLeadDraft.email}
                          onChange={(e) => setEditLeadDraft((p) => ({ ...p, email: e.target.value }))}
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Phone</Label>
                        <Input
                          value={editLeadDraft.phone}
                          onChange={(e) => setEditLeadDraft((p) => ({ ...p, phone: e.target.value }))}
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Company</Label>
                        <Input
                          value={editLeadDraft.company}
                          onChange={(e) =>
                            setEditLeadDraft((p) => ({ ...p, company: e.target.value }))
                          }
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Notes</Label>
                        <Input
                          value={editLeadDraft.notes}
                          onChange={(e) => setEditLeadDraft((p) => ({ ...p, notes: e.target.value }))}
                          className="h-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-[#F75834]"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setDeleteLeadConfirmOpen(true)}
                      disabled={busy || !editingLead}
                      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditLeadOpen(false)}
                      disabled={busy}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void onSaveLead()}
                      disabled={busy || !editingLead}
                      className="inline-flex items-center justify-center rounded-full bg-[#F75834] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e04826] disabled:opacity-60"
                    >
                      Save
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog
                open={deleteLeadConfirmOpen}
                onOpenChange={(open) => {
                  setDeleteLeadConfirmOpen(open);
                  if (!open && !editLeadOpen) setEditingLead(null);
                }}
              >
                <AlertDialogContentUI>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the lead from CRM.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        void onDeleteLead();
                      }}
                      className="bg-red-600 text-white hover:bg-red-700"
                      disabled={busy}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContentUI>
              </AlertDialog>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function SideItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition-colors sm:justify-start sm:gap-3 sm:px-4 sm:text-sm ${active
          ? 'border-[#F75834] bg-orange-50 text-slate-900 shadow-sm shadow-orange-500/10'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
    >
      <span className={active ? 'text-[#F75834]' : 'text-slate-500'}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StageColumn({
  stage,
  leads,
  busy,
  onEditLead,
  onDeleteLead,
  onRenameStage,
  onDeleteStage,
}: {
  stage: Stage;
  leads: Lead[];
  busy: boolean;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
  onRenameStage: (stageId: string, name: string) => Promise<void>;
  onDeleteStage: (stageId: string) => Promise<void>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`relative overflow-hidden rounded-3xl border p-5 transition-colors ${isOver ? 'border-[#F75834] bg-orange-50/70' : 'border-slate-200 bg-slate-100'
        }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"
      />
      <div className="flex items-center justify-between gap-3">
        <input
          defaultValue={stage.name}
          onBlur={(e) => void onRenameStage(stage.id, e.currentTarget.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={() => void onDeleteStage(stage.id)}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          aria-label={`Delete stage ${stage.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-1 text-xs text-slate-500">{leads.length} lead(s)</div>

      <div className="mt-4 min-h-[120px] space-y-3">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
            Drop a lead here
          </div>
        ) : null}

        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onEdit={() => onEditLead(lead)}
            onDelete={() => onDeleteLead(lead)}
          />
        ))}
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-3xl border border-slate-200 bg-white p-5"
      onClick={() => {
        if (isDragging) return;
        onEdit?.();
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">Lead</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Edit lead"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-[#F75834] hover:bg-orange-50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Delete lead"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">First name</span>
          <span className="font-medium text-slate-900">{lead.first_name || '—'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Company</span>
          <span className="font-medium text-slate-900">{lead.company || '—'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Phone</span>
          <span className="font-medium text-slate-900">{lead.phone || '—'}</span>
        </div>
      </div>
    </div>
  );
}

