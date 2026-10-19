const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
// Execute the actual page scripts. Expected figures are independent worked examples.
function page(file, marker, values) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes(marker));
  assert.ok(script, 'page calculation script exists');
  const nodes = new Map();
  function node(selector) {
    if (!nodes.has(selector)) nodes.set(selector, {
      value: String(values[selector] ?? '0'), textContent: '', innerHTML: '', hidden: true,
      style: {}, attributes: {}, listeners: {}, classList: { add() {}, remove() {} },
      addEventListener(type, fn) { this.listeners[type] = fn; }, focus() {},
      setAttribute(k, v) { this.attributes[k] = v; }, removeAttribute(k) { delete this.attributes[k]; }
    });
    return nodes.get(selector);
  }
  const document = { querySelector: node, querySelectorAll() { return []; } };
  vm.runInNewContext(script, { document, setTimeout() {} });
  return { node, submit(selector) { node(selector).listeners.submit({ preventDefault() {} }); } };
}
function card(values) {
  const p = page('card-checker.html', "const floorOffset=", {
    '#salary': 40000000, '#credit': 0, '#debit': 0, '#market': 0,
    '#transit': 0, '#culture': 0, '#children': 0, ...values
  });
  p.submit('#cardForm');
  return p;
}
for (const [name, values, expected] of [
  ['at 25% threshold', { '#credit': 10000000 }, '0원'],
  ['mixed credit and debit', { '#credit': 12000000, '#debit': 3000000 }, '1,200,000원'],
  ['ordinary base cap', { '#credit': 50000000 }, '3,000,000원'],
  ['two-child base cap', { '#credit': 50000000, '#children': 2 }, '4,000,000원'],
  ['special spending extra cap', { '#credit': 50000000, '#market': 10000000, '#children': 2 }, '7,000,000원'],
  ['salary over 70m, one-child cap', { '#salary': 70000001, '#credit': 70000000, '#children': 1 }, '2,750,000원']
]) test('card: ' + name, () => assert.equal(card(values).node('#resultMain').textContent, expected));
for (const value of ['1.5', '-1', '', '21']) test('card rejects child count ' + JSON.stringify(value), () => {
  const p = card({ '#children': value });
  assert.equal(p.node('#result').hidden, true);
  assert.equal(p.node('#childrenError').hidden, false);
  assert.equal(p.node('#children').attributes['aria-invalid'], 'true');
});
test('card accepts corrected child count after error', () => {
  const p = card({ '#children': '1.5' });
  p.node('#children').value = '1'; p.node('#credit').value = '50000000'; p.submit('#cardForm');
  assert.equal(p.node('#childrenError').hidden, true);
  assert.equal(p.node('#resultMain').textContent, '3,500,000원');
});
function salary(values) {
  return page('index.html', 'function estimate(', {
    '#salaryInput': 60000000, '#dependents': 1, '#nontax': 200000, '#children': 0, ...values
  });
}
test('salary: 60m salary pension and employment shares', () => {
  const p = salary({});
  assert.equal(p.node('#pensionResult').textContent, '228,000원');
  assert.equal(p.node('#employmentResult').textContent, '43,200원');
  assert.equal(p.node('#healthResult').textContent, '195,235원');
});
test('salary: pension upper cap', () => assert.equal(salary({ '#salaryInput': 120000000 }).node('#pensionResult').textContent, '313,025원'));
test('salary: pension lower cap', () => assert.equal(salary({ '#salaryInput': 1200000, '#nontax': 0 }).node('#pensionResult').textContent, '19,475원'));
test('salary: zero salary does not charge insurance', () => {
  const p = salary({ '#salaryInput': 0, '#nontax': 0 });
  for (const id of ['#pensionResult', '#healthResult', '#employmentResult', '#taxResult']) assert.equal(p.node(id).textContent, '0원');
});
test('2026 child-credit guidance includes amendment and transition exclusion', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.ok(html.includes('2017년생은 제외'));
  assert.ok(!html.includes('8~20세'));
});

for (const [name, values, field] of [
  ['blank salary', {'#salaryInput':''}, '#salaryInput'],
  ['salary beyond supported maximum', {'#salaryInput':'10000000001'}, '#salaryInput'],
  ['negative salary', {'#salaryInput':'-1'}, '#salaryInput'],
  ['fractional family count', {'#dependents':'1.5'}, '#dependents'],
  ['missing family count', {'#dependents':''}, '#dependents'],
  ['too many family members', {'#dependents':'21'}, '#dependents'],
  ['children exceed family count', {'#dependents':'1','#children':'1'}, '#children'],
  ['negative non-taxable pay', {'#nontax':'-1'}, '#nontax'],
  ['non-taxable pay exceeds monthly salary', {'#salaryInput':1200000,'#nontax':200000}, '#nontax']
]) test('salary rejects ' + name, () => {
  const p=salary(values);
  assert.equal(p.node('.result-panel').hidden,true);
  assert.equal(p.node('#salaryInputError').hidden,false);
  assert.equal(p.node(field).attributes['aria-invalid'],'true');
});
test('salary hides old output on invalid edit and recovers without changing input', () => {
  const p=salary({});
  p.node('#children').value='2';p.submit('#salaryForm');
  assert.equal(p.node('.result-panel').hidden,true);
  assert.equal(p.node('#children').value,'2');
  p.node('#dependents').value='3';p.submit('#salaryForm');
  assert.equal(p.node('.result-panel').hidden,false);
  assert.equal(p.node('#salaryInputError').hidden,true);
});
for(const value of ['', '0', '-1', '1.5']) test('card hides old result on invalid salary '+JSON.stringify(value),()=>{
  const p=card({'#credit':50000000});
  assert.equal(p.node('#result').hidden,false);
  p.node('#salary').value=value;p.submit('#cardForm');
  assert.equal(p.node('#result').hidden,true);
  assert.equal(p.node('#cardInputError').hidden,false);
});
test('card hides stale result immediately when input changes',()=>{
  const p=card({'#credit':50000000});
  assert.equal(p.node('#result').hidden,false);
  p.node('#cardForm').listeners.input();
  assert.equal(p.node('#result').hidden,true);
});
test('card recovers after salary is corrected',()=>{
  const p=card({'#credit':50000000});
  p.node('#salary').value='0';p.submit('#cardForm');
  p.node('#salary').value='40000000';p.submit('#cardForm');
  assert.equal(p.node('#result').hidden,false);
  assert.equal(p.node('#cardInputError').hidden,true);
  assert.equal(p.node('#resultMain').textContent,'3,000,000원');
});
