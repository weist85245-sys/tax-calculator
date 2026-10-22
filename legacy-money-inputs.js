(() => {
  const style = document.createElement('style');
  style.textContent = '[hidden]{display:none!important}';
  document.head.append(style);
  const message = '금액은 0 이상의 숫자로 입력해 주세요.';
  const valid = value => value === '' || /^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(value);
  document.addEventListener('input', event => {
    const input = event.target;
    if (!input.matches?.('[data-money]')) return;
    const raw = input.value.trim();
    const errorId = `${input.id}-money-error`;
    let error = document.getElementById(errorId);
    if (!error) {
      error = document.createElement('p');
      error.id = errorId;
      error.setAttribute('role', 'alert');
      error.style.cssText = 'color:#b42318;font-weight:700;margin:6px 0';
      input.insertAdjacentElement('afterend', error);
      input.setAttribute('aria-describedby', [input.getAttribute('aria-describedby'), errorId].filter(Boolean).join(' '));
    }
    const invalid = !valid(raw);
    input.setCustomValidity(invalid ? message : '');
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    error.textContent = invalid ? message : '';
    error.hidden = !invalid;
    const liveResult = input.id === 'price' ? document.querySelector('.result-panel')
      : (input.id === 'amount' && document.querySelector('#exclusiveMode') ? document.querySelector('.results') : null);
    if (liveResult) liveResult.hidden = invalid;
    if (invalid) {
      document.querySelector('#result')?.setAttribute('hidden', '');
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('submit', event => {
    if (event.target.id === 'form') document.querySelector('#result')?.removeAttribute('hidden');
  }, true);
})();
