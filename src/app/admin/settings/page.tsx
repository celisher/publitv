'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Monitor, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ui/ImageUpload';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await fetch('/api/settings').then((r) => r.json());
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const set = (key: string, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success('Configuración guardada y aplicada en tiempo real');
    } catch {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Configuración General</h1>
        <p className="text-white/40 text-sm mt-0.5">Los cambios se aplican en tiempo real en todas las pantallas TV</p>
      </div>

      {/* Business Info */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Información del negocio</h2>
        <Input
          label="Nombre del negocio"
          value={settings.business_name || ''}
          onChange={(e) => set('business_name', e.target.value)}
          placeholder="Frigorifico El Toro 2026 C.A"
        />
        <Input
          label="Eslogan / tagline"
          value={settings.business_tagline || ''}
          onChange={(e) => set('business_tagline', e.target.value)}
          placeholder="Calidad y Frescura Garantizada"
        />
        <Input
          label="Teléfono / contacto"
          value={settings.business_phone || ''}
          onChange={(e) => set('business_phone', e.target.value)}
          placeholder="+58 000-000-0000"
        />
      </section>

      {/* Display Config */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Visualización de precios</h2>
        <Input
          label="Unidad de precio (se muestra en TV)"
          value={settings.price_unit || ''}
          onChange={(e) => set('price_unit', e.target.value)}
          placeholder="$/kg"
          hint="Ej: $/kg, Bs/kg, $/unidad"
        />
        <Input
          label="Símbolo de moneda"
          value={settings.currency_symbol || ''}
          onChange={(e) => set('currency_symbol', e.target.value)}
          placeholder="$"
        />
      </section>

      {/* Logo */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider">Logo del negocio</h2>
        <ImageUpload
          label="Logo (se muestra en pantallas TV)"
          value={settings.logo_path || null}
          onChange={(url) => set('logo_path', url || '')}
          folder="uploads"
        />
        {settings.logo_path && (
          <p className="text-xs text-white/30">Ruta actual: {settings.logo_path}</p>
        )}
      </section>

      {/* TV Preview Links */}
      <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Acceso rápido a pantallas TV</h2>
        {[
          { slug: 'tv-principal', label: 'TV Principal' },
          { slug: 'tv-caja', label: 'TV Caja' },
          { slug: 'tv-promociones', label: 'TV Promociones' },
        ].map((tv) => (
          <a
            key={tv.slug}
            href={`/tv/${tv.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Monitor size={16} className="text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-white">{tv.label}</p>
                <p className="text-xs text-white/30">/tv/{tv.slug}</p>
              </div>
            </div>
            <ExternalLink size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
          </a>
        ))}
      </section>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          icon={<Save size={16} />}
          loading={saving}
          onClick={handleSave}
          size="lg"
        >
          Guardar configuración
        </Button>
      </div>
    </div>
  );
}
