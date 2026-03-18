'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Toggle from '@/components/ui/Toggle';
import ImageUpload from '@/components/ui/ImageUpload';
import { formatPrice, parsePrice } from '@/lib/utils';
import type { Product, Category } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const EMPTY_FORM = {
  name: '', price: '', description: '', image: null as string | null,
  active: true, featured: false, categoryId: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchData = useCallback(async () => {
    const [p, c] = await Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]);
    setProducts(p);
    setCategories(c);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id?.toString() || '' });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, price: formatPrice(p.price),
      description: p.description || '', image: p.image || null,
      active: p.active, featured: p.featured, categoryId: String(p.categoryId),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Nombre, precio y categoría son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const body = { ...form, price: parsePrice(form.price) };
      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Error al guardar');
      toast.success(editingId ? 'Producto actualizado' : 'Producto creado');
      setModalOpen(false);
      fetchData();
    } catch {
      toast.error('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    toast.success('Producto eliminado');
    fetchData();
  };

  const handleToggle = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    fetchData();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const filtered = filteredProducts;
    const reordered = Array.from(filtered);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const items = reordered.map((p, i) => ({ id: p.id, order: i }));
    setProducts((prev) => {
      const map = new Map(reordered.map((p, i) => [p.id, { ...p, order: i }]));
      return prev.map((p) => map.get(p.id) || p);
    });
    await fetch('/api/products/reorder', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  };

  const filteredProducts = filterCategory
    ? products.filter((p) => String(p.categoryId) === filterCategory)
    : products;

  const catOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Productos</h1>
          <p className="text-white/40 text-sm mt-0.5">{products.length} productos en total</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Nuevo Producto</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          {catOptions.map((o) => (
            <option key={o.value} value={o.value} style={{ background: '#1a1a1a' }}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="products">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}
                className="rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <div className="col-span-1" />
                  <div className="col-span-4">Producto</div>
                  <div className="col-span-2">Categoría</div>
                  <div className="col-span-2">Precio</div>
                  <div className="col-span-1">Estado</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="py-16 text-center text-white/30">
                    <p className="text-lg">No hay productos</p>
                    <button onClick={openCreate} className="text-red-400 text-sm hover:underline mt-2">
                      Crear primer producto →
                    </button>
                  </div>
                )}
                {filteredProducts.map((p, index) => (
                  <Draggable key={p.id} draggableId={String(p.id)} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 items-center border-t border-white/5 transition-colors ${!p.active ? 'opacity-50' : ''} hover:bg-white/3`}
                      >
                        <div className="col-span-1 flex items-center">
                          <span {...drag.dragHandleProps} className="text-white/20 hover:text-white/60 cursor-grab">
                            <GripVertical size={16} />
                          </span>
                        </div>
                        <div className="col-span-4 flex items-center gap-3">
                          {p.image && (
                            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white text-sm">{p.name}</p>
                            {p.description && <p className="text-xs text-white/40 truncate max-w-xs">{p.description}</p>}
                          </div>
                          {p.featured && <Star size={12} className="text-yellow-400 flex-shrink-0" />}
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs px-2 py-1 rounded-full"
                            style={{ background: `${p.category?.color || '#c0392b'}22`, color: p.category?.color || '#c0392b' }}>
                            {p.category?.name || '—'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-black text-orange-400 text-lg">${formatPrice(p.price)}</span>
                        </div>
                        <div className="col-span-1">
                          <Toggle checked={p.active} onChange={() => handleToggle(p)} size="sm" />
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2">
                          <button onClick={() => handleToggle(p)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            title={p.active ? 'Desactivar' : 'Activar'}>
                            {p.active ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-900/20 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'} size="lg">
        <div className="space-y-4">
          <Input label="Nombre del producto" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej: CARNE PRIMERA" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio ($/kg)" value={form.price} required
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Ej: 10,90" hint="Puede usar punto o coma decimal" />
            <Select label="Categoría" required value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))} />
          </div>
          <Input label="Descripción corta (opcional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ej: Corte premium de primera calidad" />
          <ImageUpload label="Imagen del producto (opcional)" value={form.image}
            onChange={(url) => setForm({ ...form, image: url })} folder="uploads/products" />
          <div className="flex gap-6 pt-2">
            <Toggle checked={form.active} onChange={(v) => setForm({ ...form, active: v })} label="Activo (visible en TV)" />
            <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Destacado" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>
              {editingId ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
