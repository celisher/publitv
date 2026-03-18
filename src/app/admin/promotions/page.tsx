'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import ImageUpload from '@/components/ui/ImageUpload';
import type { Promotion } from '@/types';

const PROMO_TYPES = [
  { value: 'fullscreen', label: 'Pantalla completa' },
  { value: 'banner', label: 'Banner' },
  { value: 'featured', label: 'Producto destacado' },
];

const EMPTY_FORM = {
  title: '', subtitle: '', image: null as string | null,
  type: 'fullscreen', active: true, priority: 0,
  startDate: '', endDate: '',
  bgColor: '#c0392b', textColor: '#ffffff',
};

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await fetch('/api/promotions').then((r) => r.json());
    setPromotions(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditingId(p.id);
    setForm({
      title: p.title, subtitle: p.subtitle || '',
      image: p.image || null, type: p.type,
      active: p.active, priority: p.priority,
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      bgColor: p.bgColor || '#c0392b', textColor: p.textColor || '#ffffff',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('El título es obligatorio'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/promotions/${editingId}` : '/api/promotions';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Promoción actualizada' : 'Promoción creada');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    toast.success('Promoción eliminada');
    fetchData();
  };

  const handleToggle = async (p: Promotion) => {
    await fetch(`/api/promotions/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Promociones</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {promotions.filter((p) => p.active).length} activas de {promotions.length} total
          </p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          <span className="hidden sm:inline">Nueva Promoción</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <div key={promo.id}
              className={`rounded-2xl border overflow-hidden transition-all ${promo.active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              {/* Preview */}
              <div className="h-28 flex items-center justify-center relative"
                style={{ background: promo.bgColor || '#c0392b' }}>
                {promo.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={promo.image} alt={promo.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40" />
                )}
                <div className="relative z-10 text-center px-4">
                  <p className="font-black text-xl uppercase leading-tight"
                    style={{ color: promo.textColor || '#ffffff' }}>
                    {promo.title}
                  </p>
                  {promo.subtitle && (
                    <p className="text-sm mt-1 opacity-80" style={{ color: promo.textColor || '#ffffff' }}>
                      {promo.subtitle}
                    </p>
                  )}
                </div>
              </div>
              {/* Info */}
              <div className="p-4 bg-white/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50 capitalize">
                    {promo.type}
                  </span>
                  <span className="text-xs text-white/30">Prioridad: {promo.priority}</span>
                </div>
                {(promo.startDate || promo.endDate) && (
                  <p className="text-xs text-white/30 mb-2">
                    {promo.startDate && `Desde: ${promo.startDate.slice(0, 10)}`}
                    {promo.startDate && promo.endDate && ' — '}
                    {promo.endDate && `Hasta: ${promo.endDate.slice(0, 10)}`}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <Toggle checked={promo.active} onChange={() => handleToggle(promo)} size="sm"
                    label={promo.active ? 'Activa' : 'Inactiva'} />
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(promo)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(promo.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {promotions.length === 0 && (
            <div className="col-span-3 py-16 text-center text-white/30">
              <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay promociones creadas</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Promoción' : 'Nueva Promoción'} size="lg">
        <div className="space-y-4">
          <Input label="Título principal" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: ¡OFERTA ESPECIAL!" />
          <Input label="Subtítulo / descripción" value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Ej: Carne Primera solo $9,90/kg este fin de semana" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Tipo" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={PROMO_TYPES} />
            <Input label="Prioridad (mayor = primero)" type="number" min={0} max={100}
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>

          <ImageUpload label="Imagen de la promoción (opcional)" value={form.image}
            onChange={(url) => setForm({ ...form, image: url })} folder="uploads/promotions" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Color de fondo</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.bgColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Color de texto</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.textColor}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.textColor}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Fecha inicio (opcional)" type="date" value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="Fecha fin (opcional)" type="date" value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Promoción activa" />

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear promoción'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
