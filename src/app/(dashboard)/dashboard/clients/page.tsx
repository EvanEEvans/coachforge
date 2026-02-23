"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Plus, Search, Users, ArrowRight, MoreHorizontal } from "lucide-react";
import { getInitials, formatRelative } from "@/lib/utils/constants";
import type { Client } from "@/lib/supabase/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("coach_id", user.id)
        .neq("status", "archived")
        .order("last_session_at", { ascending: false, nullsFirst: false });
      setClients(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) => {
    if (s === "active") return "bg-green-50 text-green-600";
    if (s === "paused") return "bg-yellow-50 text-yellow-600";
    if (s === "completed") return "bg-blue-50 text-blue-600";
    return "bg-gray-50 text-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Clients</h2>
          <p className="text-gray-500 text-sm">{clients.length} total clients</p>
        </div>
        <Link href="/dashboard/clients/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:shadow-teal transition"
        >
          <Plus className="w-4 h-4" /> Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search clients..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal transition"
        />
      </div>

      {/* Client list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-50">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{search ? "No clients match your search" : "No clients yet"}</p>
          <Link href="/dashboard/clients/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal text-white text-sm font-semibold">
            <Plus className="w-4 h-4" /> Add your first client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Client</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Sessions</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Last Session</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-gray-50 last:border-0 hover:bg-brand-bg-soft transition">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-soft text-teal flex items-center justify-center text-xs font-bold">
                        {getInitials(client.full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{client.full_name}</p>
                        <p className="text-xs text-gray-400">{client.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{client.session_count}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {client.last_session_at ? formatRelative(client.last_session_at) : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/clients/${client.id}`} className="text-teal text-sm font-medium hover:underline flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
