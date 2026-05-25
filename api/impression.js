'use strict';
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { uclid, client_id, cli_ubid, event_time, position, os_name, os_version } = req.body;

  const params = new URLSearchParams();
  params.append('event_name', 'funnel_impression');
  params.append('uclid',     uclid);
  params.append('client_id', client_id);
  params.append('cli_ubid',  cli_ubid);
  if (event_time)                              params.append('event_time',  event_time);
  if (position != null && position !== '')     params.append('position',    position);
  if (os_name)    params.append('os_name',    os_name);
  if (os_version) params.append('os_version', os_version);

  const url = `https://t.o-s.io/events?${params.toString()}`;

  try {
    const response = await axios.post(url, null, {
      timeout: 10000,
      validateStatus: s => s < 500,
    });
    res.json({ success: response.status === 204, url, status: response.status });
  } catch (err) {
    res.json({ success: false, url, error: err.message, status: err.response?.status ?? 0 });
  }
};
