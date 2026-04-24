'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import type { Vehicle, VehicleCategory } from '@/types';
import { X, Upload, Trash2, GripVertical, ImagePlus, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}

const categories: { value: VehicleCategory; label: string }[] = [
  { value: 'economy', label: 'Ekonomija' },
  { value: 'compact', label: 'Kompakt' },
  { value: 'suv', label: 'SUV' },
  { value: 'premium', label: 'Premium' },
  { value: 'van', label: 'Van' },
  { value: 'quad', label: 'Quad' },
];

export default function VehicleFormModal({ vehicle, onClose, onSaved }: Props) {
  const isEdit = !!vehicle;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>(vehicle?.images || []);
  const [uploading, setUploading] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    name: vehicle?.name || '',
    slug: vehicle?.slug || '',
    category: vehicle?.category || 'compact',
    transmission: vehicle?.transmission || 'manual',
    fuel: vehicle?.fuel || 'diesel',
    year: vehicle?.year || new Date().getFullYear(),
    price_daily: vehicle?.price_daily || 0,
    price_weekly: vehicle?.price_weekly || '',
    seats: vehicle?.specs?.seats || 5,
    doors: vehicle?.specs?.doors || 5,
    luggage: vehicle?.specs?.luggage || 2,
    ac: vehicle?.specs?.ac ?? true,
    bluetooth: vehicle?.specs?.bluetooth ?? true,
    gps: vehicle?.specs?.gps ?? false,
    leather: vehicle?.specs?.leather ?? false,
    panorama: vehicle?.specs?.panorama ?? false,
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[čć]/g, 'c')
      .replace(/[šś]/g, 's')
      .replace(/[žź]/g, 'z')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name),
    }));
  }

  async function uploadFile(file: File): Promise<string | null> {
    const slug = form.slug || generateSlug(form.name);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slug', slug);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) { setError(`Greška pri uploadu: ${data.error}`); return null; }
      return data.url;
    } catch {
      setError('Greška pri uploadu slike');
      return null;
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) setImages((prev) => [...prev, url]);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || replaceIndex === null) return;

    setUploading(true);
    setError('');

    const oldUrl = images[replaceIndex];
    const newUrl = await uploadFile(file);

    if (newUrl) {
      setImages((prev) => prev.map((img, i) => i === replaceIndex ? newUrl : img));
      if (oldUrl.includes('supabase.co/storage')) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: oldUrl }),
        });
      }
    }

    setReplaceIndex(null);
    setUploading(false);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  }

  function triggerReplace(index: number) {
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  }

  async function removeImage(url: string) {
    if (!confirm('Obrisati sliku?')) return;

    if (url.includes('supabase.co/storage')) {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    }

    setImages((prev) => prev.filter((img) => img !== url));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const newImages = [...images];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newImages.length) return;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    setImages(newImages);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const specs = {
      seats: form.seats,
      doors: form.doors,
      luggage: form.luggage,
      ac: form.ac,
      bluetooth: form.bluetooth,
      gps: form.gps,
      leather: form.leather,
      panorama: form.panorama,
    };

    const payload = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      transmission: form.transmission,
      fuel: form.fuel,
      year: form.year,
      price_daily: form.price_daily,
      price_weekly: form.price_weekly || null,
      specs,
      images,
    };

    let result;
    if (isEdit) {
      result = await supabase.from('vehicles').update(payload).eq('id', vehicle.id);
    } else {
      result = await supabase.from('vehicles').insert(payload);
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    onSaved();
  }

  const inputClass = 'w-full px-3 py-2 bg-bg-primary border border-border rounded-lg focus:outline-none focus:border-accent text-text-primary text-sm';
  const labelClass = 'block text-sm text-text-secondary mb-1';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-bg-card border border-border rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-bg-card rounded-t-xl z-10">
          <h2 className="text-xl font-bold font-[family-name:var(--font-montserrat)]">
            {isEdit ? 'Uredi vozilo' : 'Novo vozilo'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-bg-primary rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Naziv *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className={inputClass}
                placeholder="Peugeot 3008 1.5 HDI"
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Slike */}
          <div>
            <label className={labelClass}>Slike</label>
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((url, i) => (
                    <div key={url} className="relative group rounded-lg overflow-hidden border border-border bg-bg-primary aspect-[3/2]">
                      <Image
                        src={url}
                        alt={`Slika ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, -1)}
                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Pomjeri lijevo"
                          >
                            <GripVertical size={14} className="text-white rotate-90" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerReplace(i)}
                          className="p-1.5 bg-accent/80 rounded-lg hover:bg-accent transition-colors"
                          title="Zamijeni sliku"
                        >
                          <RefreshCw size={14} className="text-white" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors"
                          title="Obriši"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                        {i < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(i, 1)}
                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            title="Pomjeri desno"
                          >
                            <GripVertical size={14} className="text-white rotate-90" />
                          </button>
                        )}
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] bg-accent px-1.5 py-0.5 rounded text-white font-medium">
                          Glavna
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleReplace}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border hover:border-accent/50 rounded-lg p-6 flex flex-col items-center gap-2 text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Upload size={24} className="animate-pulse text-accent" />
                ) : (
                  <ImagePlus size={24} />
                )}
                <span className="text-sm font-medium">
                  {uploading ? 'Upload u toku...' : 'Klikni za dodavanje slika'}
                </span>
                <span className="text-xs">PNG, JPG, WebP · Max 5MB</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Kategorija</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as VehicleCategory })}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mjenjač</label>
              <select
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value as 'manual' | 'automatic' })}
                className={inputClass}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatik</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Gorivo</label>
              <select
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value as 'diesel' | 'petrol' | 'hybrid' })}
                className={inputClass}
              >
                <option value="diesel">Dizel</option>
                <option value="petrol">Benzin</option>
                <option value="hybrid">Hibrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Godina</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cijena/dan (KM) *</label>
              <input
                type="number"
                value={form.price_daily}
                onChange={(e) => setForm({ ...form, price_daily: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Cijena/sedmica (KM)</label>
              <input
                type="number"
                value={form.price_weekly}
                onChange={(e) => setForm({ ...form, price_weekly: e.target.value ? Number(e.target.value) : '' })}
                className={inputClass}
                placeholder="Opcionalno"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Specifikacije</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Sjedala</label>
                <input
                  type="number"
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Vrata</label>
                <input
                  type="number"
                  value={form.doors}
                  onChange={(e) => setForm({ ...form, doors: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prtljag (kofera)</label>
                <input
                  type="number"
                  value={form.luggage}
                  onChange={(e) => setForm({ ...form, luggage: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {[
                { key: 'ac' as const, label: 'Klima' },
                { key: 'bluetooth' as const, label: 'Bluetooth' },
                { key: 'gps' as const, label: 'GPS' },
                { key: 'leather' as const, label: 'Koža' },
                { key: 'panorama' as const, label: 'Panorama' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[item.key]}
                    onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                    className="accent-accent"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-colors"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {saving ? 'Spremanje...' : isEdit ? 'Spremi' : 'Dodaj'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
