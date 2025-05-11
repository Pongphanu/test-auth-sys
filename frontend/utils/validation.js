// utils/validation.js

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation - แก้ไขตามเงื่อนไขใหม่
// - อย่างน้อย 8 ตัวอักษร
// - อย่างน้อย 1 ตัวพิมพ์ใหญ่
// - อย่างน้อย 1 ตัวพิมพ์เล็ก
// - อย่างน้อย 1 ตัวเลข
export const validatePassword = (password) => {
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    // ต้องมีอักษรพิเศษด้วย
    specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
  };
  
  return {
    isValid: Object.values(validations).every(Boolean),
    validations
  };
};

// Password match validation
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Form validation for sign-in
export const validateSignInForm = (values) => {
  const { email, password } = values;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  return errors;
};

// Form validation for sign-up แก้ไขการแสดงข้อความ error ตามเงื่อนไขที่กำหนด
export const validateSignUpForm = (values) => {
  const { firstName, lastName, email, password, confirmPassword } = values;
  const errors = {};

  if (!firstName) {
    errors.firstName = 'First name is required';
  }

  if (!lastName) {
    errors.lastName = 'Last name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else {
    const { isValid, validations } = validatePassword(password);
    if (!isValid) {
      if (!validations.length) {
        errors.password = 'Password must be at least 8 characters long';
      } else if (!validations.uppercase) {
        errors.password = 'Password must contain at least 1 uppercase letter';
      } else if (!validations.lowercase) {
        errors.password = 'Password must contain at least 1 lowercase letter';
      } else if (!validations.number) {
        errors.password = 'Password must contain at least 1 number';
      } else if (!validations.specialChar) {
        errors.password = 'Password must contain at least 1 special character';
      }
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else if (password && confirmPassword && !validatePasswordMatch(password, confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};