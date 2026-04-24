'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Vehicle } from '@/types';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import VehicleFormModal from './VehicleFormModal';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    const { data } = await supabase.from('vehicles').select('*').order('sort_order');
    setVehicles(data || []);
    setLoading(false);
  }

  async function toggleActive(id: string, isActive: boolean) {
    await supabase.from('vehicles').update({ is_active: !isActive }).eq('id', id);
    loadVehicles();
  }

  async function deleteVehicle(id: string) {
    if (!confirm('Da li ste sigurni da želite obrisati ovo vozilo?')) return;
    await supabase.from('vehicles').delete().eq('id', id);
    loadVehicles();
  }

  function openEdit(vehicle: Vehicle) {
    setEditVehicle(vehicle);
    setShowForm(true);
  }

  function openNew() {
    setEditVehicle(null);
    setShowForm(true);
  }

  const categoryLabels: Record<string, string> = {
    economy: 'Ekonomija',
    compact: 'Kompakt',
    suv: 'SUV',
    premium: 'Premium',
    van: 'Van',
    quad: 'Quad',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-montserrat)]">Vozila</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          Dodaj vozilo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Učitavanje...</div>
      ) : (
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-text-muted">
                <th className="p-4">Vozilo</th>
                <th className="p-4">Kategorija</th>
                <th className="p-4">Cijena/dan</th>
                <th className="p-4">Godina</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-bg-card-hover transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-text-muted">{v.transmission} · {v.fuel}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm px-2 py-1 rounded bg-bg-primary text-text-secondary">
                      {categoryLabels[v.category] || v.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{v.price_daily} KM</td>
                  <td className="p-4 text-text-secondary">{v.year}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(v.id, v.is_active)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                        v.is_active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {v.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {v.is_active ? 'Aktivno' : 'Skriveno'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-2 rounded-lg hover:bg-bg-primary text-text-secondary hover:text-accent transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => deleteVehicle(v.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <VehicleFormModal
          vehicle={editVehicle}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}
