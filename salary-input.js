(() => {
  const input = document.querySelector('#salaryInput');
  const amount = document.querySelector('#salaryAmountText');
  if (!input || !amount) return;
  function describe() {
    if (!/^[0-9,]*$/.test(input.value)) { amount.textContent = '연봉을 원 단위 정수로 입력해 주세요.'; return; }
    const digits = input.value.replace(/,/g, '');
    if (!digits) { amount.textContent = '연봉을 입력해 주세요.'; return; }
    const value = Number(digits);
    const eok = Math.floor(value / 100000000);
    const man = Math.floor(value % 100000000 / 10000);
    const won = value % 10000;
    amount.textContent = '세전 연봉 ' + ([eok && eok.toLocaleString('ko-KR') + '억', man && man.toLocaleString('ko-KR') + '만', won && won.toLocaleString('ko-KR')].filter(Boolean).join(' ') || '0') + ' 원';
  }
  input.addEventListener('input', describe);
  document.querySelectorAll('[data-salary]').forEach(button => {
    button.addEventListener('click', () => {
      input.value = Number(button.dataset.salary).toLocaleString('ko-KR');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      document.querySelector('#salaryForm').requestSubmit();
    });
  });
  describe();
})();
