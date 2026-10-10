# SaaS Starter: port vc-saas → gc-web (SPA) + gc-api (Rust), tanpa billing

**Skop terkunci**: auth email/password penuh (tiada Google, tiada 2FA), workspaces + ahli + jemputan (tiada teams), tiada plan/had/billing, Resend opsyen (degrade gracefully), admin panel (users/organizations/audit + impersonation). Landing + legal pages. **Tiada seed** — semua user didaftar manual melalui UI.

**Corak utama yang diikutkan dari vc-saas**: nav matrix satu sumber (sidebar + route guard tak boleh lari), first user = platform admin, Default Workspace healing, last-workspace memory, last-admin/last-owner protection, audit log tanpa FK (kekal selepas delete), email gagal = log sahaja selepas DB commit.

---

## Fasa 1 — gc-api: skema & konfigurasi

`migrations/0002_saas.sql` (0001 kekal):

- `users` + lajur: `name TEXT NOT NULL DEFAULT ''`, `email_verified BOOLEAN NOT NULL DEFAULT false`, `role TEXT` (platform: 'admin'/NULL), `banned BOOLEAN DEFAULT false`, `ban_reason TEXT`, `avatar_url TEXT`, `last_active_organization_id UUID`
- `sessions` + : `ip_address TEXT`, `user_agent TEXT`, `active_organization_id UUID`, `impersonated_by UUID`
- `verification_tokens` (id UUID, email TEXT, token_hash TEXT, purpose TEXT check in ('email_verify','password_reset','email_change'), expires_at TIMESTAMPTZ, created_at; index email)
- `organizations` (id UUID PK, name, slug TEXT UNIQUE, logo TEXT NULL, is_default BOOLEAN DEFAULT false, created_at)
- `members` (id UUID, organization_id FK CASCADE, user_id FK CASCADE, role TEXT check ('owner','admin','member') — **satu role per ahli**, created_at; UNIQUE(org,user))
- `invitations` (id UUID, organization_id FK CASCADE, email, role TEXT, status TEXT default 'pending', expires_at, inviter_id FK, created_at; index org, email)
- `audit_log` (id UUID, created_at, actor_user_id, actor_email, action TEXT, target_user_id, target_email, detail TEXT — tiada FK, sengaja)

`config.rs`: tambah `app_url` (pautan email; default http://localhost:5173), `resend_api_key`, `email_from`, `email_reply_to` (opsyen), `brand_name` (default "gc"). `.env.example` + `.env` (lokal, gitignored) dengan placeholder `RESEND_API_KEY=` untuk anda isi.

`email.rs` baharu: klien HTTP minimal ke Resend REST (https://api.resend.com/emails) guna **reqwest + rustls** (satu-satunya dep besar baharu); layout HTML mudah berjenama; template: verification, password reset, invitation. Kontrak: selepas DB commit, kegagalan email = `tracing::warn` sahaja, aliran tetap berjaya. Tanpa `RESEND_API_KEY` → hanya log pautan ke `app_url`.

## Fasa 2 — gc-api: auth teras

Extension `AuthUser` sedia ada dikembangkan (JOIN users; tolak 401 jika banned). `auth.rs` dipecah kepada modul: `routes/auth.rs`, `routes/account.rs`, `auth/token.rs`.

- `POST /api/auth/register` — + nama; first user → role 'admin'; email verify dihantar (opsyen); auto-login (cookie sedia ada)
- `POST /api/auth/login` — tolak banned (403 + sebab), tolak jika email belum verify (403, boleh resend)
- `POST /api/auth/logout`, `GET /api/auth/me` — pulangkan `{user, session:{impersonated_by}, org:{id,slug,name,role} | null}`; **healing Default Workspace di sini** (cipta `default-{userid8}` jika tiada keahlian; aktifkan semula default/first jika active org lapuk) — mirror `lib/ensure-workspace.ts`
- Verifikasi: `POST /api/auth/verify-email {token}`, `POST /api/auth/resend-verification`, `POST /api/auth/forgot-password {email}` (jawapan generik), `POST /api/auth/reset-password {token, password}` (revoke semua sesi)
- `PATCH /api/me` (name/avatar), `POST /api/me/password` (semak current), `POST /api/me/email {password, new_email}` → token change-email, `DELETE /api/me` (tiada semasa impersonate; larang admin terakhir)
- Sesi: `GET /api/me/sessions`, `DELETE /api/me/sessions/{id}`, `DELETE /api/me/sessions/others`

## Fasa 3 — gc-api: organizations, members, invitations

`routes/org.rs`:

- `POST /api/organizations {name}` (slug auto + rawaman), `GET /api/organizations` (senarai + role), `POST /api/organizations/active {id}` (set active + simpan last_active pada users), `GET /api/organizations/current` (penuh: members+invitations, guard keahlian), `PATCH` (name/slug/logo, owner/admin), `DELETE` (owner; **larang is_default**; audit org-delete)
- `POST /api/organizations/current/invitations {email, role: admin|member}` (guard owner/admin; tolak email ahli sedia), `DELETE .../invitations/{id}` (cancel), `GET /api/invitations/{id}` (awam untuk halaman accept), `POST /api/invitations/{id}/accept` (semak email sepadan → jadi member; set active)
- `PATCH /api/organizations/current/members/{id} {role}` & `DELETE` — peraturan: hanya owner boleh set/unset owner; larang diri sendiri; larang buang owner terakhir (kiraan owner = 1)

## Fasa 4 — gc-api: admin, audit, impersonation

`routes/admin.rs`, guard extractor `AdminUser`:

- Users: `GET /api/admin/users?q=` (cari email, limit 50), ban (reason wajib, bukan diri, bukan admin terakhir + revoke sesi), unban, `PATCH role` (user|admin; bukan diri untuk demo; audit old→new), set-password (min 8), revoke-sessions, `DELETE` (bukan diri, bukan admin terakhir; audit sebelum delete)
- Orgs: `GET /api/admin/organizations?q=` (kiraan ahli + email owner), rename, delete (audit)
- `POST /api/admin/users/{id}/impersonate` — cipta sesi target `impersonated_by=admin`, tulis audit `impersonate` **terus di handler** (lebih mudah dari corak 2-endpoint vc-saas sebab kita kawal penuh), `POST /api/auth/stop-impersonating` — cipta sesi semula untuk `impersonated_by`, padam sesi impersonate
- `GET /api/admin/audit?limit=50`

## Fasa 5 — gc-web: asas auth

- `src/lib/api-client.ts`: fetch wrapper (credentials same-origin, JSON, buang `ApiError`), hooks `useSession` (Query ['me'] — sumber kebenaran pusat), mutation helpers dengan invalidasi
- `src/lib/access.ts`: port `lib/access.ts` (roles, isOrgManager, NAV_ITEMS tanpa Billing/Subscriptions/Teams) — **satu sumber untuk sidebar + guards**
- Router guards: route `beforeLoad` untuk `/app` (redirect /login jika tiada sesi) dan halaman admin/manage (semak matrix); layout route `/app` + halaman auth berasingan
- Theme: `src/components/theme-provider.tsx` ringkas (class .dark pada <html>, light/dark/system + localStorage, tiada dep)
- Halaman: `/login` (inline error, banner reset=1, error=), `/signup`, `/forgot-password`, `/reset-password` (token dari search param), `/$invitationId/accept` standalone (semak email sepadan, accept → set active → /app)
- Update landing sedia ada: butang Log masuk/Daftar di header

## Fasa 6 — gc-web: shell aplikasi

- shadcn: tambah `sidebar`, `dropdown-menu`, `alert-dialog`, `input`, `label`, `separator`, `sheet`, `avatar`, `sonner` (toast Base UI), `tooltip`
- `AppSidebar` (matrix NAV_ITEMS, collapsible icon, Sheet di mobile), `WorkspaceSwitcher` (dropdown + dialog workspace baharu), `NavUser` (Akaun, tema dgn tanda semak, Stop impersonating, Log keluar), `ImpersonationBanner` (amber), `PageHeader` (satu kata), `BrandMark`
- Status pills sedia ada dipindah ke sidebar footer (data langsung sedia ada)

## Fasa 7 — gc-web: dashboard, manage, settings, account

- `/app` Dashboard: kad statistik (ahli, role anda) + senarai ahli
- `/app/manage` Overview + tab (Members/Invitations): jemput (email+role), roster dengan pilihan role (owner hanya jika saya owner; lock diri + owner terakhir), buang dgn confirm; invitations: salin pautan, cancel
- `/app/settings`: nama/slug/logo + danger zone delete (larang Default Workspace — serahkan dari API 400)
- `/app/account`: profil, email (badge verified, tukar email), kata laluan, sesi peranti (revoke satu/semua), danger zone taip DELETE

## Fasa 8 — gc-web: admin

- `/app/admin/users`: senarai + carian, ban/unban (reason wajib), role select, dropdown (impersonate, set password, revoke sessions, delete) + aktiviti admin terkini
- `/app/admin/organizations`: senarai + carian (nama/slug/email owner), rename, delete
- `/app/admin/audit`: 50 terkini + tapisan klien
- Banner impersonation + "Stop impersonating" berfungsi merentas semua

## Fasa 9 — landing, legal, ujian, deploy

- Landing: hero sedia ada + seksyen "apa ada dalam starter" + butang auth + footer legal; buang sebarang rujukan harga
- `/terms`, `/privacy` (refund dipotong — billing-related) guna layout LegalShell mudah
- README kedua-dua repo dikemas kini (endpoint baharu, env baru; tiada seed — user didaftar manual, first user jadi platform admin)
- Ujian: Rust — unit (role/access logic, token hash) + integrasi endpoint ke dev Postgres (skip jika tiada DB); Vitest — matrix access, halaman auth render, redirect guard; sedia ada 7 kekal lulus
- CI kedua-dua repo lulus; push → deploy → sanity check di https://vms.nimfi.dev

## Nota pelaksanaan

- Setiap fasa = commit berasingan dengan verifikasi (`cargo fmt/clippy/test` + `vp check/test/build`); fasa 2-4 cuma API (web belum guna) jadi produksi kekal berfungsi sepanjang kerja
- Deviansen sengaja dari vc-saas: password_hash pada users (tiada jadual accounts — satu provider sahaja), satu role per member (bukan comma-separated), audit impersonation ditulis terus di handler, `is_default` sebagai lajur boolean (bukan metadata JSON), **tiada seed script**
- `.env` gc-api akan saya cipta dengan `RESEND_API_KEY=` kosong untuk anda isi; `.env.example` dikemas kini sebagai dokumentasi
