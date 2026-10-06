/* Calculation reports stay in the browser; no input values are transmitted. */
(() => {
  const config = document.currentScript.dataset;
  const result = document.querySelector(config.result);
  const inputs = document.querySelector(config.inputs);
  if (!result || !inputs) return;
  const style = document.createElement('style');
  style.textContent = '.report-tools{margin-top:16px}.report-tools[hidden]{display:none}.report-buttons{display:flex;flex-wrap:wrap;gap:10px}.report-buttons button{flex:1;min-width:130px;width:auto;border:1px solid #bccbdc;border-radius:10px;background:#365e8d;color:#fff;padding:12px;font:700 14px/1.5 system-ui;cursor:pointer}.report-buttons button:disabled{opacity:.5;cursor:default}.report-status{font:600 13px/1.6 system-ui;color:#365e8d}.report-status.stale{color:#b42318;font-weight:800}.report-fallback{box-sizing:border-box;width:100%;min-height:220px;padding:12px;font:14px/1.6 system-ui}.report-fallback[hidden]{display:none}@media print{.report-tools{display:none!important}}';
  document.head.append(style);
  const tools = document.createElement('div');
  tools.className = 'report-tools';
  tools.hidden = true;
  const buttons = document.createElement('div');
  buttons.className = 'report-buttons';
  const copy = document.createElement('button');
  const print = document.createElement('button');
  copy.type = print.type = 'button';
  copy.textContent = '결과와 입력 조건 복사';
  print.textContent = '인쇄 / PDF 저장';
  const status = document.createElement('p');
  status.className = 'report-status';
  status.setAttribute('role', 'status');
  const fallback = document.createElement('textarea');
  fallback.className = 'report-fallback';
  fallback.readOnly = true;
  fallback.hidden = true;
  fallback.setAttribute('aria-label', '복사할 계산 결과');
  buttons.append(copy, print);
  tools.append(buttons, status, fallback);
  result.append(tools);
  let report = '';
  function conditions() {
    const values = [...inputs.querySelectorAll('input,select,textarea')].filter(el => !el.disabled && el.type !== 'hidden' && el.getClientRects().length && !tools.contains(el)).map(el => {
      const label = [...inputs.querySelectorAll('label')].find(label => label.htmlFor === el.id) || el.closest('label');
      const name = label ? label.innerText.trim() : el.getAttribute('aria-label') || el.name || el.id;
      const value = el.type === 'checkbox' ? (el.checked ? '예' : '아니요') : el.tagName === 'SELECT' ? el.selectedOptions[0]?.textContent : el.value;
      return name + ': ' + value;
    });
    const mode = inputs.querySelector('[aria-pressed="true"]');
    if (mode) values.unshift('계산 방식: ' + mode.innerText);
    return values;
  }
  function capture() {
    if (!result.getClientRects().length || result.hidden) { tools.hidden = true; return; }
    // Read rendered text without disturbing the actual result or its observers.
    const text = [...result.childNodes].filter(node => node !== tools).map(node => node.innerText || node.textContent || '').join('\n').trim();
    if (!text) return;
    report = [config.title || document.title, '작성일: ' + new Date().toLocaleDateString('ko-KR'), '', '입력 조건', ...conditions(), '', '계산 결과', text, '', '참고용 예상액이며 확정 세액·환급액·금융기관 확정 금액이 아닙니다.', '개인별 요건과 계산기의 기준·예외 사항을 확인하세요.', location.href].join('\n');
    tools.hidden = false;
    copy.disabled = print.disabled = false;
    status.classList.remove('stale');
    status.textContent = '입력 조건과 참고용 안내를 함께 보관할 수 있어요.';
    fallback.hidden = true;
  }
  const observer = new MutationObserver(records => {
    if (records.some(record => !tools.contains(record.target) && record.target !== tools && !(record.type === 'childList' && [...record.addedNodes, ...record.removedNodes].every(node => node === tools)))) capture();
  });
  observer.observe(result, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  function markStale(event) {
    if (tools.contains(event.target) || tools.hidden) return;
    copy.disabled = print.disabled = true;
    fallback.hidden = true;
    status.classList.add('stale');
    status.textContent = '입력값이 바뀌었습니다. 다시 계산한 뒤 복사·저장하세요.';
  }
  inputs.addEventListener('input', markStale);
  inputs.addEventListener('change', markStale);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(report);
      status.textContent = '입력 조건과 계산 결과를 복사했어요.';
      fallback.hidden = true;
    } catch {
      fallback.value = report;
      fallback.hidden = false;
      fallback.focus();
      fallback.select();
      status.textContent = '아래 내용을 복사 단축키 또는 길게 눌러 복사하세요.';
    }
  });
  print.addEventListener('click', () => {
    const popup = window.open('', '_blank', 'width=800,height=700');
    if (!popup) { status.textContent = '팝업이 차단됐어요. 이 사이트의 팝업을 허용한 뒤 다시 선택해 주세요.'; return; }
    const escape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    popup.document.write('<!doctype html><html lang="ko"><meta charset="utf-8"><title>세금한눈에 계산 결과</title><style>body{max-width:760px;margin:30px auto;padding:20px;font:16px/1.7 system-ui;color:#202c3d}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}button{padding:12px;font:inherit}@media print{button{display:none}body{margin:0}}</style><h1>세금한눈에 계산 결과</h1><pre>' + escape(report) + '</pre><button onclick="window.print()">인쇄 / PDF 저장</button></html>');
    popup.document.close();
    popup.focus();
    popup.print();
  });
  capture();
})();
