import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function getSafeStorageExtension(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  const extension = lastDot >= 0 ? filename.slice(lastDot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "";
  return extension || "bin";
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "attachments";
  return url && key ? { url, key, bucket } : null;
}

function isLocalDemoStorageEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DEMO_MODE === "true";
}

function getLocalObjectPath(storagePath: string) {
  const objectPath = storagePath.startsWith("local/") ? storagePath.slice("local/".length) : storagePath;
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  if (!new RegExp(`^${uuid}/${uuid}\\.[a-z0-9]{1,10}$`, "i").test(objectPath)) {
    throw new Error("Некорректный путь файла в локальном хранилище.");
  }

  const storageRoot = path.resolve(process.cwd(), ".appdata", "uploads");
  const fullPath = path.resolve(storageRoot, ...objectPath.split("/"));
  if (!fullPath.startsWith(`${storageRoot}${path.sep}`)) {
    throw new Error("Путь файла выходит за пределы локального хранилища.");
  }
  return { storageRoot, fullPath };
}

function validateFile(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error("Поддерживаются изображения JPG, PNG, WebP и PDF.");
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new Error("Размер файла должен быть от 1 байта до 10 МБ.");
}

async function validateFileSignature(file: File) {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...bytes: number[]) => bytes.every((value, index) => header[index] === value);
  const validSignature = file.type === "image/jpeg" ? startsWith(0xff, 0xd8, 0xff)
    : file.type === "image/png" ? startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
      : file.type === "image/webp" ? startsWith(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...header.slice(8, 12)) === "WEBP"
        : startsWith(0x25, 0x50, 0x44, 0x46, 0x2d);
  if (!validSignature) throw new Error("Содержимое файла не совпадает с его форматом.");
}

export async function uploadToStorage(storagePath: string, file: File) {
  validateFile(file);
  await validateFileSignature(file);

  const supabase = getSupabaseConfig();
  if (supabase) {
    const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${supabase.url}/storage/v1/object/${encodeURIComponent(supabase.bucket)}/${encodedPath}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${supabase.key}`, apikey: supabase.key, "Content-Type": file.type, "x-upsert": "false" },
      body: await file.arrayBuffer(),
    });
    if (!response.ok) throw new Error("Не удалось загрузить файл в хранилище. Проверьте настройки Supabase Storage.");
    return storagePath;
  }

  const hasPartialSupabaseConfig = Boolean(process.env.SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (hasPartialSupabaseConfig) throw new Error("Для Supabase Storage укажите и SUPABASE_URL, и SUPABASE_SERVICE_ROLE_KEY.");
  if (!isLocalDemoStorageEnabled()) {
    throw new Error("Загрузка доступна в локальном демо или после настройки Supabase Storage.");
  }

  const localStoragePath = `local/${storagePath}`;
  const { storageRoot, fullPath } = getLocalObjectPath(localStoragePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await mkdir(storageRoot, { recursive: true });
  try {
    await writeFile(fullPath, new Uint8Array(await file.arrayBuffer()), { flag: "wx" });
  } catch (error) {
    await rm(fullPath, { force: true });
    throw error;
  }
  return localStoragePath;
}

export async function removeFromStorage(storagePath: string) {
  if (storagePath.startsWith("local/")) {
    const { fullPath } = getLocalObjectPath(storagePath);
    await rm(fullPath, { force: true });
    return;
  }

  const supabase = getSupabaseConfig();
  if (!supabase) return;
  await fetch(`${supabase.url}/storage/v1/object/${encodeURIComponent(supabase.bucket)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${supabase.key}`, apikey: supabase.key, "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: [storagePath] }),
  });
}

export async function readLocalStorageObject(storagePath: string) {
  if (!storagePath.startsWith("local/")) throw new Error("Файл не находится в локальном хранилище.");
  const { fullPath } = getLocalObjectPath(storagePath);
  return readFile(fullPath);
}

export async function createStorageSignedUrl(storagePath: string) {
  const supabase = getSupabaseConfig();
  if (!supabase) throw new Error("Для этого файла не настроено удалённое хранилище.");
  const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${supabase.url}/storage/v1/object/sign/${encodeURIComponent(supabase.bucket)}/${encodedPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${supabase.key}`, apikey: supabase.key, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 300 }),
  });
  if (!response.ok) throw new Error("Не удалось открыть файл из хранилища.");
  const result = await response.json() as { signedURL?: string; signedUrl?: string };
  const signed = result.signedURL ?? result.signedUrl;
  if (!signed) throw new Error("Хранилище не вернуло ссылку на файл.");
  return signed.startsWith("http") ? signed : `${supabase.url}/storage/v1${signed}`;
}
