// Simple form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contact-form');
  const submitButton = document.getElementById('sendButton');
  const buttonText = document.getElementById('buttonText');
  const buttonLoading = document.getElementById('buttonLoading');
  const alertSuccessMsg = document.getElementById('alertSuccessMsg');
  const alertErrorMsg = document.getElementById('alertErrorMsg');

  // Phone number formatting
  const phoneInput = document.getElementById('phone');
  phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    e.target.value = value;
  });

  // Preencher campos ocultos com dados do navegador
  document.getElementById('screen_height').value = window.screen.height;
  document.getElementById('screen_width').value = window.screen.width;
  document.getElementById('user_agent').value = navigator.userAgent;
  document.getElementById('referrer').value = document.referrer;
  document.getElementById('submission_date').value = new Date().toISOString();
  // Detectar tipo de dispositivo
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }
  document.getElementById('device_type').value = getDeviceType();
  // Preencher UTM se houver na URL
  function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || '';
  }
  document.getElementById('utm_source').value = getUrlParam('utm_source');
  document.getElementById('utm_medium').value = getUrlParam('utm_medium');
  document.getElementById('utm_campaign').value = getUrlParam('utm_campaign');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      document.getElementById('latitude').value = position.coords.latitude;
      document.getElementById('longitude').value = position.coords.longitude;
    });
  }

  // Show loading state
  function showLoading() {
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline';
  }

  // Hide loading state
  function hideLoading() {
    submitButton.disabled = false;
    buttonText.style.display = 'inline';
    buttonLoading.style.display = 'none';
  }

  // Show success message
  function showSuccess() {
    alertSuccessMsg.style.display = 'block';
    setTimeout(() => {
      alertSuccessMsg.style.display = 'none';
    }, 5000);
  }

  // Show error message
  function showError() {
    alertErrorMsg.style.display = 'block';
    setTimeout(() => {
      alertErrorMsg.style.display = 'none';
    }, 5000);
  }

  // Form submission
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.replace(/\D/g, '');
    const neighborhood = document.getElementById('neighborhood').value;

    if (!name || phone.length < 10 || !neighborhood) {
      showError();
      return;
    }

    showLoading();

    // Get form data
    const formData = {
      name: name,
      phone: phone,
      email: document.getElementById('email').value.trim(),
      neighborhood: neighborhood,
      city: document.getElementById('city').value,
      description: document.getElementById('description').value.trim(),
      latitude: document.getElementById('latitude').value,
      longitude: document.getElementById('longitude').value,
      screen_height: document.getElementById('screen_height').value,
      screen_width: document.getElementById('screen_width').value,
      user_agent: document.getElementById('user_agent').value,
      utm_source: document.getElementById('utm_source').value,
      utm_medium: document.getElementById('utm_medium').value,
      utm_campaign: document.getElementById('utm_campaign').value,
      referrer: document.getElementById('referrer').value,
      submission_date: document.getElementById('submission_date').value,
      device_type: document.getElementById('device_type').value,
      consent: document.getElementById('consent').checked
    };

    // Send request
    fetch('https://api.verlyvidracaria.com/verly-service/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(async response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Tenta ler o JSON só se houver conteúdo
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    })
    .then(data => {
      hideLoading();
      showSuccess();
      
      // Reset form
      form.reset();
      
      // Track conversion (if Google Analytics is available)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          'event_category': 'lead_generation',
          'event_label': 'contact_form'
        });
      }

      console.log('Lead captured successfully:', data);
      // Redireciona para página de obrigado
      window.location.href = 'obrigado.html';
    })
    .catch(error => {
      hideLoading();
      showError();
      console.error('Error submitting form:', error);
    });
  });
});

// Legacy function for backward compatibility
function submitForm(event) {
  if (event) {
    event.preventDefault();
  }
  document.getElementById('contact-form').dispatchEvent(new Event('submit'));
}
