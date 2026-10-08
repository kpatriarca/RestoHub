const BOROUGHS = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'];
const GRADES = ['A', 'B', 'C'];
const clean = value => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

function validateRestaurant(body) {
  const data = {
    name: clean(body.name), borough: clean(body.borough), cuisine: clean(body.cuisine),
    address: { building: clean(body.address?.building), street: clean(body.address?.street), zipcode: clean(body.address?.zipcode) },
    grade: clean(body.grade).toUpperCase(), score: body.score === '' || body.score == null ? NaN : Number(body.score)
  };
  const errors = {};
  if (!data.name) errors.name = 'Restaurant name is required.';
  if (!BOROUGHS.includes(data.borough)) errors.borough = 'Please select a valid borough.';
  if (!data.cuisine) errors.cuisine = 'Cuisine is required.';
  if (!data.address.building) errors.building = 'Building is required.';
  if (!data.address.street) errors.street = 'Street is required.';
  if (!/^\d{5}(?:-\d{4})?$/.test(data.address.zipcode)) errors.zipcode = 'Please enter a valid ZIP code.';
  if (!GRADES.includes(data.grade)) errors.grade = 'Please select a valid grade.';
  if (!Number.isFinite(data.score) || data.score < 0) errors.score = 'Score must be a valid non-negative number.';
  return { data, errors, valid: Object.keys(errors).length === 0 };
}
module.exports = { validateRestaurant, BOROUGHS, GRADES };
