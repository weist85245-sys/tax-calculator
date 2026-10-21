const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const inputs=require('../calculator-generic-inputs.js');

function check(index,fields,values){
  const controls={};
  for(const field of fields){
    controls[field.id]={value:String(values[field.id]),tagName:'INPUT',disabled:false,attrs:{},
      setAttribute(key,value){this.attrs[key]=value;},
      removeAttribute(key){delete this.attrs[key];},focus(){this.focused=true;}};
  }
  return inputs.validate(fields,index,id=>controls[id]);
}
const money=(id,label)=>({id,l:label,m:1});
const number=(id,label)=>({id,l:label,m:0});

test('invalid money keeps its sign visible and is rejected',()=>{
  const input={value:'-100000000'};
  inputs.formatMoney(input);
  assert.equal(input.value,'-100000000');
  assert.throws(()=>check(16,[money('a','남은 원금'),number('b','잔여개월')],{a:'-100000000',b:120}),/0 이상의 원 단위 정수/);
});
test('valid money is formatted without changing its amount',()=>{
  const input={value:'100000000'};
  inputs.formatMoney(input);
  assert.equal(input.value,'100,000,000');
  assert.equal(check(16,[money('a','남은 원금'),number('b','잔여개월')],{a:input.value,b:120}).a,100000000);
});
test('loan comparison rejects a zero-month term',()=>assert.throws(()=>check(16,[number('b','잔여개월')],{b:0}),/1개월/));
test('ratio calculator rejects a zero annual income',()=>assert.throws(()=>check(14,[money('a','연소득'),money('d','주택가격')],{a:0,d:500000000}),/연소득/));
test('ratio calculator rejects a zero home value',()=>assert.throws(()=>check(14,[money('a','연소득'),money('d','주택가격')],{a:60000000,d:0}),/주택가격/));
test('ratio calculator accepts valid denominators',()=>assert.equal(check(14,[money('a','연소득'),money('d','주택가격')],{a:'60,000,000',d:'500,000,000'}).d,500000000));
test('loan fee rejects a remaining term beyond original term',()=>assert.throws(()=>check(15,[number('b','잔여개월'),number('c','최초기간(개월)')],{b:40,c:36}),/넘을 수 없습니다/));
test('car installment rejects excessive upfront and residual amounts',()=>assert.throws(()=>check(21,[money('a','차량 가격'),money('b','선수금'),money('d','만기 잔존가치'),number('c','기간(개월)')],{a:40000000,b:30000000,d:20000000,c:60}),/차량 가격/));
test('percentage fields reject values over 100',()=>assert.throws(()=>check(18,[number('r','원천징수율 (%)')],{r:101}),/100% 이하/));
test('month fields reject fractions',()=>assert.throws(()=>check(17,[number('c','기간(개월)')],{c:1.5}),/정수/));
test('blank money does not silently become zero',()=>assert.throws(()=>check(18,[money('a','세전 배당액')],{a:''}),/원 단위 정수/));
test('all shared pages load and invoke input validation',()=>{
  for(const file of ['finance-tax-calculator.html','rent-tax-credit.html','pension-tax-credit.html']){
    const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
    assert.ok(html.indexOf('src="/calculator-generic-inputs.js')<html.indexOf('CalculatorGenericInputs.validate'));
    assert.match(html,/form\.noValidate=true/);
  }
});
