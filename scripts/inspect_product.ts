import fs from 'fs';

const p = JSON.parse(fs.readFileSync('redux_product_sample.json', 'utf8'));
console.log("Brand:", p.brand);
console.log("Model:", p.model);
console.log("Attributes keys:", Object.keys(p.attributes || {}));
if (p.attributes) {
  // Let's write the first few attributes or group keys
  const groups = Object.keys(p.attributes);
  console.log("Attribute Groups:", groups);
  for (const group of groups) {
    console.log(`\nGroup [${group}]:`);
    const attrs = p.attributes[group];
    for (const attrKey of Object.keys(attrs)) {
      console.log(`  - ${attrKey}: ${JSON.stringify(attrs[attrKey])}`);
    }
  }
}
