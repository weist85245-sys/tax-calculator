(function(root){
  'use strict';
  const origin='https://tax-calculator-b1a.pages.dev';
  const entries=[
    ['근로소득 간이세액 계산기','국세청 표에서 확인한 월 소득세에 원천징수 선택비율을 적용합니다.','표 확인 세액·선택비율·지방소득세 참고액','공식 간이세액표의 세액을 먼저 확인해 입력','급여·가족 수로 간이세액표를 자동 조회하지 않습니다.'],
    ['일용근로 급여·세금 계산기','일급과 근무·지급 일수로 일용근로 소득세와 지급 참고액을 계산합니다.','소득세·지방소득세·보험료 공제 전 지급액','일급과 균등 지급 묶음의 일수를 입력','일용근로자 자격과 4대 보험은 자동 판정하지 않습니다.'],
    ['퇴직소득세 계산기','퇴직급여와 세법상 근속연수로 일반 퇴직소득 산출세액을 추정합니다.','근속연수공제·환산급여공제·소득세 산출세액','퇴직급여·비과세액·세법상 근속연수를 입력','중간정산·임원 한도·이연과세·연금수령 특례는 제외합니다.'],
    ['월세 세액공제 계산기','총급여·월세와 확인한 공제 요건으로 월세 세액공제 참고액을 계산합니다.','소득 기준·월세 한도·공제율에 따른 참고액','소득 유형과 주택·계약·지급 요건을 확인','법적 자격과 최종 환급액은 자동 확정하지 않습니다.','/rent-tax-credit'],
    ['연금저축·IRP 공제 계산기','연금저축과 IRP 본인 납입액의 공제 대상 한도와 추가 납입 효과를 비교합니다.','현재·추가 납입의 공제 대상액과 소득세 공제 참고액','소득 유형과 본인 납입액·추가 계획액을 입력','실제 환급액·ISA 전환 등 특례·계좌 납입 가능액은 확정하지 않습니다.','/pension-tax-credit'],
    ['의료비·교육비 공제 계산기','확인한 공제 대상 의료비·교육비에 입력 공제율을 적용하는 간편 계산입니다.','의료비 기준 초과액과 공제 참고액','보전액·개인별 한도를 확인한 공제 대상 금액을 입력','의료비 특별 공제율과 모든 대상자별 한도를 자동 적용하지 않습니다.'],
    ['양도소득세 계산기','양도가액에서 취득가액·경비·입력 공제를 뺀 금액에 단일 세율을 적용합니다.','입력 조건의 양도차익과 단일 세율 시나리오','공제액과 세율을 직접 확인해 입력','비과세·중과·장기보유공제·누진공제·지방소득세는 자동 계산하지 않습니다.'],
    ['증여세 계산기','일반 현금 첫 증여의 관계별 공제와 누진세율로 산출세액을 추정합니다.','확인한 관계·거주자 조건의 현금 증여 산출세액','과거 증여·공제 사용 여부와 거주자 여부를 확인','과거 증여 합산·혼인출산 특례·세대생략 할증·재산 평가는 제외합니다.'],
    ['상속세 계산기','상속재산과 직접 입력한 채무·공제액에 일반 누진세율을 적용합니다.','입력 공제 후 과세표준과 일반 산출세액','채무·공제액·사전증여 합산액을 직접 확인','공제 자격·재산 평가·할증·신고세액공제·납부세액은 확정하지 않습니다.'],
    ['종합부동산세 계산기','공시가격·직접 입력 공제·가액비율·단일 세율로 참고액을 계산합니다.','입력 조건의 단일 세율 시나리오','공제액·가액비율·세율을 직접 확인','누진공제·재산세 공제·세액공제·세부담 상한·부가세목은 제외합니다.'],
    ['재산세 계산기','공시가격과 직접 입력한 가액비율·세율로 단순 재산세 참고액을 계산합니다.','입력 비율·단일 세율에 따른 참고액','공시가격·가액비율·적용 세율을 직접 확인','누진공제·주택 특례·세부담 상한·도시지역분·지방교육세는 제외합니다.'],
    ['주택임대소득세 계산기','임대수입에서 경비·입력 공제를 빼고 입력 세율을 적용합니다.','입력 조건의 임대소득·단순 세액','필요경비·공제액·세율을 직접 확인','분리과세 선택·등록임대 요건·소득 합산·지방소득세는 판정하지 않습니다.'],
    ['자동차 취득세 계산기','차량 가격과 직접 확인한 세율·감면액으로 취득세 참고액을 계산합니다.','차량 가격에 입력 세율을 적용한 참고액','차량별 세율과 감면액을 직접 확인','차종별 과세표준·감면 자격·등록 비용은 자동 판정하지 않습니다.'],
    ['자동차세·연납 비교 계산기','배기량과 입력한 세액·교육세율·연납 할인율로 납부 참고액을 비교합니다.','할인 전·후 자동차세와 할인 참고액','cc당 세액과 해당 납부월의 실제 할인율을 확인','차령 경감·전기차·영업용 등 별도 기준은 자동 적용하지 않습니다.'],
    ['DSR·DTI·LTV 계산기','소득·원리금·주택가격 대비 비율을 비교하는 간편 계산입니다.','입력 조건의 DSR·LTV와 제한적인 DTI 참고 비율','연 원리금·소득·주택가격과 비교 기준을 입력','DTI는 기타대출 이자가 빠진 참고값입니다. 법정 규제·대출 승인 여부는 판단하지 않습니다.'],
    ['중도상환수수료 계산기','잔액과 계약상 수수료율·잔여기간으로 중도상환수수료를 추정합니다.','입력 잔여기간 비율에 따른 수수료 참고액','계약서의 수수료율과 기간을 확인','면제조건·일수 계산·금융기관별 약정은 자동 적용하지 않습니다.'],
    ['대출 갈아타기 비교','기존·신규 금리와 전환비용으로 잔여기간의 총 납입액을 비교합니다.','원리금균등 가정의 기존·신규 총비용 차이','원금·잔여기간·금리·전환비용을 입력','변동금리·상품별 비용·승인 여부는 예측하지 않습니다.'],
    ['저축 목표·월 납입액 계산기','목표액·현재 저축·기간·이율로 필요한 월 납입액을 추정합니다.','입력 이율을 가정한 목표 달성 월 납입액','목표액·현재 저축액·기간·연이율을 입력','세금·실제 납입일·금리 변동·상품 조건은 반영하지 않습니다.'],
    ['배당금 세후 계산기','세전 배당액에 직접 확인한 원천징수율을 적용합니다.','원천징수액과 세후 배당 참고액','배당액과 원천징수율을 직접 확인','최종 종합과세·고배당 분리과세·외국납부세액 처리는 계산하지 않습니다.'],
    ['주식 매매 손익 계산기','매수·매도 금액에서 입력 수수료·매도세금을 차감한 손익을 계산합니다.','입력 거래의 비용 차감 손익','시장·상품별 수수료율과 거래세율을 확인','해외주식·대주주 양도소득세와 연간 세금 정산은 제외합니다.'],
    ['환전·환율 손익 계산기','외화 금액·매수 및 매도 환율·입력 수수료율로 원화 손익을 비교합니다.','입력 환율과 매도 수수료 가정의 원화 손익','적용 환율·수수료율을 직접 입력','매수 측 별도 수수료·환율 우대·향후 환율은 자동 반영하지 않습니다.'],
    ['자동차 할부금 계산기','차량 가격·선수금·금리·기간·잔존가치로 월 할부 참고액을 계산합니다.','입력 원금의 일반 원리금균등 참고액','선수금·연이율·개월 수·잔존가치를 입력','잔존가치에 대한 이자·실제 상품 상환표·수수료는 반영하지 않습니다.']
  ];
  const pages=entries.map(([title,description,scope,inputs,exclusions,path],index)=>({index,title,description,scope,inputs,exclusions,path}));
  function resolve(pathname,search){
    const path=pathname.replace(/\.html$/,'').replace(/\/$/,'');
    const dedicated=pages.find(page=>page.path===path);
    const params=new URLSearchParams(search),tool=params.get('tool');
    const matches=params.getAll('tool');
    const page=dedicated||(tool===null?pages[0]:pages.find(page=>page.title===tool));
    const valid=!!dedicated||(!!page&&matches.length<=1);
    const canonical=page?origin+(page.path||'/finance-tax-calculator?tool='+encodeURIComponent(page.title)):origin+'/finance-tax-calculator';
    return {page:page||pages[0],valid,canonical};
  }
  function apply(document,location){
    const selection=resolve(location.pathname,location.search),page=selection.page;
    const title=selection.valid?page.title+' | 세금한눈에':'계산기를 찾을 수 없습니다 | 세금한눈에';
    const description=selection.valid?page.description:'선택한 계산기를 찾을 수 없습니다. 전체 계산기 목록에서 필요한 도구를 선택하세요.';
    const meta=(attr,key,value)=>{let element=document.head.querySelector('meta['+attr+'="'+key+'"]');if(!element){element=document.createElement('meta');element.setAttribute(attr,key);document.head.append(element);}element.setAttribute('content',value);};
    document.title=title;
    meta('name','description',description);meta('property','og:type','website');meta('property','og:title',title);meta('property','og:description',description);meta('property','og:url',selection.canonical);
    let canonical=document.head.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=selection.canonical;
    const section=document.createElement('section');section.className='card calculator-scope';section.setAttribute('aria-labelledby','calculatorScopeTitle');
    const heading=document.createElement('h2');heading.id='calculatorScopeTitle';heading.textContent=selection.valid?'이 계산기로 확인할 수 있는 범위':'선택한 계산기를 찾을 수 없습니다';section.append(heading);
    if(selection.valid){document.querySelector('#title').textContent=page.title;const intro=document.createElement('p');intro.textContent=description;section.append(intro);const list=document.createElement('dl');for(const [label,text]of [['계산 내용',page.scope],['입력 전 확인',page.inputs],['계산에서 제외',page.exclusions]]){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=text;list.append(dt,dd);}section.append(list);}
    else{meta('name','robots','noindex,follow');document.querySelector('#title').textContent='계산기를 찾을 수 없습니다';document.querySelector('#form').hidden=true;document.querySelector('#desc').textContent=description;document.querySelector('.related-calculators')?.remove();const p=document.createElement('p');p.textContent=description;section.append(p);const link=document.createElement('a');link.href='/calculators';link.textContent='전체 계산기 목록에서 선택하기';section.append(link);}
    document.querySelector('#form').before(section);
    const style=document.createElement('style');style.textContent='.calculator-scope h2{font-size:21px;margin-top:0}.calculator-scope p{color:#40536a}.calculator-scope dt{font-weight:750;margin-top:14px}.calculator-scope dd{margin:4px 0;color:#40536a;overflow-wrap:anywhere}#form[hidden]{display:none!important}';document.head.append(style);
    return selection;
  }
  const api={pages,resolve,apply};if(typeof module==='object'&&module.exports)module.exports=api;else root.CalculatorPages=api;
})(typeof globalThis!=='undefined'?globalThis:this);
