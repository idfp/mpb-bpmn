# Penerapan BPM Lifecycle pada Proses Bisnis Wakil Dekan III FIK UPNVJ

**Mata Kuliah:** Manajemen Proses Bisnis (MPB)  
**Kelompok:** 6  
**Program Studi:** S1 Sistem Informasi — Fakultas Ilmu Komputer, UPNVJ  
**Semester:** 6 — Tahun Akademik 2025/2026  
**Dosen Pengampu:** I Wayan Widi Pradnyana, M.TI

---

## Anggota Kelompok

| Nama | NIM |
|------|-----|
| Hanna Meilova Nababan | 2310512081 |
| Mochammad Febriyan Masyhudi | 2310512095 |
| Ashja Radithya Lesmana | 2310512113 |
| Muhammad Nur Alif Ramadhan | 2310512125 |

---

## Deskripsi Proyek

Proyek ini menerapkan **BPM Lifecycle** (Discovery → Analysis → Design → Implementation → Monitoring → Improvement) pada empat proses bisnis di lingkungan **Wakil Dekan III Bidang Kemahasiswaan, Alumni, dan Kerjasama FIK UPNVJ**, yaitu:

| Kode | Nama Proses |
|------|-------------|
| C | Pengajuan Kegiatan Ormawa (KAK) dan Pelaporan LPJ |
| D | Koordinasi Alumni dan Tracer Study |
| E | Alur Kerjasama PKS dan Implementing Agreement (IA) |
| G | Penyusunan Laporan Akuntabilitas Kinerja (LAKIN) |

**Tools yang digunakan:**
- CIB Seven Modeler — pembuatan BPMN, DMN, dan Form
- CIB Seven BPMS 2.2.0 — deployment dan simulasi proses
- Express.js + PM2 — Notification API (Discord webhook)
- cURL — trigger process instance dan complete task

**CIB Seven Instance:** https://cibseven1.foul.one

---

## Struktur Folder

```
MPB_Kelompok6_WakDekan3FIKUPNVJ/
├── laporan/
│   └── Laporan_BPM_Kelompok6_MPB.docx
├── model/
│   ├── as-is/
│   │   ├── proses_c_asis.bpmn
│   │   ├── proses_d_asis.bpmn
│   │   ├── proses_e_asis.bpmn
│   │   └── proses_g_asis.bpmn
│   ├── to-be/
│   │   ├── proses_c_tobe.bpmn
│   │   ├── proses_d_tobe.bpmn
│   │   ├── proses_e_tobe.bpmn
│   │   └── proses_g_tobe.bpmn
│   ├── dmn/
│   │   └── keputusan-kak.dmn
│   └── forms/
│       ├── form-start-kak.form
│       ├── form-verifikasi-kak.form
│       ├── form-verifikasi-anggaran.form
│       └── form-validasi-wdiii.form
├── notification-api/
│   ├── index.js
│   ├── package.json
│   └── ecosystem.config.js
├── screenshots/
│   ├── deployment/
│   ├── tasklist/
│   ├── cockpit/
│   └── simulation/
├── presentasi/
│   └── Presentasi_BPM_Kelompok6.pptx
├── video/
│   └── link-video.txt
└── README.md
```

---

## Cara Menjalankan

### 1. Deploy ke CIB Seven

Buka CIB Seven Modeler → klik **Deploy** → upload semua file dari folder `model/` sekaligus:
- `proses_c_tobe.bpmn`, `proses_d_tobe.bpmn`, `proses_e_tobe.bpmn`, `proses_g_tobe.bpmn`
- `keputusan-kak.dmn`
- Semua file `.form`

### 2. Jalankan Notification API

```bash
cd notification-api
npm install
# Edit ecosystem.config.js — isi DISCORD_WEBHOOK_URL
pm2 start ecosystem.config.js
pm2 save
```

Cek status:
```bash
curl http://localhost:8900/health
```

### 3. Start Process Instance

Gunakan Tasklist CIB Seven atau REST API:

```bash
# Contoh untuk Proses C (dengan Start Form)
# Buka Tasklist → Start Process → ProsesCToBe → isi form

# Untuk Proses D/E/G (tanpa Start Form)
curl -X POST https://cibseven1.foul.one/engine-rest/process-definition/key/ProsesDToBe/start \
  -u demo:demo123 \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Complete Task via Tasklist

Login ke https://cibseven1.foul.one/camunda/app/tasklist dengan user yang sesuai:

| User | Password | Peran |
|------|----------|-------|
| ormawa1 | ormawa1pass | Ormawa/UKM |
| fitri | fitripass | Staf Administrasi |
| suryadi | suryadipass | Staf Keuangan |
| wd3 | wd3pass | Wakil Dekan III |
| dekan | dekanpass | Dekan |

### 5. Monitor via Cockpit

```
https://cibseven1.foul.one/camunda/app/cockpit
```

---

## Variabel Proses Penting

| Variabel | Tipe | Proses | Keterangan |
|----------|------|--------|------------|
| `formatLengkap` | Boolean | C | Input DMN — verifikasi Fitri |
| `anggaranSesuai` | Boolean | C | Input DMN — verifikasi Suryadi |
| `sesuaiIKU` | Boolean | C | Input DMN — validasi WD III |
| `statusKAK` | String | C | Output DMN — "Disetujui" / "Revisi" |
| `responsCukup` | Boolean | D | Gateway respons rate tracer |
| `tahunPeninjauan` | Boolean | D | Gateway peninjauan kurikulum |
| `mitraTertarik` | Boolean | E | Gateway ketertarikan mitra |
| `mitraSetujuPKS` | Boolean | E | Gateway persetujuan PKS |
| `adaIALanjutan` | Boolean | E | Gateway IA lanjutan |
| `dataTracerLengkap` | Boolean | G | Gateway kelengkapan data tracer |

---

## DMN Decision Table

**File:** `model/dmn/keputusan-kak.dmn`  
**Decision ID:** `keputusanKAK`  
**Hit Policy:** FIRST

| formatLengkap | anggaranSesuai | sesuaiIKU | statusKAK |
|---|---|---|---|
| true | true | true | "Disetujui" |
| true | true | false | "Revisi" |
| true | false | — | "Revisi" |
| false | — | — | "Revisi" |

---

## Hasil Simulasi

| Skenario | Proses | User Tasks | Status | Durasi |
|----------|--------|-----------|--------|--------|
| C - Skenario 1 (Happy Path) | ProsesCToBe | 10 | Completed | ~6 menit |
| C - Skenario 2 (Revisi Fitri) | ProsesCToBe | 12 | Completed | ~7 menit |
| C - Skenario 3 (Revisi DMN) | ProsesCToBe | 14 | Completed | ~8 menit |
| D - Skenario 1 (Happy Path) | ProsesDToBe | 8 | Completed | ~1 menit |
| E - Skenario 1 (Happy Path) | ProsesEToBe | 13 | Completed | ~7 menit |
| G - Skenario 1 (Happy Path) | ProsesGToBe | 6 | Completed | ~1 menit |

---

## Notification API

Berjalan di port **8900** dengan Discord webhook integration.

**Endpoints:**

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/notify` | Kirim notifikasi ke Discord |
| POST | `/submit-lpj` | Log LPJ final ke keuangan |
| GET | `/health` | Cek status API |

**Tipe notifikasi yang didukung:**
`kak_revision`, `kak_approved`, `lpj_reminder`, `lpj_revision`, `lpj_final`, `tracer_link`, `tracer_reminder`, `forum_invitation`, `pks_draft`, `ia_draft`, `tracer_data_request`, `lakin_submission`
