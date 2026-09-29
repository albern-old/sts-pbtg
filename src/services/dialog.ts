// Dialog in-app pengganti Alert.alert (react-native-web mengimplementasikan
// Alert sebagai no-op, sehingga konfirmasi kritis (simpan/hapus sesi, reset)
// tidak pernah muncul di web). API promise-based: tunggu sampai pengguna memilih.
//
//   const ok = await showConfirm({ title, message, confirmLabel, cancelLabel });
//   await showAlert(title, message);

export interface DialogOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface DialogRequest extends DialogOptions {
  resolve: (confirmed: boolean) => void;
}

let current: DialogRequest | null = null;
let subscriber: ((request: DialogRequest | null) => void) | null = null;

function notify(): void {
  subscriber?.(current);
}

/** Dialog konfirmasi. `true` = tombol konfirmasi ditekan. */
export function showConfirm(options: DialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (current) {
      // Panggilan baru menggantikan dialog yang masih terbuka.
      const previous = current;
      current = null;
      previous.resolve(false);
    }
    current = { ...options, resolve };
    notify();
  });
}

/** Dialog informasi satu tombol (OK). Selalu resolve setelah ditutup. */
export function showAlert(title: string, message?: string): Promise<void> {
  return showConfirm({ title, message }).then(() => undefined);
}

/** Host (DialogHost) berlangganan perubahan dialog. */
export function subscribeToDialog(
  listener: (request: DialogRequest | null) => void,
): () => void {
  subscriber = listener;
  listener(current);
  return () => {
    if (subscriber === listener) {
      subscriber = null;
    }
  };
}

/** Dipanggil DialogHost saat pengguna memilih tombol. */
export function settleDialog(confirmed: boolean): void {
  if (!current) return;
  const request = current;
  current = null;
  request.resolve(confirmed);
  notify();
}
