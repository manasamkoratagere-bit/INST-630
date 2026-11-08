/**
 * CHARTS VIEW
 * For: someone who wants the big picture at a glance.
 *   Chart 1 (bar): which types of business were inspected most
 *   Chart 2 (doughnut): how inspections turned out
 */

function orNotListed(value) {
  return value === '------' || value === 'N/A' || value === undefined || value === '' ? 'Not listed' : value;
}

// Count how many records have each value of a field -> { value: count }
function countBy(data, field) {
  const counts = {};
  data.forEach((item) => {
    const key = orNotListed(item[field]);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

// Turn { name: count } into [[name, count], ...] sorted biggest first
function sortedEntries(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// Chart 1 data: top 8 business types, everything else added up as "All other types"
function getCategoryData(data) {
  const entries = sortedEntries(countBy(data, 'category'));
  const top = entries.slice(0, 8);
  const otherTotal = entries.slice(8).reduce((sum, entry) => sum + entry[1], 0);
  if (otherTotal > 0) {
    top.push(['All other types', otherTotal]);
  }
  return top;
}

function showCharts(data) {
  const categoryEntries = getCategoryData(data);
  const resultEntries = sortedEntries(countBy(data, 'inspection_results'));

  const topCategory = categoryEntries[0];
  const topResult = resultEntries[0];

  /*html*/
  return `
    <h2 class="view-title">📈 Charts View</h2>
    <p class="view-description">Patterns in the data at a glance</p>
    <div class="charts-grid">
      <figure class="chart-figure">
        <canvas id="chart-one"></canvas>
        <figcaption class="chart-summary">
          ${topCategory[0]} had the most inspections: ${topCategory[1]} of ${data.length}.
          The chart shows the 8 most inspected types of business.
        </figcaption>
      </figure>
      <figure class="chart-figure">
        <canvas id="chart-two"></canvas>
        <figcaption class="chart-summary">
          The most common inspection result was "${topResult[0]}": ${topResult[1]} of ${data.length} inspections.
        </figcaption>
      </figure>
    </div>
  `;
}

function drawCharts(data) {
  // Chart.js is loaded by a <script> tag in index.html
  if (typeof Chart === 'undefined') {
    document.querySelector('.charts-grid').innerHTML =
      '<p class="error">Chart.js did not load, so the charts can\'t be drawn. Check the &lt;script&gt; tag in index.html.</p>';
    return;
  }

  // ---- Chart 1: bar chart, inspections by type of business ----
  const categoryEntries = getCategoryData(data);
  const categoryLabels = categoryEntries.map((entry) => entry[0]);
  const categoryNumbers = categoryEntries.map((entry) => entry[1]);

  new Chart(document.querySelector('#chart-one'), {
    type: 'bar',
    data: {
      labels: categoryLabels,
      datasets: [
        {
          label: 'Number of inspections',
          data: categoryNumbers,
          backgroundColor: '#007cba',
        },
      ],
    },
    options: {
      indexAxis: 'y', // horizontal bars so long names stay readable
      plugins: {
        title: { display: true, text: 'Inspections by type of business' },
        legend: { display: false },
      },
      scales: {
        x: { title: { display: true, text: 'Number of inspections' }, beginAtZero: true },
        y: { title: { display: true, text: 'Type of business' } },
      },
    },
  });

  // ---- Chart 2: doughnut chart, inspection results ----
  const resultEntries = sortedEntries(countBy(data, 'inspection_results'));
  const resultLabels = resultEntries.map((entry) => entry[0]);
  const resultNumbers = resultEntries.map((entry) => entry[1]);
  const colors = [
    '#007cba', '#28a745', '#ffc107', '#dc3545', '#6f42c1',
    '#fd7e14', '#20c997', '#6c757d', '#e83e8c', '#17a2b8',
  ];

  new Chart(document.querySelector('#chart-two'), {
    type: 'doughnut',
    data: {
      labels: resultLabels,
      datasets: [
        {
          label: 'Inspections',
          data: resultNumbers,
          backgroundColor: colors.slice(0, resultLabels.length),
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: 'Inspection results' },
        legend: { position: 'bottom' },
      },
    },
  });
}

export { showCharts, drawCharts };
