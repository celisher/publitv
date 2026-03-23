'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ExternalLink, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import type { Screen, Template, Category } from '@/types';

const DISPLAY_MODES = [
  { value: 'list', label: 'Lista — columnas de productos por categoría' },
  { value: 'carousel', label: 'Carrusel — bloques de productos con paginación' },
  { value: 'promotion', label: 'Promociones — pantalla completa de promos' },
  { value: 'mixed', label: 'Mixto — alterna entre precios y promociones' },
  { value: 'promo-individual', label: 'Ofertas Individuales — un producto en oferta a la vez' },
];

const EMPTY_FORM = {
  name: '', templateId: '', displayMode: 'carousel',
  rotationInterval: 8, showPrices: true, categories: [] as number[],
};

export default function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [s, t, c] = await Promise.all([
      fetch('/api/screens').then((r) => r.json()),
      fetch('/api/templates').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]);
    setScreens(s);
    setTemplates(t);
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, templateId: templates[0]?.id?.toString() || '' });
    setModalOpen(true);
  };

  const openEdit = (s: Screen) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      templateId: s.templateId ? String(s.templateId) : '',
      displayMode: s.displayMode,
      rotationInterval: s.rotationInterval,
      showPrices: s.showPrices,
      categories: JSON.parse(s.categories || '[]'),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/screens/${editingId}` : '/api/screens';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Pantalla actualizada' : 'Pantalla creada');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta pantalla?')) return;
    await fetch(`/api/screens/${id}`, { method: 'DELETE' });
    toast.success('Pantalla eliminada');
    fetchData();
  };

  const handleToggle = async (s: Screen) => {
    await fetch(`/api/screens/${s.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    fetchData();
  };

  const toggleCategory = (id: number) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((c) => c !== id)
        : [...f.categories, id],
    }));
  };

  const templateOptions = [
    { value: '', label: 'Sin plantilla' },
    ...templates.map((t) => ({ value: String(t.id), label: t.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Pantallas TV</h1>
          <p className="text-white/40 text-sm mt-0.5">{screens.length} televisores configurados</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>
          <span className="hidden sm:inline">Nueva Pantalla</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screens.map((screen) => (
            <div key={screen.id}
              className={`p-5 rounded-2xl border transition-all ${screen.active ? 'border-white/10 bg-white/5' : 'border-white/5 bg-white/2 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${screen.active ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                    <Monitor size={20} className={screen.active ? 'text-blue-400' : 'text-white/30'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">{screen.name}</p>
                      <div className={`w-2 h-2 rounded-full ${screen.active ? 'bg-green-400' : 'bg-red-400'}`} />
                    </div>
                    <p className="text-xs text-white/30">/tv/{screen.slug}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 text-xs text-white/50">
                <p>Modo: <span className="capitalize text-white/70">{screen.displayMode}</span></p>
                <p>Plantilla: <span className="text-white/70">{screen.template?.name || 'Ninguna'}</span></p>
                <p>Intervalo: <span className="text-white/70">{screen.rotationInterval}s</span> · Precios: <span className="text-white/70">{screen.showPrices ? 'Visibles' : 'Ocultos'}</span></p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <Toggle checked={screen.active} onChange={() => handleToggle(screen)} size="sm" label={screen.active ? 'Activa' : 'Inactiva'} />
                <div className="flex gap-2">
                  <a href={`/tv/${screen.slug}`} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-900/20 transition-colors">
                    <ExternalLink size={15} />
                  </a>
                  <button onClick={() => openEdit(screen)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(screen.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {screens.length === 0 && (
            <div className="col-span-3 py-16 text-center text-white/30">
              <Monitor size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay pantallas configuradas</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Pantalla' : 'Nueva Pantalla'} size="lg">
        <div className="space-y-4">
          <Input label="Nombre de la pantalla" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: TV Principal, TV Caja, TV Charcutería" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Plantilla visual" value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              options={templateOptions} />
            <Select label="Modo de visualización" value={form.displayMode}
              onChange={(e) => setForm({ ...form, displayMode: e.target.value })}
              options={DISPLAY_MODES.map((m) => ({ value: m.value, label: m.value.charAt(0).toUpperCase() + m.value.slice(1) }))} />
          </div>
          <div className="p-3 rounded-xl bg-white/3 border border-white/10">
            <p className="text-xs text-white/50 mb-1">Modo seleccionado:</p>
            <p className="text-sm text-white/80">{DISPLAY_MODES.find((m) => m.value === form.displayMode)?.label}</p>
          </div>
          <Input label="Intervalo de rotación (segundos)" type="number" min={3} max={60}
            value={form.rotationInterval}
            onChange={(e) => setForm({ ...form, rotationInterval: parseInt(e.target.value) })} />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">Categorías visibles en esta pantalla</label>
            <p className="text-xs text-white/30">Sin selección = muestra todas las categorías activas</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    form.categories.includes(cat.id)
                      ? 'border-current opacity-100'
                      : 'border-white/10 text-white/40 hover:text-white/60'
                  }`}
                  style={form.categories.includes(cat.id) ? { color: cat.color || '#c0392b', borderColor: cat.color || '#c0392b', background: `${cat.color || '#c0392b'}15` } : {}}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
          <Toggle checked={form.showPrices} onChange={(v) => setForm({ ...form, showPrices: v })}
            label="Mostrar precios en esta pantalla" />
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear pantalla'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
