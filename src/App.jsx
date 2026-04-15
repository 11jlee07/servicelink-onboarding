import React, { useState } from 'react';
import Header from './components/shared/Header';
import MarketingPage from './components/MarketingPage';
import AccountCreation from './components/AccountCreation';
import BasicInfo from './components/BasicInfo';
import BusinessStructureSelection from './components/BusinessStructureSelection';
import W9SoleProp from './components/w9/W9SoleProp';
import W9SingleLLC from './components/w9/W9SingleLLC';
import W9MultiLLC from './components/w9/W9MultiLLC';
import W9Partnership from './components/w9/W9Partnership';
import W9Corporation from './components/w9/W9Corporation';
import W9Trust from './components/w9/W9Trust';
import W9Other from './components/w9/W9Other';
import W9ReviewSign from './components/W9ReviewSign';
import LicenseUpload from './components/LicenseUpload';
import EOInsuranceUpload from './components/EOInsuranceUpload';
import BackgroundCheck from './components/BackgroundCheck';
import TVAAgreement from './components/TVAAgreement';
import SubmissionConfirmation from './components/SubmissionConfirmation';

const initialState = {
  currentStep: 1,
  totalSteps: 7,
  marketingData: { name: '', email: '', interest: '' },
  accountData: { email: '', password: '', authMethod: 'email' },
  basicInfo: {
    firstName: '',
    lastName: '',
    phone: '',
    address: { street: '', city: '', state: '', zip: '', validated: false },
  },
  businessStructure: null,
  w9Data: {
    businessName: '',
    taxClassification: '',
    foreignMembers: null,
    taxId: '',
    taxIdType: '',
    mailingAddress: { useOfficeAddress: true, street: '', city: '', state: '', zip: '' },
  },
  w9Signature: { signatureData: null, signedAt: null },
  license: {
    uploadedFile: null,
    ocrData: { state: '', type: '', number: '', effectiveDate: '', expirationDate: '', address: '' },
    apiVerified: false,
    apiError: null,
  },
  eoInsurance: { uploadedFile: null },
  tva: { agreed: false, agreedAt: null },
  ui: { errors: {}, loading: false, apiCallInProgress: false },
};

// Screen → progress step mapping (screens 3-10 = steps 1-8)
const getProgressStep = (screen) => {
  if (screen >= 3 && screen <= 10) return screen - 2;
  return null;
};

const App = () => {
  const [state, setState] = useState(initialState);
  const [screen, setScreen] = useState(1);

  const navigateNext = () => setScreen((prev) => prev + 1);
  const navigateBack = () => setScreen((prev) => prev - 1);

  const progressStep = getProgressStep(screen);
  const showHeader = screen >= 2 && screen <= 10;

  const renderScreen = () => {
    const props = { state, setState, onNext: navigateNext, onBack: navigateBack };

    switch (screen) {
      case 1:
        return <MarketingPage {...props} />;
      case 2:
        return <AccountCreation {...props} />;
      case 3:
        return <BasicInfo {...props} />;
      case 4:
        return <BusinessStructureSelection {...props} />;
      case 5: {
        switch (state.businessStructure) {
          case 'sole_prop':   return <W9SoleProp {...props} />;
          case 'single_llc':  return <W9SingleLLC {...props} />;
          case 'multi_llc':   return <W9MultiLLC {...props} />;
          case 'partnership': return <W9Partnership {...props} />;
          case 'corporation': return <W9Corporation {...props} />;
          case 'trust':       return <W9Trust {...props} />;
          case 'other':       return <W9Other {...props} />;
          default:            return null;
        }
      }
      case 6:  return <W9ReviewSign {...props} />;
      case 7:  return <LicenseUpload {...props} />;
      case 8:  return <EOInsuranceUpload {...props} />;
      case 9:  return <BackgroundCheck state={state} onNext={navigateNext} onBack={navigateBack} />;
      case 10: return <TVAAgreement {...props} />;
      case 11: return <SubmissionConfirmation state={state} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showHeader && <Header progressStep={progressStep} screen={screen} />}
      <main>{renderScreen()}</main>
    </div>
  );
};

export default App;
