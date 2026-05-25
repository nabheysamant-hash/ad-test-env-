'use strict';
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { uclid, client_id, cli_ubid, event_time } = req.body;

  const params = new URLSearchParams();
  params.append('uclid',     uclid);
  params.append('client_id', client_id);
  params.append('cli_ubid',  cli_ubid);
  if (event_time) params.append('event_time', event_time);

  const url = `https://t.o-s.io/aclick/?${params.toString()}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: s => s < 500,
    });
    res.json({ success: response.status === 204, url, status: response.status });
  } catch (err) {
    res.json({ success: false, url, error: err.message, status: err.response?.status ?? 0 });
  }
};
