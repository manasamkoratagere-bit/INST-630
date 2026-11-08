/**
 * CHARTS VIEW
 * For: someone who wants the big picture at a glance.
 *   Chart 1 (bar): which types of business were inspected most (top 8)
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

// Chart 1 data: the 8 most inspected types of business
function getCategoryData(data) {
  return sortedEntries(countBy(data, 'category')).slice(0, 8);
}

function showCharts(data) {
  const categoryEntries = getCategoryData(data);
  const resultCounts = countBy(data, 'inspection_results');
  const resultEntries = sortedEntries(resultCounts);

  const topCategory = categoryEntries[0];
  // Most common result that is actually listed (skip "Not listed")
  const topResult = resultEntries.find((entry) => entry[0] !== 'Not listed');
  const notListedCount = resultCounts['Not listed'] || 0;

  /*html*/
  return `
    <h2 class="view-title">📈 Charts View</h2>
    <p class="view-description">Patterns in the data at a glance</p>
    <div class="charts-grid">
      <figure class="chart-figure">
        <canvas id="chart-one" role="img" aria-label="Bar chart of inspections by type of business"></canvas>
        <figcaption class="chart-summary">
          ${topCategory[0]} had the most inspections: ${topCategory[1]} of ${data.length}.
          The chart shows the 8 most inspected types of business.
        </figcaption>
      </figure>
      <figure class="chart-figure">
        <canvas id="chart-two" role="img" aria-label="Doughnut chart of inspection results"></canvas>
        <figcaption class="chart-summary">
          Among listed results, "${topResult[0]}" was the most common: ${topResult[1]} of ${data.length} inspections.
          ${notListedCount} inspections have no result listed.
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
        title: { display: true, text: 'Inspections by type of business (top 8)' },
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
