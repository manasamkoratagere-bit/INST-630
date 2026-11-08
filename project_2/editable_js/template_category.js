/**
 * CATEGORY VIEW
 * For: a reporter looking for patterns. Which types of business get inspected most,
 * and which ones fail the most checks on average?
 */

const CHECKS = [
  'food_from_approved_source',
  'food_protected_from',
  'ill_workers_restricted',
  'proper_hand_washing',
  'cooling_time_and_temperature',
  'cold_holding_temperature',
  'hot_holding_temperature',
  'cooking_time_and_temperature',
  'reheating_time_and_temperature',
  'hot_and_cold_running_water',
  'proper_sewage_disposal',
  'no_bare_hand_contact',
  'adequate_hand_washing',
  'rodent_and_insects',
  'food_contact_surfaces_and',
];

function orNotListed(value) {
  return value === '------' || value === 'N/A' || value === undefined || value === '' ? 'Not listed' : value;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function countFailedChecks(inspection) {
  return CHECKS.filter((check) => inspection[check] === 'Out of Compliance').length;
}

function showCategories(data) {
  // Step 1: group the records by type of business
  const groups = {};
  data.forEach((inspection) => {
    const key = orNotListed(inspection.category);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(inspection);
  });

  // Step 2: turn each group into a summary object with its two numbers
  const summaries = Object.keys(groups).map((name) => {
    const items = groups[name];
    const totalFailed = items.reduce((sum, item) => sum + countFailedChecks(item), 0);
    return {
      name: name,
      items: items,
      count: items.length,
      averageFailed: totalFailed / items.length,
    };
  });

  // Biggest groups first
  summaries.sort((a, b) => b.count - a.count);

  // Step 3: build the HTML
  const sectionsHTML = summaries
    .map((group) => {
      const itemsHTML = group.items
        .map(
          (inspection) => `
            <div class="category-item">
              <div>
                <strong>${inspection.name}</strong><br>
                <small>${orNotListed(inspection.city)} · ${formatDate(inspection.inspection_date)}</small>
              </div>
              <div>${orNotListed(inspection.inspection_results)}</div>
            </div>`
        )
        .join('');

      return `
        <section class="category-section">
          <h3 class="category-header">
            ${group.name}
            <span style="display: block; font-size: 0.9rem; font-weight: normal; margin-top: 0.25rem;">
              ${group.count} inspections · ${group.averageFailed.toFixed(2)} failed checks on average
            </span>
          </h3>
          <div class="category-items">
            ${itemsHTML}
          </div>
        </section>`;
    })
    .join('');

  /*html*/
  return `
    <h2 class="view-title">📂 Category View</h2>
    <p class="view-description">Inspections grouped by type of business, largest group first</p>
    ${sectionsHTML}
  `;
}

export default showCategories;
