'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import ImageUpload from '@/components/ui/ImageUpload';
import type { Template } from '@/types';

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid — cuadrícula de productos' },
  { value: 'list', label: 'Lista — filas por categoría' },
  { value: 'promotion', label: 'Promoción — pantalla completa' },
];

const TITLE_SIZES = ['2xl','3xl','4xl','5xl','6xl'].map((s) => ({ value: s, label: s }));
const LOGO_POSITIONS = [
  { value: 'top-left', label: 'Arriba izquierda' },
  { value: 'top-center', label: 'Arriba centro' },
  { value: 'top-right', label: 'Arriba derecha' },
];

const EMPTY_FORM = {
  name: '', description: '',
  bgColor: '#0d0d0d', overlayColor: 'rgba(0,0,0,0.6)',
  primaryColor: '#ff4500', secondaryColor: '#d4ac0d',
  priceColor: '#ff4500', titleColor: '#ffffff',
  fontStyle: 'bold', titleSize: '4xl', priceSize: '3xl',
  layout: 'grid', logoPosition: 'top-left',
  showBanner: true, bannerText: '', bannerBgColor: '#c0392b',
  priceGlowIntensity: 40,
  bgImage: null as string | null, active: true,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await fetch('/api/templates').then((r) => r.json());
    setTemplates(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditingId(t.id);
    setForm({
      name: t.name, description: t.description || '',
      bgColor: t.bgColor, overlayColor: t.overlayColor,
      primaryColor: t.primaryColor, secondaryColor: t.secondaryColor,
      priceColor: t.priceColor, titleColor: t.titleColor,
      fontStyle: t.fontStyle, titleSize: t.titleSize, priceSize: t.priceSize,
      layout: t.layout, logoPosition: t.logoPosition,
      showBanner: t.showBanner, bannerText: t.bannerText || '', bannerBgColor: t.bannerBgColor,
      priceGlowIntensity: t.priceGlowIntensity ?? 40,
      bgImage: t.bgImage || null, active: t.active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/templates/${editingId}` : '/api/templates';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Plantilla actualizada' : 'Plantilla creada');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    toast.success('Plantilla eliminada');
    fetchData();
  };

  const F = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Plantillas Visuales</h1>
          <p className="text-white/40 text-sm mt-0.5">{templates.length} plantillas disponibles</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nueva Plantilla</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/10 overflow-hidden">
              {/* Preview */}
              <div className="h-32 relative flex items-center justify-center"
                style={{
                  background: t.bgImage ? `url(${t.bgImage}) center/cover` : t.bgColor,
                }}>
                <div className="absolute inset-0" style={{ background: t.overlayColor }} />
                <div className="relative z-10 text-center px-4">
                  <p className="font-black text-lg uppercase tracking-wider" style={{ color: t.titleColor }}>
                    {t.name}
                  </p>
                  <p className="font-black text-2xl" style={{ color: t.priceColor }}>$10,90</p>
                </div>
                {t.showBanner && (
                  <div className="absolute bottom-0 left-0 right-0 py-1 px-3 text-xs font-bold text-white text-center uppercase tracking-wider"
                    style={{ background: t.bannerBgColor }}>
                    {t.bannerText || 'Banner'}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette size={14} className="text-white/40" />
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  {!t.active && <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Inactiva</span>}
                </div>
                {t.description && <p className="text-xs text-white/40 mb-3">{t.description}</p>}
                <div className="flex gap-2 mb-3">
                  {[t.primaryColor, t.secondaryColor, t.priceColor, t.bgColor].map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ background: color }} title={color} />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-white/30 capitalize">{t.layout}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="col-span-3 py-16 text-center text-white/30">
              <Palette size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay plantillas creadas</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Plantilla' : 'Nueva Plantilla'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nombre de la plantilla" value={form.name} required
              onChange={F('name')} placeholder="Ej: Brasas Premium" />
            <Select label="Layout" value={form.layout}
              onChange={(e) => setForm({ ...form, layout: e.target.value })}
              options={LAYOUT_OPTIONS} />
          </div>
          <Input label="Descripción" value={form.description} onChange={F('description')}
            placeholder="Breve descripción del estilo visual" />

          {/* Colors */}
          <div>
            <p className="text-sm font-semibold text-white/70 mb-3">Colores</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                ['bgColor', 'Color de fondo'],
                ['primaryColor', 'Color primario'],
                ['secondaryColor', 'Color secundario'],
                ['priceColor', 'Color de precios'],
                ['titleColor', 'Color de títulos'],
                ['bannerBgColor', 'Color del banner'],
              ] as [keyof typeof form, string][]).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{label}</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={String(form[key])}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                    <span className="text-xs text-white/40 font-mono">{String(form[key])}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overlay */}
          <Input label="Overlay (CSS rgba, ej: rgba(0,0,0,0.6))" value={form.overlayColor}
            onChange={F('overlayColor')} placeholder="rgba(0,0,0,0.6)" />

          <div className="grid grid-cols-3 gap-4">
            <Select label="Tamaño de títulos" value={form.titleSize}
              onChange={(e) => setForm({ ...form, titleSize: e.target.value })}
              options={TITLE_SIZES} />
            <Select label="Tamaño de precios" value={form.priceSize}
              onChange={(e) => setForm({ ...form, priceSize: e.target.value })}
              options={TITLE_SIZES} />
            <Select label="Posición del logo" value={form.logoPosition}
              onChange={(e) => setForm({ ...form, logoPosition: e.target.value })}
              options={LOGO_POSITIONS} />
          </div>

          {/* Banner */}
          <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-3">
            <Toggle checked={form.showBanner} onChange={(v) => setForm({ ...form, showBanner: v })}
              label="Mostrar banner inferior" />
            {form.showBanner && (
              <Input label="Texto del banner" value={form.bannerText} onChange={F('bannerText')}
                placeholder="Ej: PRECIOS POR KILO • FRIGORIFICO EL TORO 2026 C.A" />
            )}
          </div>

          {/* Price glow intensity */}
          <div className="p-4 rounded-xl bg-white/3 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/70">
                Resplandor de precios
              </label>
              <span className="text-sm font-black tabular-nums px-2 py-0.5 rounded-lg"
                style={{
                  color: form.priceColor,
                  background: `${form.priceColor}22`,
                  textShadow: form.priceGlowIntensity > 0
                    ? `0 0 ${Math.round(8 * form.priceGlowIntensity / 100)}px ${form.priceColor}`
                    : 'none',
                }}>
                {form.priceGlowIntensity}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.priceGlowIntensity}
              onChange={(e) => setForm({ ...form, priceGlowIntensity: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${form.priceColor} 0%, ${form.priceColor} ${form.priceGlowIntensity}%, rgba(255,255,255,0.1) ${form.priceGlowIntensity}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>Sin resplandor</span>
              <span>Máximo</span>
            </div>
          </div>

          {/* Background image */}
          <ImageUpload label="Imagen de fondo (opcional)" value={form.bgImage}
            onChange={(url) => setForm({ ...form, bgImage: url })} folder="uploads/backgrounds" />

          <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Plantilla activa" />

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear plantilla'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
