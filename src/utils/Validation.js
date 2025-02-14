const russianLettersRegex = /^[а-яА-ЯёЁ]+$/;

const loginRegex = /^[a-zA-Z0-9_.]+$/;


export const validateField = (name, value) => {
    switch (name) {
      case 'fname':
        return russianLettersRegex.test(value) && value.length >= 3;
      case 'lname':
        return russianLettersRegex.test(value) && value.length >= 3;
      case 'sname':
        return (value.length === 0 || value.length >= 3);
      case 'login':
        return loginRegex.test(value) && value.length >= 3;
      case 'password':
        return value.length >= 6;
      case 'confirmPassword':
        return true;
      default:
        return true;
    }
  };
  
export const validateForm = (formData, step) => {
    if (step === 1) {
      return (
        validateField('fname', formData.fname) &&
        validateField('lname', formData.lname) &&
        (validateField('sname', formData.sname) || formData.sname.length === '') &&
        validateField('login', formData.login)
      );
    } else if (step === 2) {
      return (
        validateField('password', formData.password) &&
        formData.password === formData.confirmPassword
      );
    }
    return false;
  };