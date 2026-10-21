(function(root){
  'use strict';

  function formatMoney(input){
    const raw=input.value;
    if(!/^\d[\d,]*$/.test(raw))return;
    const digits=raw.replace(/,/g,'');
    const amount=Number(digits);
    if(Number.isSafeInteger(amount))input.value=amount.toLocaleString('ko-KR');
  }

  function validate(fields,index,lookup){
    const values={};
    for(const field of fields){
      const input=lookup(field.id);
      if(input.disabled)continue;
      input.removeAttribute('aria-invalid');
      const raw=input.value.trim();
      if(input.tagName==='SELECT'){
        if(raw==='')fail(input,field.l+' 항목을 선택해 주세요.');
        values[field.id]=raw;
        continue;
      }
      const valid=field.m
        ? /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(raw)
        : /^\d+(?:\.\d+)?$/.test(raw);
      const value=Number(raw.replace(/,/g,''));
      if(!valid||!Number.isFinite(value)||value<0||(field.m&&!Number.isSafeInteger(value))){
        fail(input,field.l+' 입력값은 0 이상의 '+(field.m?'원 단위 정수':'숫자')+'로 입력해 주세요.');
      }
      if(field.l.includes('%')&&value>100)fail(input,field.l+' 입력값은 100% 이하로 입력해 주세요.');
      if(/(?:일수|개월|연수|가족 수|자녀 수|배기량)/.test(field.l)&&!Number.isSafeInteger(value)){
        fail(input,field.l+' 입력값은 정수로 입력해 주세요.');
      }
      values[field.id]=value;
    }
    const positive=(id,message)=>{if(values[id]<=0)fail(lookup(id),message);};
    if(index===1){positive('b','총 근무 일수는 1일 이상이어야 합니다.');positive('c','한 번에 지급하는 근무 일수는 1일 이상이어야 합니다.');}
    if(index===2)positive('b','세법상 근속연수는 1년 이상이어야 합니다.');
    if(index===3)positive('salary','총급여는 0원보다 커야 합니다.');
    if(index===14){positive('a','연소득은 0원보다 커야 비율을 계산할 수 있습니다.');positive('d','주택가격은 0원보다 커야 비율을 계산할 수 있습니다.');}
    if(index===15){positive('c','최초기간은 1개월 이상이어야 합니다.');if(values.b>values.c)fail(lookup('b'),'잔여개월은 최초기간을 넘을 수 없습니다.');}
    if(index===16)positive('b','잔여개월은 1개월 이상이어야 합니다.');
    if(index===17)positive('c','기간은 1개월 이상이어야 합니다.');
    if(index===21){positive('c','기간은 1개월 이상이어야 합니다.');if(values.b+values.d>values.a)fail(lookup('b'),'선수금과 만기 잔존가치의 합계는 차량 가격을 넘을 수 없습니다.');}
    return values;
  }

  function fail(input,message){
    input.setAttribute('aria-invalid','true');
    input.focus();
    throw new RangeError(message);
  }

  const api={formatMoney,validate};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CalculatorGenericInputs=api;
})(typeof globalThis!=='undefined'?globalThis:this);
