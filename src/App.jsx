import React, { useState, Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-exos border border-red-200 p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
            <pre className="text-xs text-red-600 bg-red-50 rounded p-3 overflow-auto whitespace-pre-wrap">
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
            <button onClick={() => this.setState({ error: null })} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase rounded-exos">
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import Header from './components/shared/Header';
import MarketingPage from './components/MarketingPage';
import AccountCreation from './components/AccountCreation';
import BasicInfo from './components/BasicInfo';
import W9Form from './components/W9Form';
import W9ReviewSign from './components/W9ReviewSign';
import LicenseUpload from './components/LicenseUpload';
import DocumentUpload from './components/DocumentUpload';
import BackgroundCheck from './components/BackgroundCheck';
import TVAAgreement from './components/TVAAgreement';
import SubmissionConfirmation from './components/SubmissionConfirmation';
import SetupMapFlow from './components/setup/SetupMapFlow';
import QuickSetup from './components/setup/QuickSetup';

const initialState = {
  currentStep: 1,
  totalSteps: 6,
  marketingData: { name: '', email: '', interest: '' },
  accountData: { email: '', password: '', authMethod: 'email' },
  basicInfo: {
    firstName: '',
    lastName: '',
    phone: '',
    yearsLicensed: null,
    address: { street: '', city: '', state: '', zip: '', validated: false },
  },
  businessStructure: null,
  w9Data: {
    businessName: '',
    taxClassification: '',
    foreignMembers: null,
    taxId: '',
    taxIdType: '',
    entityDescription: '',
    minorityOwned: null,
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
  setup: null,
  ui: { errors: {}, loading: false, apiCallInProgress: false },
};

// Screen → progress step mapping (6 steps)
// Step 1: Documents — DL + E&O (screen 3)
// Step 2: Basic Info (screen 4)
// Step 3: W-9 — combined form + review (screens 5-6)
// Step 4: License (screen 7)
// Step 5: Background Check (screen 8)
// Step 6: Agreement (screen 9)
const getProgressStep = (screen) => {
  if (screen === 3) return 1;
  if (screen === 4) return 2;
  if (screen === 5 || screen === 6) return 3;
  if (screen === 7) return 4;
  if (screen === 8) return 5;
  if (screen === 9) return 6;
  return null;
};

// Step → screen (navigates to start of each step)
const STEP_TO_SCREEN = [null, 3, 4, 5, 7, 8, 9];

const App = () => {
  const [state, setState] = useState(initialState);
  const [screen, setScreen] = useState(1);

  const navigateNext = () => setScreen((prev) => prev + 1);
  const navigateBack = () => setScreen((prev) => prev - 1);
  const navigateToStep = (step) => setScreen(STEP_TO_SCREEN[step] ?? screen);

  // Dev shortcut: skip to setup with ZIP 75009 pre-filled
  const devSkipToSetup = () => {
    setState((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        address: { street: '123 Main St', city: 'Celina', state: 'TX', zip: '75009', validated: true },
      },
    }));
    setScreen(11);
  };

  const progressStep = getProgressStep(screen);
  const showHeader = screen >= 2 && screen <= 9;

  const renderScreen = () => {
    const props = { state, setState, onNext: navigateNext, onBack: navigateBack };

    switch (screen) {
      case 1:  return <MarketingPage {...props} onDevSkip={devSkipToSetup} />;
      case 2:  return <AccountCreation {...props} />;
      case 3:  return <DocumentUpload {...props} />;
      case 4:  return <BasicInfo {...props} />;
      case 5:  return <W9Form {...props} />;
      case 6:  return <W9ReviewSign {...props} />;
      case 7:  return <LicenseUpload {...props} />;
      case 8:  return <BackgroundCheck state={state} setState={setState} onNext={navigateNext} onBack={navigateBack} />;
      case 9:  return <TVAAgreement {...props} />;
      case 10: return <SubmissionConfirmation state={state} onSetupClick={() => setScreen(11)} />;
      case 11: return <SetupMapFlow state={state} setState={setState} onQuick={() => setScreen(12)} onBack={() => setScreen(10)} onDone={() => setScreen(10)} />;
      case 12: return <QuickSetup state={state} setState={setState} onBack={() => setScreen(11)} onDone={() => setScreen(10)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {showHeader && <Header progressStep={progressStep} screen={screen} onStepClick={navigateToStep} />}
      <main><ErrorBoundary key={screen}>{renderScreen()}</ErrorBoundary></main>
    </div>
  );
};

export default App;
