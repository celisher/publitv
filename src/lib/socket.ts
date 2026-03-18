import { Server as SocketIOServer } from 'socket.io';

// Emit to all clients watching a specific screen
export function emitToScreen(slug: string, event: string, data: unknown) {
  const io = (global as Record<string, unknown>).io as SocketIOServer | undefined;
  if (io) {
    io.to(`screen:${slug}`).emit(event, data);
  }
}

// Emit to all admin clients
export function emitToAdmin(event: string, data: unknown) {
  const io = (global as Record<string, unknown>).io as SocketIOServer | undefined;
  if (io) {
    io.to('admin').emit(event, data);
  }
}

// Emit screen update event — triggers full data refresh on specific TV
export function emitScreenUpdate(slug: string, payload?: unknown) {
  emitToScreen(slug, 'screen:update', payload ?? { slug });
}

// Emit to ALL screens (used when global settings change)
export function emitBroadcast(event: string, data: unknown) {
  const io = (global as Record<string, unknown>).io as SocketIOServer | undefined;
  if (io) {
    io.emit(event, data);
  }
}
