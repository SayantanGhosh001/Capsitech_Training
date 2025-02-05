document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");

  document.getElementById("fullName").addEventListener("input", validateFullName);
  document.getElementById("email").addEventListener("input", validateEmail);
  document.getElementById("phone").addEventListener("input", validatePhone);
  document.getElementById("dob").addEventListener("change", validateDOB);
  document.getElementById("city").addEventListener("input", validateCity);
  document.getElementById("state").addEventListener("input", validateState);
  document.getElementById("country").addEventListener("input", validateCountry);
  document.getElementById("address").addEventListener("input", validateAddress);
  document.getElementById("message").addEventListener("input", validateMessage);
  document.getElementById("resume").addEventListener("change", validateResume);
  document.getElementById("terms").addEventListener("change", validateTerms);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (
      validateFullName() &&
      validateEmail() &&
      validatePhone() &&
      validateDOB() &&
      validateCity() &&
      validateState() &&
      validateCountry() &&
      validateAddress() &&
      validateMessage() &&
      validateResume() &&
      validateTerms()
    ) {
      alert("Form submitted successfully!");
      form.reset();
    } else {
      alert("Please correct the errors before submitting.");
    }
  });

  function validateField(id, pattern, errorMsg) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "Error");

    if (!pattern.test(input.value.trim())) {
      error.textContent = errorMsg;
      return false;
    } else {
      error.textContent = "";
      return true;
    }
  }

  function validateFullName() {
    return validateField(
      "fullName",
      /^[A-Za-z\s]{3,}$/,
      "Enter a valid name (Min 3 letters)"
    );
  }

  function validateEmail() {
    return validateField(
      "email",
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Enter a valid email (e.g., example@mail.com)"
    );
  }

  function validatePhone() {
    return validateField(
      "phone",
      /^\d{10}$/,
      "Enter a valid 10-digit phone number"
    );
  }

  function validateDOB() {
    return document.getElementById("dob").value
      ? true
      : ((document.getElementById("dobError").textContent = "Select your DOB"),
        false);
  }

  function validateCity() {
    return validateField(
      "city",
      /^[A-Za-z\s]{2,}$/,
      "Enter a valid city (Min 2 letters)"
    );
  }

  function validateState() {
    return validateField(
      "state",
      /^[A-Za-z\s]{2,}$/,
      "Enter a valid state (Min 2 letters)"
    );
  }

  function validateCountry() {
    return validateField(
      "country",
      /^[A-Za-z\s]{2,}$/,
      "Enter a valid country (Min 2 letters)"
    );
  }

  function validateAddress() {
    return validateField(
      "address",
      /^.{5,}$/,
      "Address must be at least 5 characters"
    );
  }

  function validateMessage() {
    return validateField(
      "message",
      /^.{5,}$/,
      "Message must be at least 5 characters"
    );
  }

  function validateResume() {
    const file = document.getElementById("resume").files[0];
    if (
      !file ||
      !/\.(pdf|doc|docx)$/i.test(file.name) ||
      file.size > 2 * 1024 * 1024
    ) {
      document.getElementById("resumeError").textContent =
        "Upload a valid PDF/DOC/DOCX (Max 2MB)";
      return false;
    }
    document.getElementById("resumeError").textContent = "";
    return true;
  }

  function validateTerms() {
    return document.getElementById("terms").checked
      ? true
      : ((document.getElementById("termsError").textContent =
          "You must agree to the terms & conditions"),
        false);
  }
});
