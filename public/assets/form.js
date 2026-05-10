(function(){
  function attach(form){
    const status = form.parentNode.querySelector('.form-status');
    const variant = form.dataset.variant || 'unknown';
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit');
      btn.disabled = true; btn.textContent = 'Sending…';
      const data = {
        name: form.name.value,
        phone: form.phone.value,
        email: form.email.value,
        notes: form.notes ? form.notes.value : '',
        variant
      };
      try {
        const r = await fetch('/api/lead', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        });
        const j = await r.json();
        if (r.ok && j.ok) {
          status.textContent = "Got it. We'll text you within 24 hours.";
          status.className = 'form-status ok';
          form.reset();
          btn.textContent = "Submitted ✓";
          // Optional: pixel firing
          if (window.fbq) try{ fbq('track','Lead'); }catch(e){}
        } else {
          status.textContent = (j && j.error === 'missing-fields') ? 'Need name, phone, and email.' : 'Something went sideways. Try again?';
          status.className = 'form-status err';
          btn.disabled = false; btn.textContent = form.dataset.cta || 'Submit';
        }
      } catch (err) {
        status.textContent = 'Network error. Try again?';
        status.className = 'form-status err';
        btn.disabled = false; btn.textContent = form.dataset.cta || 'Submit';
      }
    });
  }
  document.querySelectorAll('form[data-lead-form]').forEach(attach);
})();
