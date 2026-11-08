
/**
 * TABLE VIEW
 * For: a health inspector planning visits. Wants to scan many inspections quickly
 * and spot the ones with problems (newest first, with a count of failed checks).
 */

// The 15 food safety checks in data.json
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

// "------", "N/A" and undefined all mean missing
function orNotListed(value) {
  return value === '------' || value === 'N/A' || value === undefined || value === '' ? 'Not listed' : value;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// How many of the 15 checks were "Out of Compliance" in this inspection
function countFailedChecks(inspection) {
  return CHECKS.filter((check) => inspection[check] === 'Out of Compliance').length;
}

function showTable(data) {
  // Newest inspections first (copy the array so we don't change the original)
  const sorted = [...data].sort((a, b) => new Date(b.inspection_date) - new Date(a.inspection_date));

  const rowsHTML = sorted
    .map(
      (inspection) => `
        <tr>
          <th scope="row">${inspection.name}</th>
          <td>${orNotListed(inspection.category)}</td>
          <td>${orNotListed(inspection.city)}</td>
          <td>${formatDate(inspection.inspection_date)}</td>
          <td>${orNotListed(inspection.inspection_results)}</td>
          <td>${countFailedChecks(inspection)}</td>
        </tr>`
    )
    .join('');

  /*html*/
  return `
    <h2 class="view-title">📊 Table View</h2>
    <p class="view-description">Scan every inspection, newest first</p>
    <div style="overflow-x: auto;">
      <table class="restaurant-table">
        <caption>
          ${data.length} food safety inspections in Prince George's County, newest first,
          with the number of the 15 safety checks each one failed.
        </caption>
        <thead>
          <tr>
            <th scope="col">Business</th>
            <th scope="col">Type</th>
            <th scope="col">City</th>
            <th scope="col">Inspected</th>
            <th scope="col">Result</th>
            <th scope="col">Checks failed (of 15)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
        </tbody>
      </table>
    </div>
  `;
}

export default showTable;
