/**
 * Broadsheet Masthead & Concurrency Monitor
 */

let weatherInterval = null;
let concurrencyInterval = null;

export function initMasthead() {
  const dateElement = document.getElementById('liveIssueDate');
  if (dateElement) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    dateElement.textContent = `Bangalore • ${now.toLocaleDateString('en-GB', options)} Edition`;
  }

  const weatherTempEl = document.getElementById('weatherTemp');
  const weatherStates = [
    '24°C High Concurrency',
    '23°C Peak Traffic Flow',
    '25°C Zero-Latency Peak',
    '24°C High Concurrency'
  ];
  let weatherIndex = 0;
  weatherInterval = setInterval(() => {
    weatherIndex = (weatherIndex + 1) % weatherStates.length;
    if (weatherTempEl) {
      weatherTempEl.textContent = weatherStates[weatherIndex];
    }
  }, 12000);

  const concurrencyEl = document.getElementById('concurrencyStatus');
  const concurrencyStates = [
    'Operational 99.99%',
    'Distributed Mesh 100%',
    'Zero-Downtime Peak',
    'Latency <15ms Stable'
  ];
  let concurrencyIndex = 0;
  concurrencyInterval = setInterval(() => {
    concurrencyIndex = (concurrencyIndex + 1) % concurrencyStates.length;
    if (concurrencyEl) {
      concurrencyEl.textContent = concurrencyStates[concurrencyIndex];
    }
  }, 9000);

  return destroyMasthead;
}

export function destroyMasthead() {
  if (weatherInterval) clearInterval(weatherInterval);
  if (concurrencyInterval) clearInterval(concurrencyInterval);
  weatherInterval = null;
  concurrencyInterval = null;
}
