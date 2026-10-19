(function(root){
  'use strict';
  function number(value,name,{min=0,max=Number.MAX_SAFE_INTEGER,integer=false}={}){
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isSafeInteger(value)))throw new RangeError(name+' 입력값을 확인해 주세요.');
    return value;
  }
  const money=(value,name)=>number(value,name,{integer:true});
  function incomeTax(base){const bands=[[14000000,.06,0],[50000000,.15,1260000],[88000000,.24,5760000],[150000000,.35,15440000],[300000000,.38,19940000],[500000000,.4,25940000],[1000000000,.42,35940000],[Infinity,.45,65940000]];const [,rate,offset]=bands.find(([limit])=>base<=limit);return Math.max(0,base*rate-offset);}
  function loan(principal,rate,months){
    money(principal,'대출 원금');number(rate,'연이율',{max:100});number(months,'상환 기간',{min:1,max:600,integer:true});
    const monthlyRate=rate/1200;
    // log1p/expm1 avoid cancellation at very small positive rates.
    const monthly=monthlyRate===0?principal/months:principal*monthlyRate/-Math.expm1(-months*Math.log1p(monthlyRate));
    const total=monthly*months;return {monthly,total,interest:Math.max(0,total-principal)};
  }
  function savings(amount,rate,months,type){
    money(amount,'예치금 또는 월 납입액');number(rate,'연이율',{max:100});number(months,'기간',{min:1,max:1200,integer:true});
    if(!['deposit','installment'].includes(type))throw new RangeError('상품 유형을 확인해 주세요.');
    const principal=type==='deposit'?amount:amount*months;
    if(!Number.isSafeInteger(principal))throw new RangeError('납입 원금 합계가 계산 지원 범위를 넘습니다.');
    const gross=type==='deposit'?amount*rate/1200*months:amount*rate/1200*months*(months-1)/2;
    const tax=gross*.154;return {principal,gross,tax,net:principal+gross-tax};
  }
  function pension({salaryOnly,salary,income,saving,irp,extraSaving=0,extraIrp=0}){
    if(typeof salaryOnly!=='boolean')throw new RangeError('소득 유형을 확인해 주세요.');
    money(salaryOnly?salary:income,salaryOnly?'총급여':'종합소득금액');
    for(const [key,value]of Object.entries({saving,irp,extraSaving,extraIrp}))money(value,key);
    if(!Number.isSafeInteger(saving+irp+extraSaving+extraIrp))throw new RangeError('납입액 합계가 계산 지원 범위를 넘습니다.');
    const rate=(salaryOnly?salary<=55000000:income<=45000000)?15:12;
    const base=Math.min(Math.min(saving,6000000)+irp,9000000),futureBase=Math.min(Math.min(saving+extraSaving,6000000)+irp+extraIrp,9000000),remaining=Math.max(0,9000000-base);
    return {rate,base,futureBase,remaining,remainingSaving:Math.min(Math.max(0,6000000-saving),remaining),national:base*rate/100,futureNational:futureBase*rate/100};
  }
  function retirementTax(amount,years,nontax=0){
    money(amount,'퇴직급여');money(nontax,'비과세액');number(years,'근속연수',{min:1,max:100,integer:true});
    if(nontax>amount)throw new RangeError('비과세액은 퇴직급여보다 클 수 없습니다.');
    const taxable=amount-nontax,service=years<=5?years*1000000:years<=10?5000000+(years-5)*2000000:years<=20?15000000+(years-10)*2500000:40000000+(years-20)*3000000;
    const converted=Math.max(0,taxable-service)*12/years;
    const allowance=converted<=8000000?converted:converted<=70000000?8000000+(converted-8000000)*.6:converted<=100000000?45200000+(converted-70000000)*.55:converted<=300000000?61700000+(converted-100000000)*.45:151700000+(converted-300000000)*.35;
    const base=Math.max(0,converted-allowance),national=incomeTax(base)/12*years;
    return {taxable,service:Math.min(taxable,service),converted,allowance,base,national,local:national*.1,total:national*1.1};
  }
  function date(value,label){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new RangeError(label+'을 입력해 주세요.');const d=new Date(value+'T00:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw new RangeError(label+'을 확인해 주세요.');return d;}
  function retirement({start,last,wages,bonus=0,leave=0,ordinary=0,hours}){
    const first=date(start,'입사일'),end=date(last,'마지막 근무일');
    if(end<first)throw new RangeError('마지막 근무일은 입사일보다 빠를 수 없습니다.');
    for(const [key,value]of Object.entries({wages,bonus,leave,ordinary}))money(value,key);
    number(hours,'주 소정근로시간',{max:168});
    const days=Math.round((end-first)/86400000)+1,exit=new Date(end);exit.setUTCDate(exit.getUTCDate()+1);
    const anniversary=new Date(first);anniversary.setUTCFullYear(first.getUTCFullYear()+1);
    const eligible=exit>=anniversary&&hours>=15;
    if(!eligible)return {days,eligible,amount:null};
    const period=new Date(exit);period.setUTCDate(1);period.setUTCMonth(period.getUTCMonth()-3);period.setUTCDate(Math.min(exit.getUTCDate(),new Date(Date.UTC(period.getUTCFullYear(),period.getUTCMonth()+1,0)).getUTCDate()));
    const calendarDays=Math.round((exit-period)/86400000),avg=(wages+(bonus+leave)*.25)/calendarDays,daily=Math.max(avg,ordinary);
    return {days,eligible,calendarDays,avg,daily,amount:daily*30*days/365};
  }
  const api={loan,savings,pension,retirementTax,retirement};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CalculatorMath=api;
})(typeof globalThis!=='undefined'?globalThis:this);
