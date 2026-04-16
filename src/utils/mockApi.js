export const validateAddress = async (address) => {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    validated: true,
    nearbyAssignments: 47,
    avgEarnings: { min: 4200, max: 8500 },
  };
};

export const processLicenseOCR = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return {
    state: 'Texas',
    type: 'Certified Residential',
    number: 'TX-CR-12345',
    effectiveDate: '2020-01-15',
    expirationDate: '2026-12-31',
    address: '123 Main St, Dallas, TX 75201',
  };
};

export const verifyLicense = async (licenseData) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const success = Math.random() > 0.15;
  return {
    verified: success,
    error: success ? null : 'Could not automatically verify license',
  };
};

export const parseEOInsurance = async (file) => {
  await new Promise((resolve) => setTimeout(resolve, 2200));
  return {
    underwriter: 'Berkley One Insurance Company',
    policyNumber: 'EO-2024-884421-TX',
    limitOfLiability: '1,000,000',
    effectiveDate: '2024-06-01',
    expirationDate: '2025-06-01',
  };
};
