# gc-web

SPA untuk `vms.nimfi.dev` — SaaS starter multi-tenant dibina dengan
**React 19 + TanStack Router (file-based) + TanStack Query + Tailwind CSS v4 +
shadcn/ui (Base UI)**, berpasangan dengan API Rust di repo `../gc-api`.

## Ciri

- **Auth penuh** — daftar (pengguna pertama = platform admin), verifikasi
  email, lupa/set semula kata laluan, tukar email/kata laluan, urus sesi
  peranti, padam akaun.
- **Workspace** — multi-tenant dengan role owner/admin/member, jemputan email
  (pautan boleh disalin), pertukaran workspace, workspace peribadi lalai yang
  teratur sendiri.
- **Panel admin** — urus pengguna (ban, role, kata laluan, sesi, padam),
  organisasi, impersonation dengan banner + log audit.
- **Tema** — cerah/gelap/sistem, font Inter, reka bentuk monokrom base-nova.

## Pembangunan

```bash
vp install
vp run dev:stack   # Postgres (Docker) + gc-api (../gc-api) + vp dev
vp run dev:down    # hentikan Postgres
```

- Dev server: http://localhost:5173 — `/api` diproksi ke `127.0.0.1:3000`
- Ujian: `vp test` (Vitest melalui `vite-plus/test`)
- Semakan: `vp check` (format + lint + typecheck)
- Build: `npm run build` (`tsc && vp build` → `dist/`)

`src/routeTree.gen.ts` dijana oleh plugin TanStack Router tetapi **di-commit**
kerana CI menjalankan `tsc` sebelum build — jangan edit secara manual.

## Deploy

Push ke `main` → GitHub Actions: `vp check` + `vp test` + build → tar `dist/`
→ scp ke VM → `deploy/deploy.sh` menukar symlink `/var/www/gc-web/current`
secara atomik (dilayan oleh Caddy). PR ditapis oleh `.github/workflows/ci.yml`.
