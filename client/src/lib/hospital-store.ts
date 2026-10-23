const STORAGE_KEY = 'doctor-tracker:hospital';

const listeners = new Set<() => void>();

// localStorage can throw (private mode, blocked site data): the app then just starts on
// "All hospitals" every time.
export const getSelectedHospital = (): string | undefined => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

export const setSelectedHospital = (hospital: string | undefined): void => {
  try {
    if (hospital) window.localStorage.setItem(STORAGE_KEY, hospital);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to persist to; the in-memory notification below still updates this tab.
  }
  listeners.forEach((listener) => {
    listener();
  });
};

export const subscribeToHospital = (listener: () => void): (() => void) => {
  listeners.add(listener);
  // The "storage" event keeps other open tabs in sync.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};
