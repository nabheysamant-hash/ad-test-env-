'use strict';
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { domain, client_id, cli_ubid, pt, au, pcnt_au, rn, os_name, os_version } = req.body;

  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('cli_ubid',  cli_ubid);
  if (pt)         params.append('pt',         pt);
  if (pcnt_au)    params.append('pcnt_au',    pcnt_au);
  if (rn)         params.append('rn',         rn);
  if (os_name)    params.append('os_name',    os_name);
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
      error:  err.message,
      status: err.response?.status ?? 0,
      data:   err.response?.data   ?? null,
    });
  }
};
