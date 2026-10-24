(function () {
  const form = document.getElementById('lead-capture-form');
  const thankYou = document.getElementById('thank-you');
  const submitButton = document.getElementById('submit-button');
  const submitAnother = document.getElementById('submit-another');

  const FIELDS = ['parentName', 'phone', 'city', 'kidAge'];

  const PHONE_PATTERN = /^[6-9]\d{9}$/;
  const AGE_PATTERN = /^\d{1,2}$/;

  function clearErrors() {
    FIELDS.forEach((name) => {
      const input = document.getElementById(name);
      const errorEl = document.getElementById('error-' + name);
      input.classList.remove('invalid');
      errorEl.textContent = '';
    });
    document.getElementById('error-form').textContent = '';
  }

  function showFieldError(name, message) {
    const input = document.getElementById(name);
    const errorEl = document.getElementById('error-' + name);
    input.classList.add('invalid');
    errorEl.textContent = message;
  }

  function validate(values) {
    const errors = {};

    const name = values.parentName.trim();
    if (!name || name.length < 2) {
      errors.parentName = 'Enter a valid name (at least 2 characters).';
    }

    const phone = values.phone.trim();
    if (!PHONE_PATTERN.test(phone)) {
      errors.phone = 'Enter a valid 10-digit mobile number.';
    }

    const city = values.city.trim();
    if (!city || city.length < 2) {
      errors.city = 'Enter a valid city.';
    }

    const ageRaw = values.kidAge.trim();
    if (!AGE_PATTERN.test(ageRaw) || Number(ageRaw) < 1 || Number(ageRaw) > 17) {
      errors.kidAge = "Enter the kid's age as a number between 1 and 17.";
    }

    return errors;
  }

  function getValues() {
    const values = {};
    FIELDS.forEach((name) => {
      values[name] = document.getElementById(name).value || '';
    });
    return values;
  }

  // GitHub Pages serves static files only — there's no server here to post to,
  // so this build validates and "submits" entirely client-side (saved to this
  // browser's localStorage as a stand-in). The Node version in /server.js does
  // the same validation server-side and persists real leads to disk.
  function submitLocally(values) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const key = 'lenskartKidsLeads';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          existing.push({ ...values, submittedAt: new Date().toISOString() });
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {
          // localStorage unavailable (private browsing, etc.) — still treat as success.
        }
        resolve({ ok: true });
      }, 500);
    });
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearErrors();

    const values = getValues();
    const clientErrors = validate(values);

    if (Object.keys(clientErrors).length > 0) {
      Object.keys(clientErrors).forEach((name) => showFieldError(name, clientErrors[name]));
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
      const result = await submitLocally(values);
      if (result.ok) {
        form.hidden = true;
        thankYou.hidden = false;
      } else {
        document.getElementById('error-form').textContent = 'Something went wrong. Please try again.';
      }
    } catch {
      document.getElementById('error-form').textContent = 'Something went wrong. Please try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Notify Me';
    }
  });

  submitAnother.addEventListener('click', function () {
    form.reset();
    clearErrors();
    thankYou.hidden = true;
    form.hidden = false;
  });
})();
