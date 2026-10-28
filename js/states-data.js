/* ===========================================================
   CO₹PU$ — state health schemes
   Checked in October 2026 against recent reporting and official
   portals. Only figures that could be confirmed are given as
   numbers; anything not confirmed points to the official portal
   instead of guessing. Schemes change often, so the page always
   tells people to confirm on the portal before relying on it.
   cover: number in rupees used by the insurance calculator, or
   null when there is no confirmed figure.
=========================================================== */
const STATES = [
  'Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir',
  'Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal'
];

const STATE_HEALTH = {
  'Andhra Pradesh': {
    scheme: 'Dr NTR Vaidya Seva', cover: null, universal: false,
    summary: 'The state\'s cashless treatment scheme, formerly Aarogyasri, run by the Dr NTR Vaidya Seva Trust.',
    note: 'In September 2025 the state cabinet approved designing a universal health policy: ₹2.5 lakh of insurance plus up to ₹25 lakh through the trust for BPL families, and ₹2 to 5 lakh for APL families. It was at the tender stage, so confirm what is in force before relying on it.',
    link: 'https://spsnellore.ap.gov.in/dr-nandamuri-taraka-rama-rao-vaidyaseva-trust/', linkLabel: 'Trust information (AP government)'
  },
  'Assam': {
    scheme: 'Atal Amrit Abhiyan', cover: 200000, universal: false,
    summary: 'Cover of up to ₹2 lakh, aimed at critical illnesses, on top of Ayushman Bharat for eligible families.',
    link: 'https://nhm.assam.gov.in', linkLabel: 'NHM Assam'
  },
  'Delhi': {
    scheme: 'Ayushman Bharat PM-JAY with a Delhi top-up', cover: 1000000, universal: false,
    summary: '₹10 lakh per family per year for eligible families: ₹5 lakh from PM-JAY and a ₹5 lakh top-up from the Delhi government, rolled out from April 2025.',
    note: 'Everyone aged 70 and above gets free cover under Ayushman Vay Vandana regardless of income.',
    link: 'https://pmjay.gov.in', linkLabel: 'PM-JAY portal'
  },
  'Gujarat': {
    scheme: 'PMJAY-MA (Mukhyamantri Amrutum, merged with PM-JAY)', cover: null, universal: false,
    summary: 'The state scheme runs alongside Ayushman Bharat for eligible families.',
    link: 'https://www.myscheme.gov.in/schemes/ma', linkLabel: 'Scheme page on myScheme'
  },
  'Haryana': {
    scheme: 'Chirayu Ayushman Haryana', cover: null, universal: false,
    summary: 'Extends Ayushman Bharat cover to more families, including some with income up to ₹3 lakh through a nominal contribution.',
    link: 'https://ayushmanbharat.haryana.gov.in', linkLabel: 'Ayushman Bharat Haryana'
  },
  'Himachal Pradesh': {
    scheme: 'HIMCARE', cover: 500000, universal: false,
    summary: '₹5 lakh per family per year for families not already covered by Ayushman Bharat.',
    link: 'https://www.hpsbys.in', linkLabel: 'HIMCARE portal'
  },
  'Karnataka': {
    scheme: 'Ayushman Bharat – Arogya Karnataka', cover: null, universal: false,
    summary: 'The state\'s combined scheme with Ayushman Bharat. Eligibility and cover differ for priority and general households.',
    link: 'https://arogya.karnataka.gov.in', linkLabel: 'Arogya Karnataka'
  },
  'Kerala': {
    scheme: 'Karunya Arogya Suraksha Padhathi (KASP)', cover: null, universal: false,
    summary: 'The state\'s scheme run with Ayushman Bharat for eligible families.',
    link: 'https://dhs.kerala.gov.in', linkLabel: 'Directorate of Health Services'
  },
  'Maharashtra': {
    scheme: 'Mahatma Jyotirao Phule Jan Arogya Yojana (with PM-JAY)', cover: 500000, universal: true,
    summary: '₹5 lakh per family per year on a floater basis. From 1 July 2024 it was opened to all families in the state, grouped by ration card type, including white card holders and domicile certificate holders without a card.',
    link: 'https://www.jeevandayee.gov.in', linkLabel: 'Jeevandayee portal'
  },
  'Odisha': {
    scheme: 'Gopabandhu Jan Arogya Yojana (with PM-JAY)', cover: 500000, universal: false,
    summary: '₹5 lakh per family per year, plus an additional ₹5 lakh for women members once the family limit is used up. It replaced the earlier BSKY scheme.',
    note: 'I could not find an official portal page, so ask at any government hospital or empanelled private hospital for the enrolment desk.',
    link: null
  },
  'Punjab': {
    scheme: 'Mukh Mantri Sehat Yojna', cover: 1000000, universal: true,
    summary: 'Free cashless treatment of up to ₹10 lakh per family, extended to every family in the state with no income criteria.',
    link: 'https://sha.punjab.gov.in', linkLabel: 'State Health Agency Punjab'
  },
  'Rajasthan': {
    scheme: 'Mukhyamantri Ayushman Arogya (MAA) Yojana', cover: 2500000, universal: false,
    summary: 'Cashless treatment of up to ₹25 lakh at about 31,000 government and private hospitals across India, with an MAA scheme card. It replaced the Chiranjeevi scheme.',
    link: 'https://maayojana.rajasthan.gov.in', linkLabel: 'MAA Yojana portal'
  },
  'Tamil Nadu': {
    scheme: 'Chief Minister\'s Comprehensive Health Insurance Scheme (CMCHIS)', cover: 500000, universal: false, incomeLimit: 120000,
    summary: '₹5 lakh per family per year for families with annual income below ₹1.2 lakh. Families with a differently abled member can enrol without the income limit.',
    note: 'In August 2026 the state announced raising cover to ₹25 lakh a year. The date it takes effect had not been announced, so the calculator still uses ₹5 lakh.',
    link: 'https://www.cmchistn.com', linkLabel: 'CMCHIS portal'
  },
  'Telangana': {
    scheme: 'Rajiv Aarogyasri', cover: 1000000, universal: false,
    summary: 'Up to ₹10 lakh per family per year for low-income households in the state database, usually through a food security (ration) card. Treatment must fall within an approved package at an empanelled hospital.',
    link: 'https://rajivaarogyasri.telangana.gov.in/ASRI2.0/', linkLabel: 'Aarogyasri portal'
  },
  'West Bengal': {
    scheme: 'Swasthya Sathi', cover: 500000, universal: false,
    summary: '₹5 lakh per family per year, with no cap on family size.',
    link: 'https://swasthyasathi.gov.in', linkLabel: 'Swasthya Sathi portal'
  }
};

const NATIONAL_HEALTH = {
  scheme: 'Ayushman Bharat PM-JAY', cover: 500000,
  summary: '₹5 lakh per family per year of hospital cover for eligible families, cashless at empanelled hospitals. Everyone aged 70 and above is covered under Ayushman Vay Vandana regardless of income.',
  link: 'https://pmjay.gov.in', linkLabel: 'PM-JAY portal'
};

function stateHealthInfo(state){
  return STATE_HEALTH[state] || null;
}
