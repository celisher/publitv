'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Flame, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import ImageUpload from '@/components/ui/ImageUpload';
import type { Screen } from '@/types';

interface PromoSlideItem {
  id: number;
  screenId: number;
  title: string;
  price: number | null;
  priceUnit: string;
  productImage: string | null;
  bgImage: string | null;
  bgColor: string;
  titleColor: string;
  priceColor: string;
  accentColor: string;
  active: boolean;
  order: number;
  screen?: { id: number; name: string; slug: string };
}

const EMPTY_FORM = {
  screenId: '',
  title: '',
  price: '',
  priceUnit: '$/kg',
  productImage: null as string | null,
  bgImage: null as string | null,
  bgColor: '#c0392b',
  titleColor: '#ffffff',
  priceColor: '#ffdd00',
  accentColor: '#d4ac0d',
  active: true,
  order: 0,
};

export default function PromoSlidesPage() {
  const [slides, setSlides] = useState<PromoSlideItem[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [filterScreen, setFilterScreen] = useState('');

  const fetchData = useCallback(async () => {
    const [slidesData, screensData] = await Promise.all([
      fetch('/api/promo-slides').then((r) => r.json()),
      fetch('/api/screens').then((r) => r.json()),
    ]);
    setSlides(slidesData);
    setScreens(screensData);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, screenId: screens[0]?.id?.toString() || '' });
    setModalOpen(true);
  };

  const openEdit = (s: PromoSlideItem) => {
    setEditingId(s.id);
    setForm({
      screenId: String(s.screenId),
      title: s.title,
      price: s.price !== null ? String(s.price) : '',
      priceUnit: s.priceUnit,
      productImage: s.productImage,
      bgImage: s.bgImage,
      bgColor: s.bgColor,
      titleColor: s.titleColor,
      priceColor: s.priceColor,
      accentColor: s.accentColor,
      active: s.active,
      order: s.order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('El título es obligatorio'); return; }
    if (!form.screenId) { toast.error('Selecciona una pantalla'); return; }
    setSaving(true);
    try {
      const url = editingId ? `/api/promo-slides/${editingId}` : '/api/promo-slides';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editingId ? 'Slide actualizado' : 'Slide creado');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este slide de oferta?')) return;
    await fetch(`/api/promo-slides/${id}`, { method: 'DELETE' });
    toast.success('Slide eliminado');
    fetchData();
  };

  const handleToggle = async (s: PromoSlideItem) => {
    await fetch(`/api/promo-slides/${s.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    fetchData();
  };

  const filteredSlides = filterScreen
    ? slides.filter((s) => s.screenId === parseInt(filterScreen))
    : slides;

  const screenOptions = [
    { value: '', label: 'Todas las pantallas' },
    ...screens.map((s) => ({ value: String(s.id), label: s.name })),
  ];

  const screenSelectOptions = screens.map((s) => ({ value: String(s.id), label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Ofertas Individuales</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {slides.filter((s) => s.active).length} activas de {slides.length} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterScreen} onChange={(e) => setFilterScreen(e.target.value)}
            options={screenOptions} />
          <Button icon={<Plus size={16} />} onClick={openCreate}>
            <span className="hidden sm:inline">Nuevo Slide</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSlides.map((slide) => (
            <div key={slide.id}
              className={`rounded-2xl border overflow-hidden transition-all ${slide.active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
              {/* Preview */}
              <div className="h-40 flex items-center relative overflow-hidden"
                style={{ background: slide.bgColor || '#c0392b' }}>
                {slide.bgImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
                )}
                {/* Content preview */}
                <div className="relative z-10 flex items-center w-full h-full px-4">
                  {/* Left: title + price */}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="inline-block px-3 py-1 rounded-lg mb-2"
                      style={{ background: `${slide.accentColor}cc` }}>
                      <p className="text-sm font-black uppercase truncate"
                        style={{ color: slide.titleColor }}>
                        {slide.title}
                      </p>
                    </div>
                    {slide.price && (
                      <div className="flex items-center gap-1">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                          style={{ borderColor: slide.accentColor, background: `${slide.bgColor}dd` }}>
                          <span className="text-lg font-black" style={{ color: slide.priceColor }}>
                            ${typeof slide.price === 'number' ? slide.price.toFixed(2).replace('.', ',') : slide.price}
                          </span>
                        </div>
                        <span className="text-xs opacity-60 text-white">{slide.priceUnit}</span>
                      </div>
                    )}
                  </div>
                  {/* Right: product image */}
                  <div className="flex-shrink-0 w-28 h-28 flex items-center justify-center">
                    {slide.productImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.productImage} alt={slide.title}
                        className="max-w-full max-h-full object-contain drop-shadow-lg" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                        <ImageIcon size={24} className="text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Info */}
              <div className="p-4 bg-white/3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                    {slide.screen?.name || `Pantalla #${slide.screenId}`}
                  </span>
                  <span className="text-xs text-white/30">Orden: {slide.order}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <Toggle checked={slide.active} onChange={() => handleToggle(slide)} size="sm"
                    label={slide.active ? 'Activo' : 'Inactivo'} />
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(slide)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredSlides.length === 0 && (
            <div className="col-span-3 py-16 text-center text-white/30">
              <Flame size={40} className="mx-auto mb-3 opacity-30" />
              <p>No hay slides de ofertas creados</p>
              <p className="text-sm mt-2">Crea uno para mostrar productos en oferta de forma individual</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Slide de Oferta' : 'Nuevo Slide de Oferta'} size="lg">
        <div className="space-y-4">
          <Select label="Pantalla TV" value={form.screenId} required
            onChange={(e) => setForm({ ...form, screenId: e.target.value })}
            options={screenSelectOptions} />

          <Input label="Título / Nombre del producto" value={form.title} required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: POLLO ENTERO, CARNE PRIMERA, LOMITO" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Precio" type="number" step="0.01" min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Ej: 3.99" />
            <Input label="Unidad de precio" value={form.priceUnit}
              onChange={(e) => setForm({ ...form, priceUnit: e.target.value })}
              placeholder="$/kg" />
          </div>

          <ImageUpload label="Imagen del producto (grande, fondo transparente ideal)"
            value={form.productImage}
            onChange={(url) => setForm({ ...form, productImage: url })}
            folder="uploads/promo-slides" />

          <ImageUpload label="Imagen de fondo (opcional)"
            value={form.bgImage}
            onChange={(url) => setForm({ ...form, bgImage: url })}
            folder="uploads/promo-slides" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Fondo</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.bgColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Título</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.titleColor}
                  onChange={(e) => setForm({ ...form, titleColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.titleColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Precio</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.priceColor}
                  onChange={(e) => setForm({ ...form, priceColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.priceColor}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-white/70">Acento</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-white/10 bg-transparent" />
                <span className="text-xs text-white/40 font-mono">{form.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Color preview */}
          <div className="p-4 rounded-xl overflow-hidden relative" style={{ background: form.bgColor, minHeight: 80 }}>
            <div className="flex items-center gap-4">
              <div className="inline-block px-4 py-2 rounded-lg" style={{ background: `${form.accentColor}cc` }}>
                <span className="font-black text-lg uppercase" style={{ color: form.titleColor }}>
                  {form.title || 'PRODUCTO'}
                </span>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: form.accentColor, background: `${form.bgColor}dd` }}>
                <span className="text-lg font-black" style={{ color: form.priceColor }}>
                  ${form.price || '0,00'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Orden (menor = primero)" type="number" min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
            <div className="flex items-end pb-1">
              <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Slide activo" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear slide'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
