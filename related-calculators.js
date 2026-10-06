(() => {
  const catalog = [
    ['salary','연봉 실수령액','💼','/#salary','월급과 공제 내역 확인','work'],
    ['weekly','주휴수당 급여','⏱️','/weekly-pay','주휴수당 포함 급여 추정','work'],
    ['freelance','프리랜서 3.3%','👩‍💻','/freelance-33','원천징수 후 지급액 확인','work'],
    ['retirement','퇴직금','🧾','/retirement-pay','근속기간과 임금으로 예상액 확인','work'],
    ['card','신용카드 소득공제','💳','/card-checker','카드 사용액의 공제 기준 확인','settlement'],
    ['yearend','연말정산 차액','📅','/year-end-settlement','세액과 기납부액의 차이 확인','settlement'],
    ['income','종합소득세','📊','/comprehensive-income-tax','과세표준과 공제로 예상액 확인','tax'],
    ['acquisition','주택 취득세','🏠','/acquisition-tax','주택 취득 관련 세금 추정','property'],
    ['vat','부가가치세','🧮','/vat','공급가액과 부가세 분리','tax'],
    ['loan','대출 상환','🏦','/loan-calculator','월 상환액과 총 이자 확인','loan'],
    ['savings','예금·적금 이자','💰','/savings-interest','세후 만기액 추정','saving']
  ];
  const shared = [
    ['withholding','근로소득 간이세액 계산기','🧮','월 급여 기준 원천징수 추정','work'],
    ['daily','일용근로 급여·세금 계산기','📆','일급과 근무일수로 지급액 확인','work'],
    ['retirementtax','퇴직소득세 계산기','🧾','퇴직금과 근속연수로 세금 추정','work'],
    ['rent','월세 세액공제 계산기','🔑','월세 공제 요건과 예상액 확인','settlement'],
    ['pension','연금저축·IRP 공제 계산기','🌱','납입액과 추가 공제 여력 확인','settlement'],
    ['medical','의료비·교육비 공제 계산기','🏥','입력 조건의 공제 참고액 확인','settlement'],
    ['capital','양도소득세 계산기','🏘️','입력 세율로 양도세 참고액 확인','property'],
    ['gift','증여세 계산기','🎁','첫 현금 증여의 공제와 세액 추정','estate'],
    ['estate','상속세 계산기','🧬','입력 공제액과 누진세율 적용','estate'],
    ['holding','종합부동산세 계산기','🏙️','직접 입력 기준으로 참고액 확인','property'],
    ['property','재산세 계산기','🏡','공시가격과 입력 세율 적용','property'],
    ['rental','주택임대소득세 계산기','🏠','직접 입력 조건으로 단순 추정','property'],
    ['cartax','자동차 취득세 계산기','🚗','차량가격과 입력 세율 적용','car'],
    ['annualcar','자동차세·연납 비교 계산기','🛣️','입력 할인율로 납부액 비교','car'],
    ['dsr','DSR·DTI·LTV 계산기','📉','소득과 상환액 대비 비율 확인','loan'],
    ['early','중도상환수수료 계산기','🧾','약정 조건으로 수수료 추정','loan'],
    ['refinance','대출 갈아타기 비교','🔄','기존·신규 대출 비용 비교','loan'],
    ['goal','저축 목표·월 납입액 계산기','🎯','목표까지 필요한 월 저축액 확인','saving'],
    ['dividend','배당금 세후 계산기','💵','입력 원천징수율로 세후액 확인','invest'],
    ['stock','주식 매매 손익 계산기','📈','수수료와 세금을 반영한 손익','invest'],
    ['exchange','환전·환율 손익 계산기','💱','환율과 비용으로 원화 손익 확인','invest'],
    ['carloan','자동차 할부금 계산기','🚙','선수금과 이율로 월 납입액 확인','car']
  ];
  shared.forEach(([id,name,icon,description,group]) => catalog.push([id,name,icon,'/finance-tax-calculator?tool='+encodeURIComponent(name),description,group]));
  const requested = new URLSearchParams(location.search).get('tool');
  const currentKey = document.currentScript.dataset.calculator || shared.find(item => item[1] === requested)?.[0] || 'withholding';
  const current = catalog.find(item => item[0] === currentKey);
  if (!current) return;
  // Only calculator identifiers are saved locally; never save financial inputs.
  const historyKey = 'tax-calculator-recent-v1';
  try {
    const raw = JSON.parse(localStorage.getItem(historyKey) || '[]');
    let recent = Array.isArray(raw) ? [...new Set(raw.filter(key => typeof key === 'string' && catalog.some(item => item[0] === key)))].slice(0,6) : [];
    if (currentKey !== 'salary') {
      recent = [currentKey,...recent.filter(key => key !== currentKey)].slice(0,6);
      localStorage.setItem(historyKey,JSON.stringify(recent));
    } else {
      document.querySelector('#salaryForm')?.addEventListener('submit', () => {
        try {
          const saved = JSON.parse(localStorage.getItem(historyKey) || '[]');
          const previous = Array.isArray(saved) ? saved.filter(key => key !== 'salary' && catalog.some(item => item[0] === key)) : [];
          localStorage.setItem(historyKey,JSON.stringify(['salary',...previous].slice(0,6)));
        } catch { /* Calculator operation must not depend on storage access. */ }
      });
      if (recent.length) {
        const recentSection = document.createElement('section');
        recentSection.className = 'recent-calculators wrap';
        const recentTitle = document.createElement('h2');
        recentTitle.textContent = '최근 열어본 계산기';
        const note = document.createElement('p');
        note.textContent = '이 브라우저에서 열어본 계산기입니다. 입력 금액은 저장하지 않습니다.';
        const links = document.createElement('div');
        links.className = 'recent-links';
        recent.forEach(key => {
          const item = catalog.find(item => item[0] === key);
          const link = document.createElement('a');
          link.href = item[3];
          link.textContent = item[2] + ' ' + item[1].replace(/ 계산기$/,'') + ' ↗';
          links.append(link);
        });
        const clear = document.createElement('button');
        clear.type = 'button';
        clear.textContent = '최근 기록 지우기';
        clear.addEventListener('click', () => {
          try { localStorage.removeItem(historyKey); recentSection.remove(); }
          catch { note.textContent = '브라우저 저장소에 접근할 수 없어 기록을 지우지 못했습니다.'; }
        });
        recentSection.append(recentTitle,note,links,clear);
        document.querySelector('#calculators')?.before(recentSection);
      }
    }
  } catch { /* Private browsing or blocked storage: omit the recent list. */ }
  const preferred = {
    salary:['yearend','card','withholding'],weekly:['salary','daily','freelance'],freelance:['income','vat','salary'],
    retirement:['retirementtax','salary','pension'],withholding:['salary','yearend','card'],daily:['weekly','salary','freelance'],retirementtax:['retirement','pension','yearend'],
    card:['yearend','rent','pension'],yearend:['card','rent','pension'],income:['freelance','rental','vat'],vat:['freelance','income','rental'],
    rent:['yearend','card','pension'],pension:['yearend','rent','savings'],medical:['yearend','card','rent'],
    acquisition:['property','loan','holding'],capital:['acquisition','property','holding'],gift:['estate','savings','acquisition'],estate:['gift','property','acquisition'],
    holding:['property','acquisition','rental'],property:['holding','acquisition','rental'],rental:['income','property','vat'],
    loan:['dsr','early','refinance'],dsr:['loan','refinance','early'],early:['refinance','loan','dsr'],refinance:['early','loan','dsr'],
    savings:['goal','pension','dividend'],goal:['savings','loan','pension'],dividend:['stock','savings','exchange'],stock:['dividend','exchange','savings'],exchange:['stock','dividend','savings'],
    cartax:['carloan','annualcar','loan'],annualcar:['cartax','carloan','loan'],carloan:['cartax','annualcar','loan']
  };
  const section = document.createElement('section');
  section.className = 'related-calculators';
  const heading = document.createElement('h2');
  heading.textContent = '함께 확인하면 좋은 계산기';
  const intro = document.createElement('p');
  intro.textContent = '관련 계산기를 바로 열어 필요한 금액을 이어서 확인하세요.';
  const grid = document.createElement('div');
  grid.className = 'related-grid';
  (preferred[currentKey] || []).forEach(key => {
    const item = catalog.find(item => item[0] === key);
    if (!item) return;
    const link = document.createElement('a');
    link.href = item[3];
    const icon = document.createElement('span');
    icon.className = 'related-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent = item[2];
    const title = document.createElement('strong');
    title.textContent = item[1].replace(/ 계산기$/,'');
    const description = document.createElement('span');
    description.className = 'related-description';
    description.textContent = item[4];
    const arrow = document.createElement('span');
    arrow.className = 'related-action';
    arrow.textContent = '바로 계산 ↗';
    link.append(icon,title,description,arrow);
    grid.append(link);
  });
  section.append(heading,intro,grid);
  const style = document.createElement('style');
  style.textContent = '.related-calculators{margin:28px 0;color:#202c3d}.related-calculators h2{font-size:21px;margin:0 0 8px}.related-calculators>p{font-size:14px;color:#53647a;margin:0 0 16px}.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.related-grid a{display:flex;flex-direction:column;gap:8px;padding:18px;border:1px solid #dce4ef;border-radius:14px;background:#fff;color:#202c3d;text-decoration:none}.related-grid a:hover{border-color:#365e8d;background:#f2f6fc}.related-grid a:focus-visible{outline:3px solid #365e8d;outline-offset:3px}.related-icon{font-size:26px}.related-grid strong{font-size:16px}.related-description{font-size:13px;line-height:1.6;color:#53647a}.related-action{margin-top:auto;padding-top:8px;font-size:14px;font-weight:800;color:#365e8d}@media(max-width:560px){.related-grid{grid-template-columns:1fr}.related-grid a{display:grid;grid-template-columns:38px 1fr;gap:5px 12px;padding:14px}.related-icon{grid-row:1/4}.related-description,.related-action{grid-column:2}.related-action{padding-top:4px}}@media print{.related-calculators{display:none}}';
  style.textContent += '.recent-calculators{padding-top:24px;padding-bottom:24px}.recent-calculators h2{font-size:22px;margin:0 0 8px}.recent-calculators p{font-size:13px;color:#53647a}.recent-links{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}.recent-links a{border:1px solid #dce4ef;border-radius:12px;background:#fff;padding:12px 16px;color:#365e8d;text-decoration:none;font-weight:750;font-size:14px}.recent-links a:hover{background:#edf3fa}.recent-links a:focus-visible,.recent-calculators button:focus-visible{outline:3px solid #365e8d;outline-offset:3px}.recent-calculators button{width:auto;border:1px solid #bccbdc;border-radius:8px;background:#fff;color:#53647a;padding:8px 12px;font:600 13px system-ui;cursor:pointer}@media print{.recent-calculators{display:none}}';
  document.head.append(style);
  (currentKey === 'salary' ? document.querySelector('#salary') : document.querySelector('main'))?.append(section);
})();
