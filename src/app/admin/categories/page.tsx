'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import type { Category } from '@/types';

const EMPTY_FORM = { name: '', color: '#c0392b', icon: '', active: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await fetch('/api/categories').then((r) => r.json());
    setCategories(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({ name: c.name, color: c.color || '#c0392b', icon: c.icon || '', active: c.active });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Categoría actualizada' : 'Categoría creada');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    toast.success('Categoría eliminada');
    fetchData();
  };

  const handleToggle = async (c: Category) => {
    await fetch(`/api/categories/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    });
    fetchData();
  };

  const ICON_OPTIONS = ['🥩', '🍗', '🐷', '🌭', '🧀', '⭐', '🔥', '🎁', '🐄', '🥓'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Categorías</h1>
          <p className="text-white/40 text-sm mt-0.5">{categories.length} categorías registradas</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nueva Categoría</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id}
              className={`p-5 rounded-2xl border transition-all ${cat.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/2 opacity-50'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${cat.color || '#c0392b'}22` }}>
                    {cat.icon || '📦'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{cat.name}</p>
                    <p className="text-xs text-white/30">{(cat as Category & { _count?: { products: number } })._count?.products ?? 0} productos</p>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ background: cat.color || '#c0392b' }} />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <Toggle checked={cat.active} onChange={() => handleToggle(cat)} size="sm" label={cat.active ? 'Activa' : 'Inactiva'} />
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 py-16 text-center text-white/30">
              <p>No hay categorías creadas</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Categoría' : 'Nueva Categoría'} size="sm">
        <div className="space-y-4">
          <Input label="Nombre" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: Res, Pollo, Embutidos" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/70">Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
              <span className="text-sm text-white/50">{form.color}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-white/70">Icono (emoji)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {ICON_OPTIONS.map((icon) => (
                <button key={icon} onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all
                    ${form.icon === icon ? 'bg-red-600/30 border border-red-600/60' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                  {icon}
                </button>
              ))}
            </div>
            <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="O escribe un emoji personalizado" />
          </div>
          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Categoría activa" />
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
