export default function TVLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}
