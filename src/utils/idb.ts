/**
 * Minimal IndexedDB key-value helpers.
 *
 * All application state that must survive a page refresh goes through these
 * two functions. Components and hooks must never call indexedDB directly —
 * use usePersistedReducer instead.
 *
 * A new DB connection is opened per call rather than cached at module level so
 * that test environments can safely swap out the global indexedDB between
 * tests without dealing with stale connection references.
 */

const DB_NAME = 'todo-list-db';
const STORE_NAME = 'store';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const idbGet = <T>(key: string): Promise<T | undefined> =>
  openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      }),
  );

export const idbSet = <T>(key: string, value: T): Promise<void> =>
  openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const request = db
          .transaction(STORE_NAME, 'readwrite')
          .objectStore(STORE_NAME)
          .put(value, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
  );
