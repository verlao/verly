function submitForm(event) {
  event.preventDefault(); // Prevent the default form submission

  // Get the form data
  const name = document.querySelector("#name").value
  const phone = document.querySelector("#phone").value
  const email = document.querySelector("#email").value
  const neighborhood = document.querySelector("#neighborhood").value
  const city = document.querySelector("#city").value
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height; 
  const alarmsDiv = document.querySelector('#alarms');


  const headers = {
  'Content-Type': 'application/json'
  };
  // Set the object with the data to send
  const postData = {
      name: name,
      phone: phone.replace('(','').replace(')','').replace('-',''),
      email: email,
      neighborhood: neighborhood,
      city: city
    };

    
  // Send the POST request with the message body using fetch()
  fetch('https://verly-service-production.up.railway.app/verly-service/leads', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(postData)
  })
  .then(response => {
    alertSuccessMsg.style.display = "block";
    setTimeout(function(){
      alertSuccessMsg.style.display = "none";
   }, 5000);
    // Handle the server response
    document.getElementById("contact-form").reset()
    alarmsDiv.focus()
    console.log('Post created successfully!');
  })
  // .catch(error => {
  //   alertErrorMsg.style.display = "block";
  //   alarmsDiv.focus()
  //   setTimeout(function(){
  //     alertErrorMsg.style.display = "none";
  //  }, 5000);
  //   // Handle the errors that occurred during the request
  //   console.error('Error creating post:', error);
  // });
}
