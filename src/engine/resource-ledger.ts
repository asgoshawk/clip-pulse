type Cleanup = () => void | Promise<void>;

export class ResourceLedger {
  private cleanups: Cleanup[] = [];
  private released = false;

  track(cleanup: Cleanup): void {
    if (this.released) {
      void cleanup();
      return;
    }
    this.cleanups.push(cleanup);
  }

  trackObjectUrl(url: string): string {
    this.track(() => URL.revokeObjectURL(url));
    return url;
  }

  async release(): Promise<void> {
    if (this.released) return;
    this.released = true;
    for (const cleanup of this.cleanups.reverse()) {
      try { await cleanup(); } catch { /* Cleanup is best-effort and continues. */ }
    }
    this.cleanups = [];
  }

  get size(): number { return this.cleanups.length; }
}
