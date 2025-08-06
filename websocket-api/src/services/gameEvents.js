const fetch = global.fetch;

function initGameEvents(io) {
  const API_URL = process.env.API_URL;
  if (!API_URL) {
    console.warn('API_URL not set, game events will not be fetched');
    return;
  }

  async function emitStatus() {
    try {
      const res = await fetch(`${API_URL}/game/status`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      io.emit('game_status', data);
    } catch (err) {
      console.error('Failed to fetch game status', err.message);
    }
  }

  setInterval(emitStatus, 5000);
}

module.exports = { initGameEvents };
