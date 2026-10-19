(() => {
  const form=document.querySelector('#form'),result=document.querySelector('#result');
  if(!form||!result)return;
  form.noValidate=true;
  const error=document.createElement('p');error.id='calculationInputError';error.setAttribute('role','alert');error.style.cssText='color:#b42318;font-weight:750;line-height:1.7';error.hidden=true;
  form.querySelector('button').before(error);
  const style=document.createElement('style');style.textContent='#result[hidden]{display:none!important}';document.head.append(style);
  const fields=[...form.querySelectorAll('input,select')];
  fields.forEach(input=>{input.setAttribute('aria-describedby',((input.getAttribute('aria-describedby')||'')+' calculationInputError').trim());});
  function stale(){result.hidden=true;error.hidden=true;}
  form.addEventListener('input',stale);form.addEventListener('change',stale);
  window.CalculatorInputs={
    read(id){const input=document.getElementById(id),raw=input.value.trim();const label=form.querySelector('label[for="'+id+'"]')?.textContent||id;
      const money=input.hasAttribute('data-money'),valid=money?/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(raw):/^\d+(?:\.\d+)?$/.test(raw);
      if(!valid)throw new RangeError(label+'을 올바른 숫자로 입력해 주세요.');
      const value=Number(raw.replace(/,/g,''));if(!Number.isFinite(value)||(money&&!Number.isSafeInteger(value)))throw new RangeError(label+' 입력값이 계산 지원 범위를 넘습니다.');return value;},
    run(callback){stale();try{callback();result.hidden=false;error.hidden=true;}catch(e){error.textContent=e.message||'입력값을 확인해 주세요.';error.hidden=false;result.hidden=true;}},
    format(input){if(!/^[0-9,]*$/.test(input.value))return;const raw=input.value.replace(/,/g,'');if(raw&&Number.isSafeInteger(Number(raw)))input.value=Number(raw).toLocaleString('ko-KR');}
  };
})();
