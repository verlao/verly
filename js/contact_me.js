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
      service: document.getElementById('service').value.trim()
    };

    // Send request
    fetch('https://verly-service-production.up.railway.app/verly-service/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
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
