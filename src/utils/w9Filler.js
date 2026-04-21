import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const F = {
  name:          'topmostSubform[0].Page1[0].f1_01[0]',
  bizName:       'topmostSubform[0].Page1[0].f1_02[0]',
  chk: [
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[0]', // Individual / sole prop
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[1]', // C Corp
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[2]', // S Corp
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[3]', // Partnership
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[4]', // Trust / estate
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[5]', // LLC
    'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_1[6]', // Other
  ],
  llcType:       'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].f1_03[0]',
  otherDesc:     'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].f1_04[0]',
  foreignMbrs:   'topmostSubform[0].Page1[0].Boxes3a-b_ReadOrder[0].c1_2[0]',
  address:       'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_07[0]',
  cityStateZip:  'topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_08[0]',
  ssn1:          'topmostSubform[0].Page1[0].f1_11[0]',
  ssn2:          'topmostSubform[0].Page1[0].f1_12[0]',
  ssn3:          'topmostSubform[0].Page1[0].f1_13[0]',
  ein1:          'topmostSubform[0].Page1[0].f1_14[0]',
  ein2:          'topmostSubform[0].Page1[0].f1_15[0]',
};

function chkIndex(businessStructure, taxClassification) {
  switch (businessStructure) {
    case 'sole_prop':   return 0;
    case 'corporation': return taxClassification === 's_corp' ? 2 : 1;
    case 'partnership': return 3;
    case 'trust':       return 4;
    case 'single_llc':
    case 'multi_llc':   return 5;
    default:            return 6;
  }
}

export async function fillW9PDF({ basicInfo, w9Data, businessStructure, w9Signature }) {
  const pdfBytes = await fetch('/w-9.pdf').then(r => r.arrayBuffer());
  const pdf = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdf.getForm();

  const setText = (name, val) => {
    try { form.getTextField(name).setText(val ?? ''); } catch {}
  };
  const checkBox = (name) => {
    try { form.getCheckBox(name).check(); } catch {}
  };

  // Line 1: legal name
  setText(F.name, `${basicInfo.firstName} ${basicInfo.lastName}`);

  // Line 2: business name
  if (w9Data.businessName) setText(F.bizName, w9Data.businessName);

  // Line 3a: tax classification checkbox
  const idx = chkIndex(businessStructure, w9Data.taxClassification);
  checkBox(F.chk[idx]);

  // LLC subtype
  if (businessStructure === 'single_llc' || businessStructure === 'multi_llc') {
    const t = businessStructure === 'multi_llc' ? 'P'
      : w9Data.taxClassification === 'c_corp' ? 'C'
      : w9Data.taxClassification === 's_corp' ? 'S'
      : 'D';
    setText(F.llcType, t);
  }

  // Line 3b: foreign members
  if (w9Data.foreignMembers) checkBox(F.foreignMbrs);

  // Address
  const addr = w9Data.mailingAddress?.useOfficeAddress ? basicInfo.address : w9Data.mailingAddress;
  setText(F.address, addr?.street ?? '');
  setText(F.cityStateZip, `${addr?.city ?? ''}, ${(addr?.state || addr?.stateCode) ?? ''} ${addr?.zip ?? ''}`);

  // Tax ID
  const raw = (w9Data.taxId ?? '').replace(/\D/g, '');
  if (w9Data.taxIdType === 'ssn') {
    setText(F.ssn1, raw.slice(0, 3));
    setText(F.ssn2, raw.slice(3, 5));
    setText(F.ssn3, raw.slice(5, 9));
  } else if (w9Data.taxIdType === 'ein') {
    setText(F.ein1, raw.slice(0, 2));
    setText(F.ein2, raw.slice(2, 9));
  }

  // Flatten form fields into static content
  try { form.flatten(); } catch {}

  // Stamp signature image + date onto page 1
  if (w9Signature?.signatureData) {
    const base64 = w9Signature.signatureData.split(',')[1];
    const binary = atob(base64);
    const sigBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) sigBytes[i] = binary.charCodeAt(i);

    const sigImg = await pdf.embedPng(sigBytes);
    const page = pdf.getPages()[0];
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    page.drawImage(sigImg, { x: 85, y: 193, width: 310, height: 22 });

    const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    page.drawText(date, { x: 430, y: 198, size: 9, font, color: rgb(0.05, 0.05, 0.05) });
  }

  return pdf.save();
}

export function downloadPDF(bytes, filename = 'W-9.pdf') {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
