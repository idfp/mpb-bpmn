const express = require('express');
const app = express();
 
app.use(express.json());
 
// ── Config ──────────────────────────────────────────────
const PORT           = 8900;
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK_URL || '';
 
// ── Pesan Discord per type notifikasi ───────────────────
const MESSAGE_MAP = {
  // Proses C — KAK
  kak_revision:    '📝 **KAK perlu direvisi.** Silakan periksa catatan reviewer dan submit ulang form KAK.',
  kak_approved:    '✅ **KAK telah disetujui oleh Dekan.** Silakan laksanakan kegiatan sesuai rencana.',
  lpj_reminder:    '⏰ **Pengingat LPJ:** 14 hari telah berlalu sejak kegiatan. Segera upload LPJ dan kuitansi.',
  lpj_revision:    '📝 **LPJ perlu direvisi.** Periksa catatan dari Fitri/Suryadi dan upload ulang.',
  lpj_final:       '📤 **LPJ telah disahkan** dan dikirim ke Keuangan Pusat.',
 
  // Proses D — Tracer Study
  tracer_link:     '🔗 **Link Tracer Study telah dikirim** ke seluruh alumni. Mohon segera diisi.',
  tracer_reminder: '⏰ **Pengingat Tracer Study:** Mohon segera mengisi form tracer study yang telah dikirimkan.',
  forum_invitation:'📅 **Undangan Forum Peninjauan Kurikulum** telah dikirimkan. Silakan konfirmasi kehadiran.',
 
  // Proses E — Kerjasama
  pks_draft:       '📄 **Draft PKS telah dikirim** ke mitra. Mohon direview dan dikonfirmasi persetujuannya.',
  ia_draft:        '📄 **Draft IA telah dikirim** ke mitra. Mohon direview dan dikonfirmasi persetujuannya.',
 
  // Proses G — LAKIN
  tracer_data_request: '📊 **Request data Tracer Study** diterima dari FIK. Mohon segera disiapkan rekap datanya.',
  lakin_submission:    '📋 **LAKIN telah selesai disusun** dan siap untuk diterima. Silakan buka tasklist untuk tanda terima.',
};
 
// ── Helper: kirim ke Discord ─────────────────────────────
async function sendDiscord(title, description, fields = []) {
  if (!DISCORD_WEBHOOK) {
    console.warn('[Discord] DISCORD_WEBHOOK_URL tidak diset, skip pengiriman.');
    return;
  }
 
  const body = {
    embeds: [{
      title,
      description,
      color: 0x1F6FEB,
      fields,
      footer: { text: 'CIB Seven — Sistem Portal Kemahasiswaan FIK' },
      timestamp: new Date().toISOString(),
    }]
  };
 
  try {
    const res = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error('[Discord] Gagal kirim:', res.status, await res.text());
    } else {
      console.log('[Discord] Berhasil terkirim.');
    }
  } catch (err) {
    console.error('[Discord] Error:', err.message);
  }
}
 
// ── POST /notify ─────────────────────────────────────────
app.post('/notify', async (req, res) => {
  const { recipient, type, processId } = req.body;
 
  console.log(`[/notify] type=${type} | recipient=${recipient} | processId=${processId}`);
 
  const message = MESSAGE_MAP[type] || `📬 Notifikasi baru: **${type}**`;
 
  await sendDiscord(
    '🔔 Notifikasi Sistem Portal',
    message,
    [
      { name: 'Penerima',    value: recipient  || '-', inline: true },
      { name: 'Tipe',        value: type       || '-', inline: true },
      { name: 'Process ID',  value: processId  || '-', inline: false },
    ]
  );
 
  res.json({ status: 'ok', type, recipient, processId });
});
 
// ── POST /submit-lpj ─────────────────────────────────────
app.post('/submit-lpj', async (req, res) => {
  const { processId } = req.body;
 
  console.log(`[/submit-lpj] processId=${processId}`);
 
  await sendDiscord(
    '📤 LPJ Dikirim ke Keuangan Pusat',
    '✅ **LPJ telah disahkan oleh WD III** dan berhasil dikirim ke Keuangan Pusat untuk pencairan dana.',
    [
      { name: 'Process ID', value: processId || '-', inline: false },
      { name: 'Waktu',      value: new Date().toLocaleString('id-ID'), inline: false },
    ]
  );
 
  res.json({ status: 'ok', processId, submittedAt: new Date().toISOString() });
});
 
// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    discordConfigured: !!DISCORD_WEBHOOK,
    uptime: process.uptime(),
  });
});
 
// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Notification API berjalan di port ${PORT}`);
  console.log(`   Discord webhook: ${DISCORD_WEBHOOK ? '✅ Terkonfigurasi' : '⚠️  Belum diset (DISCORD_WEBHOOK_URL)'}`);
});


