/**
 * T2Desktop CAS Hydrator — Zero pacman/yay/AUR bloat.
 * Resolves all sovereign Awesome-OS desktop appliances directly from
 * b8g-ghost @ cas-v1 (manifests/index.json).
 */

export const B8G_GHOST_INDEX_URL =
  'https://raw.githubusercontent.com/awesome-os/b8g-ghost/main/manifests/index.json';

export interface CasIndexEntry {
  readonly filename: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly category?: string;
  readonly version?: string;
  readonly download_url: string;
}

export interface CasIndex {
  readonly schema: string;
  readonly cas_base_url: string;
  readonly baseline_tag: string;
  readonly updated_at: string;
  readonly total_entries: number;
  readonly entries: Readonly<Record<string, CasIndexEntry>>;
}

export interface T2DesktopApplianceSpec {
  readonly id:
    | 'sectium-browser'
    | 'libsectium_display'
    | 'code-oss'
    | 'brave'
    | 'blender'
    | 'obs'
    | 'qt'
    | 'electron'
    | 'b8g-ghost-abi';
  readonly role: string;
  readonly preferredEntries: readonly string[];
  readonly fallbackPrefix: string;
}

export interface ResolvedT2DesktopAppliance {
  readonly id: T2DesktopApplianceSpec['id'];
  readonly role: string;
  readonly filename: string;
  readonly sha256: string;
  readonly bytes: number;
  readonly category: string;
  readonly downloadUrl: string;
}

export interface ResolvedT2DesktopCatalog {
  readonly schema: string;
  readonly casBaseUrl: string;
  readonly baselineTag: string;
  readonly updatedAt: string;
  readonly indexUrl: string;
  readonly appliances: Readonly<Record<T2DesktopApplianceSpec['id'], ResolvedT2DesktopAppliance>>;
}

export const T2DESKTOP_APPLIANCES: readonly T2DesktopApplianceSpec[] = [
  {
    id: 'sectium-browser',
    role: 'Sovereign Sectium Display Browser (Super+B)',
    preferredEntries: ['sectium-browser-app.tar.zst', 'sectium-browser.exe'],
    fallbackPrefix: 'sectium-browser',
  },
  {
    id: 'libsectium_display',
    role: 'Sectium BSD-3 Native Display Compositor Library',
    preferredEntries: [
      'libsectium_display-linux-x64.so',
      'libsectium_display-linux-arm64.so',
      'libsectium_display.wasm',
    ],
    fallbackPrefix: 'libsectium_display',
  },
  {
    id: 'code-oss',
    role: 'Sovereign Code-OSS IDE Workbench (Super+C)',
    preferredEntries: ['code-oss-app-linux-x64.tar.zst', 'code-oss-app-win64.tar.zst'],
    fallbackPrefix: 'code-oss',
  },
  {
    id: 'brave',
    role: 'Hardened Chromium/Brave Web Appliance',
    preferredEntries: ['brave-linux-x64.tar.zst', 'brave-win64.tar.zst'],
    fallbackPrefix: 'brave',
  },
  {
    id: 'blender',
    role: '3D Creation & Vulkan Scene Studio',
    preferredEntries: ['blender-linux-x64.tar.zst', 'blender-win64.tar.zst'],
    fallbackPrefix: 'blender',
  },
  {
    id: 'obs',
    role: 'Live Compositing & Broadcast Studio',
    preferredEntries: ['obs-linux-x64.tar.zst', 'obs-win64.tar.zst'],
    fallbackPrefix: 'obs',
  },
  {
    id: 'qt',
    role: 'Qt6 Base Wayland Application Runtime',
    preferredEntries: ['qt6-base-linux-x64.tar.zst', 'qt6-base-win64.tar.zst'],
    fallbackPrefix: 'qt6-base',
  },
  {
    id: 'electron',
    role: 'Shared Electron Desktop Appliance Runtime',
    preferredEntries: ['electron-linux-x64.tar.zst', 'electron-linux-arm64.tar.zst'],
    fallbackPrefix: 'electron',
  },
  {
    id: 'b8g-ghost-abi',
    role: 'B8G UniversalABI Zero-Copy Native Addon',
    preferredEntries: ['b8g-ghost-abi-linux-x64.node', 'b8g-ghost-abi-linux-arm64.node'],
    fallbackPrefix: 'b8g-ghost-abi',
  },
] as const;

function pickEntry(index: CasIndex, spec: T2DesktopApplianceSpec): CasIndexEntry {
  for (const key of spec.preferredEntries) {
    const hit = index.entries[key];
    if (hit) {
      return hit;
    }
  }
  const fallbackKey = Object.keys(index.entries).find((key) =>
    key.toLowerCase().startsWith(spec.fallbackPrefix.toLowerCase()),
  );
  if (fallbackKey) {
    return index.entries[fallbackKey];
  }
  throw new Error(
    `T2Desktop CAS resolution failed: appliance "${spec.id}" not found in ${index.schema} (${index.total_entries} entries)`,
  );
}

export async function resolveT2DesktopCatalog(
  indexUrl: string = B8G_GHOST_INDEX_URL,
): Promise<ResolvedT2DesktopCatalog> {
  const response = await fetch(indexUrl, {
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch b8g-ghost CAS index (${response.status} ${response.statusText}) from ${indexUrl}`);
  }
  const index = (await response.json()) as CasIndex;
  if (!index || typeof index.entries !== 'object') {
    throw new Error(`Invalid b8g-ghost CAS index payload from ${indexUrl}`);
  }

  const appliances = {} as Record<T2DesktopApplianceSpec['id'], ResolvedT2DesktopAppliance>;
  for (const spec of T2DESKTOP_APPLIANCES) {
    const entry = pickEntry(index, spec);
    appliances[spec.id] = {
      id: spec.id,
      role: spec.role,
      filename: entry.filename,
      sha256: entry.sha256,
      bytes: entry.bytes,
      category: entry.category ?? 'cas-v1',
      downloadUrl: entry.download_url,
    };
  }

  return {
    schema: index.schema,
    casBaseUrl: index.cas_base_url,
    baselineTag: index.baseline_tag,
    updatedAt: index.updated_at,
    indexUrl,
    appliances,
  };
}

const isDirectEntry =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  typeof process.argv[1] === 'string' &&
  process.argv[1].endsWith('hydrate-desktop.mts');

if (isDirectEntry) {
  const catalog = await resolveT2DesktopCatalog();
  console.log(JSON.stringify(catalog, null, 2));
}
