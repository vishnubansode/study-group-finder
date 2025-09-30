// src/utils/schemaValidation.ts

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  secondarySchool: string;
  graduationYear: string;
  university: string;
  major: string;
  currentYear: string;
  selectedCourses: string[];
  avatar?: File | null;
}

export const validateRegistrationData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields validation
  const requiredFields = [
    'firstName', 'lastName', 'email', 'password', 
    'secondarySchool', 'graduationYear', 'university', 
    'major', 'currentYear'
  ];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Password length validation
  if (data.password && data.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Courses validation
  if (!data.selectedCourses || data.selectedCourses.length === 0) {
    errors.push('At least one course must be selected');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const transformDataForBackend = (data: UserRegistrationData): any => {
  // Transform frontend data to match backend expectations
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    secondarySchool: data.secondarySchool,
    graduationYear: data.graduationYear,
    university: data.university,
    major: data.major,
    currentYear: data.currentYear,
    selectedCourses: data.selectedCourses
  };
};