const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Ad Request proxy ──────────────────────────────────────────────────────────
app.post('/api/ad-request', async (req, res) => {
  const { domain, client_id, cli_ubid, pt, au, pcnt_au, rn, os_name, os_version } = req.body;

  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('cli_ubid', cli_ubid);
  if (pt) params.append('pt', pt);
  if (pcnt_au) params.append('pcnt_au', pcnt_au);
  if (rn) params.append('rn', rn);
  if (os_name) params.append('os_name', os_name);
  if (os_version) params.append('os_version', os_version);

  const auArray = Array.isArray(au) ? au : (au ? [au] : []);
  auArray.forEach(a => params.append('au[]', a));

  const url = `https://${domain}/v2/bsda?${params.toString()}`;

  try {
    const response = await axios.get(url, { timeout: 15000 });
    res.json({ success: true, url, status: response.status, data: response.data });
  } catch (err) {
    res.json({
      success: false,
      url,
      error: err.message,
      status: err.response?.status ?? 0,
      data: err.response?.data ?? null
    });
  }
});

// ── Impression proxy ──────────────────────────────────────────────────────────
app.post('/api/impression', async (req, res) => {
  const { uclid, client_id, cli_ubid, event_time, position, os_name, os_version } = req.body;

  const params = new URLSearchParams();
  params.append('event_name', 'funnel_impression');
  params.append('uclid', uclid);
  params.append('client_id', client_id);
  params.append('cli_ubid', cli_ubid);
  if (event_time) params.append('event_time', event_time);
  if (position != null && position !== '') params.append('position', position);
  if (os_name) params.append('os_name', os_name);
  if (os_version) params.append('os_version', os_version);

  const url = `https://t.o-s.io/events?${params.toString()}`;

  try {
    const response = await axios.post(url, null, {
      timeout: 10000,
      validateStatus: s => s < 500
    });
    const ok = response.status === 204;
    res.json({ success: ok, url, status: response.status });
  } catch (err) {
    res.json({ success: false, url, error: err.message, status: err.response?.status ?? 0 });
  }
});

// ── Click proxy ───────────────────────────────────────────────────────────────
app.post('/api/click', async (req, res) => {
  const { uclid, client_id, cli_ubid, event_time } = req.body;

  const params = new URLSearchParams();
  params.append('uclid', uclid);
  params.append('client_id', client_id);
  params.append('cli_ubid', cli_ubid);
  if (event_time) params.append('event_time', event_time);

  const url = `https://t.o-s.io/aclick/?${params.toString()}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: s => s < 500
    });
    const ok = response.status === 204;
    res.json({ success: ok, url, status: response.status });
  } catch (err) {
    res.json({ success: false, url, error: err.message, status: err.response?.status ?? 0 });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Ad Test Environment  →  http://localhost:${PORT}\n`);
});
