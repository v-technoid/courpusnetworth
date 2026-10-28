/* ===========================================================
   CO₹PU$ — country packs
   Everything that changes from one country to the next lives in the
   JSON block below: tax brackets, allowances, payroll levies, account
   types, deadlines, freelancer rules, complaint bodies and the merchant
   names used to sort bank statements. The same block is read by
   tools/build.py to make the country pages, so the app and the pages
   can never disagree.

   To update a country after its budget: edit its numbers here, change
   "checked", run python3 tools/build.py. No other file needs touching.
=========================================================== */
window.CORPUS_COUNTRY_DATA = /*DATA*/{
 "IN": {
  "code": "IN",
  "slug": "",
  "name": "India",
  "short": "India",
  "currency": "INR",
  "symbol": "₹",
  "money": "rupee",
  "locale": "en-IN",
  "hreflang": "en-IN",
  "dateOrder": "dmy",
  "taxYear": "FY 2026-27",
  "checkWith": "a SEBI registered investment adviser, a chartered accountant, or the Income Tax Department's records (Form 26AS and AIS)",
  "taxYearSpan": "1 April 2026 to 31 March 2027",
  "checked": "October 2026",
  "tz": [
   "Asia/Kolkata",
   "Asia/Calcutta"
  ],
  "example": 1500000,
  "tax": {
   "engine": "india"
  },
  "retire": null,
  "fdLabel": "Fixed Deposits",
  "tagline": "PPF, EPF, NPS, old vs new regime, Form 16 and 26AS"
 },
 "US": {
  "code": "US",
  "slug": "us",
  "name": "United States",
  "short": "USA",
  "currency": "USD",
  "symbol": "$",
  "money": "dollar",
  "locale": "en-US",
  "hreflang": "en-US",
  "dateOrder": "mdy",
  "taxYear": "Tax year 2026",
  "checkWith": "a CPA, an IRS enrolled agent or a CFP professional, and IRS.gov",
  "taxYearSpan": "1 January to 31 December 2026",
  "checked": "October 2026",
  "tz": [
   "America/New_York",
   "America/Chicago",
   "America/Denver",
   "America/Los_Angeles",
   "America/Phoenix",
   "America/Anchorage",
   "Pacific/Honolulu",
   "America/Detroit",
   "America/Indiana/Indianapolis",
   "America/Boise"
  ],
  "example": 75000,
  "tax": {
   "incomeTaxLabel": "Federal income tax",
   "allowance": {
    "type": "deduction",
    "amount": 16100,
    "label": "Standard deduction"
   },
   "brackets": [
    [
     12400,
     0.1
    ],
    [
     50400,
     0.12
    ],
    [
     105700,
     0.22
    ],
    [
     201775,
     0.24
    ],
    [
     256225,
     0.32
    ],
    [
     640600,
     0.35
    ],
    [
     null,
     0.37
    ]
   ],
   "married": {
    "allowance": {
     "type": "deduction",
     "amount": 32200,
     "label": "Standard deduction"
    },
    "brackets": [
     [
      24800,
      0.1
     ],
     [
      100800,
      0.12
     ],
     [
      211400,
      0.22
     ],
     [
      403550,
      0.24
     ],
     [
      512450,
      0.32
     ],
     [
      768700,
      0.35
     ],
     [
      null,
      0.37
     ]
    ]
   },
   "levies": [
    {
     "label": "Social Security (6.2%)",
     "rate": 0.062,
     "upTo": 184500,
     "kind": "salary"
    },
    {
     "label": "Medicare (1.45%)",
     "rate": 0.0145,
     "kind": "salary"
    },
    {
     "label": "Additional Medicare (0.9%)",
     "rate": 0.009,
     "from": 200000,
     "fromMarried": 250000,
     "kind": "salary"
    },
    {
     "label": "Self-employment tax, Social Security (12.4%)",
     "rate": 0.124,
     "base": "self9235",
     "upTo": 184500,
     "kind": "self",
     "deductibleShare": 0.5
    },
    {
     "label": "Self-employment tax, Medicare (2.9%)",
     "rate": 0.029,
     "base": "self9235",
     "kind": "self",
     "deductibleShare": 0.5
    },
    {
     "label": "Additional Medicare (0.9%)",
     "rate": 0.009,
     "base": "self9235",
     "from": 200000,
     "fromMarried": 250000,
     "kind": "self"
    }
   ],
   "statuses": true,
   "notes": [
    "Federal tax plus an optional flat state rate. State income tax ranges from nothing (Texas, Florida, Washington and others) to over 10% at the top in California.",
    "Self-employed people may also get the 20% qualified business income deduction, and families the child tax credit, which are not included here."
   ],
   "statusOptions": [
    [
     "single",
     "Single"
    ],
    [
     "married",
     "Married filing jointly"
    ]
   ],
   "stateRate": true
  },
  "retire": {
   "label": "401(k) & IRA",
   "types": [
    "401(k)",
    "Roth 401(k)",
    "Traditional IRA",
    "Roth IRA",
    "HSA",
    "529 plan",
    "Pension"
   ],
   "limits": "2026 limits: 401(k) $24,500 (plus $8,000 catch-up at 50+), IRA $7,500, HSA $4,400 single or $8,750 family."
  },
  "fdLabel": "CDs",
  "deadlines": [
   [
    1,
    15,
    "Fourth quarter estimated tax payment"
   ],
   [
    4,
    15,
    "File your tax return, and first quarter estimated tax"
   ],
   [
    6,
    15,
    "Second quarter estimated tax"
   ],
   [
    9,
    15,
    "Third quarter estimated tax"
   ]
  ],
  "freelance": {
   "vat": "No federal sales tax or VAT; sales tax is set by each state.",
   "points": [
    "Self-employment tax of 15.3% on 92.35% of your net profit covers Social Security and Medicare, and half of it is deductible.",
    "Pay estimated tax each quarter (April, June, September, January) if you expect to owe $1,000 or more.",
    "Clients usually send a Form 1099-NEC; keep your own records too, since all income is taxable."
   ]
  },
  "regulators": [
   [
    "Consumer Financial Protection Bureau",
    "Problems with a bank, credit card, loan, mortgage or credit report.",
    "https://www.consumerfinance.gov/complaint/"
   ],
   [
    "SEC",
    "Fraud or misconduct involving securities, brokers or investment advisers.",
    "https://www.sec.gov/tcr"
   ],
   [
    "FINRA",
    "Disputes with a brokerage firm or broker.",
    "https://www.finra.org/investors/have-problem"
   ],
   [
    "Your state insurance department",
    "Claim denials and insurer complaints, found through the NAIC.",
    "https://content.naic.org/consumer.htm"
   ],
   [
    "FTC ReportFraud",
    "Scams, identity theft and fraud.",
    "https://reportfraud.ftc.gov/"
   ]
  ],
  "keywords": {
   "groceries": "walmart|target|costco|kroger|whole foods|trader joe|safeway|aldi|publix|h-e-b|wegmans|instacart",
   "eating": "doordash|uber ?eats|grubhub|chipotle|starbucks|mcdonald|dunkin|chick-fil-a|panera",
   "shopping": "amazon|etsy|best buy|ebay|home depot|lowe'?s|walgreens|cvs",
   "transport": "uber|lyft|shell|chevron|exxon|mobil|76 |sunoco|parking|amtrak",
   "utilities": "comcast|xfinity|verizon|at&t|t-mobile|spectrum|pg&e|con ?ed|duke energy|water dept",
   "emi": "mortgage|auto loan|car payment|sallie mae|navient|nelnet|student loan|loan pymt",
   "invest": "vanguard|fidelity|schwab|robinhood|e\\*trade|etrade|betterment|wealthfront|401k",
   "insurance": "geico|progressive|state farm|allstate|liberty mutual|usaa ins",
   "tax": "irs|us treasury|tax pymt|franchise tax board",
   "rent": "rent|apartments|property mgmt|zelle.*rent"
  },
  "salaryWords": "direct dep|payroll|dir dep",
  "tagline": "401(k), IRA, federal brackets, FICA and self-employment tax"
 },
 "UK": {
  "code": "UK",
  "slug": "uk",
  "name": "United Kingdom",
  "short": "UK",
  "currency": "GBP",
  "symbol": "£",
  "money": "pound",
  "locale": "en-GB",
  "hreflang": "en-GB",
  "dateOrder": "dmy",
  "taxYear": "Tax year 2026/27",
  "checkWith": "an FCA authorised financial adviser, a chartered tax adviser or accountant, MoneyHelper, and GOV.UK",
  "taxYearSpan": "6 April 2026 to 5 April 2027",
  "checked": "October 2026",
  "tz": [
   "Europe/London",
   "Europe/Belfast"
  ],
  "example": 45000,
  "tax": {
   "incomeTaxLabel": "Income tax",
   "allowance": {
    "type": "deduction",
    "amount": 12570,
    "label": "Personal allowance",
    "taper": {
     "from": 100000,
     "rate": 0.5
    }
   },
   "brackets": [
    [
     37700,
     0.2
    ],
    [
     125140,
     0.4
    ],
    [
     null,
     0.45
    ]
   ],
   "bracketsOn": "taxable",
   "levies": [
    {
     "label": "National Insurance (8%)",
     "rate": 0.08,
     "from": 12570,
     "upTo": 50270,
     "kind": "salary"
    },
    {
     "label": "National Insurance (2% above £50,270)",
     "rate": 0.02,
     "from": 50270,
     "kind": "salary"
    },
    {
     "label": "Class 4 National Insurance (6%)",
     "rate": 0.06,
     "from": 12570,
     "upTo": 50270,
     "kind": "self"
    },
    {
     "label": "Class 4 National Insurance (2%)",
     "rate": 0.02,
     "from": 50270,
     "kind": "self"
    }
   ],
   "notes": [
    "Rates for England, Wales and Northern Ireland. Scotland sets its own bands for earned income.",
    "The personal allowance shrinks by £1 for every £2 earned over £100,000, and is gone at £125,140."
   ]
  },
  "retire": {
   "label": "Pensions & ISAs",
   "types": [
    "Workplace pension",
    "SIPP",
    "Stocks & Shares ISA",
    "Cash ISA",
    "Lifetime ISA",
    "Premium Bonds"
   ],
   "limits": "ISA allowance £20,000 a year; Junior ISA £9,000."
  },
  "fdLabel": "Fixed-Rate Savings",
  "deadlines": [
   [
    1,
    31,
    "Self Assessment return, balancing payment and first payment on account"
   ],
   [
    4,
    5,
    "Tax year ends (use your ISA allowance)"
   ],
   [
    7,
    31,
    "Second payment on account"
   ],
   [
    10,
    5,
    "Register for Self Assessment if newly self-employed"
   ]
  ],
  "freelance": {
   "vat": "VAT registration is required once taxable turnover passes £90,000 in a rolling 12 months.",
   "points": [
    "The first £1,000 of trading income is tax free under the trading allowance.",
    "Class 4 National Insurance is 6% of profits between £12,570 and £50,270, and 2% above.",
    "If your bill is over £1,000, HMRC usually asks for payments on account on 31 January and 31 July."
   ]
  },
  "regulators": [
   [
    "Financial Ombudsman Service",
    "Free, independent rulings on complaints about banks, insurers, pensions and investments.",
    "https://www.financial-ombudsman.org.uk/"
   ],
   [
    "Financial Conduct Authority",
    "Check a firm is authorised and report a firm or scam.",
    "https://www.fca.org.uk/consumers"
   ],
   [
    "The Pensions Ombudsman",
    "Disputes about workplace and personal pensions.",
    "https://www.pensions-ombudsman.org.uk/"
   ],
   [
    "Citizens Advice",
    "Free advice on consumer problems and next steps.",
    "https://www.citizensadvice.org.uk/"
   ]
  ],
  "keywords": {
   "groceries": "tesco|sainsbury|asda|morrisons|aldi|lidl|waitrose|co-?op|ocado|iceland|m&s food",
   "eating": "deliveroo|just ?eat|uber ?eats|greggs|pret|nando|costa|starbucks|wagamama",
   "shopping": "amazon|argos|john lewis|boots|primark|next plc|currys|asos",
   "transport": "tfl|trainline|national rail|shell|bp |esso|uber|parking",
   "utilities": "british gas|octopus|edf|e\\.on|ovo|thames water|severn trent|bt group|\\bbt\\b|sky|virgin media|vodafone|\\bee\\b|o2|tv licen",
   "emi": "mortgage|loan|nationwide bs|halifax mtg|klarna|clearpay",
   "invest": "vanguard|hargreaves|aj bell|trading 212|nutmeg|freetrade|fidelity|moneybox",
   "insurance": "aviva|direct line|admiral|axa|legal & general|lv=|churchill",
   "tax": "hmrc|council tax",
   "rent": "rent|letting|openrent"
  },
  "salaryWords": "salary|wages|bgc|payroll",
  "tagline": "ISA, pensions, personal allowance, National Insurance"
 },
 "CA": {
  "code": "CA",
  "slug": "ca",
  "name": "Canada",
  "short": "Canada",
  "currency": "CAD",
  "symbol": "C$",
  "money": "dollar",
  "locale": "en-CA",
  "hreflang": "en-CA",
  "dateOrder": "ymd",
  "taxYear": "Tax year 2026",
  "checkWith": "a CPA, a CFP or QAFP professional, and the Canada Revenue Agency",
  "taxYearSpan": "1 January to 31 December 2026",
  "checked": "October 2026",
  "tz": [
   "America/Toronto",
   "America/Vancouver",
   "America/Edmonton",
   "America/Winnipeg",
   "America/Halifax",
   "America/St_Johns",
   "America/Regina",
   "America/Montreal"
  ],
  "example": 70000,
  "tax": {
   "incomeTaxLabel": "Federal income tax",
   "allowance": {
    "type": "credit",
    "amount": 16452,
    "min": 14829,
    "from": 181440,
    "to": 258482,
    "rate": 0.14,
    "label": "Basic personal amount"
   },
   "brackets": [
    [
     58523,
     0.14
    ],
    [
     117045,
     0.205
    ],
    [
     181440,
     0.26
    ],
    [
     258482,
     0.29
    ],
    [
     null,
     0.33
    ]
   ],
   "levies": [
    {
     "label": "CPP (5.95%)",
     "rate": 0.0595,
     "from": 3500,
     "upTo": 74600,
     "kind": "salary",
     "creditShare": 0.83193,
     "deductibleShare": 0.16807
    },
    {
     "label": "CPP2 (4%)",
     "rate": 0.04,
     "from": 74600,
     "upTo": 85000,
     "kind": "salary",
     "deductibleShare": 1
    },
    {
     "label": "EI (1.63%)",
     "rate": 0.0163,
     "upTo": 68900,
     "kind": "salary",
     "creditShare": 1
    },
    {
     "label": "CPP, self-employed (11.9%)",
     "rate": 0.119,
     "from": 3500,
     "upTo": 74600,
     "kind": "self",
     "deductibleShare": 0.58403,
     "creditShare": 0.41597
    },
    {
     "label": "CPP2, self-employed (8%)",
     "rate": 0.08,
     "from": 74600,
     "upTo": 85000,
     "kind": "self",
     "deductibleShare": 1
    }
   ],
   "notes": [
    "Federal tax plus provincial tax for Ontario (with its surtax and health premium), British Columbia or Alberta. Other provinces: federal figure only.",
    "Credits for the basic personal amount, CPP, EI and the Canada employment amount are included; low-income reductions and other credits are not."
   ],
   "credits": [
    {
     "amount": 1501,
     "label": "Canada employment amount",
     "kind": "salary"
    }
   ],
   "regions": {
    "label": "Province",
    "default": "ON",
    "list": {
     "ON": {
      "name": "Ontario",
      "brackets": [
       [
        53891,
        0.0505
       ],
       [
        107785,
        0.0915
       ],
       [
        150000,
        0.1116
       ],
       [
        220000,
        0.1216
       ],
       [
        null,
        0.1316
       ]
      ],
      "credit": 12989,
      "surtax": [
       [
        5818,
        0.2
       ],
       [
        7446,
        0.36
       ]
      ],
      "premium": [
       [
        20000,
        0,
        0,
        0
       ],
       [
        25000,
        0,
        0.06,
        20000
       ],
       [
        36000,
        300,
        0,
        0
       ],
       [
        38500,
        300,
        0.06,
        36000
       ],
       [
        48000,
        450,
        0,
        0
       ],
       [
        48600,
        450,
        0.25,
        48000
       ],
       [
        72000,
        600,
        0,
        0
       ],
       [
        72600,
        600,
        0.25,
        72000
       ],
       [
        200000,
        750,
        0,
        0
       ],
       [
        200600,
        750,
        0.25,
        200000
       ],
       [
        null,
        900,
        0,
        0
       ]
      ],
      "premiumLabel": "Ontario Health Premium"
     },
     "BC": {
      "name": "British Columbia",
      "brackets": [
       [
        50363,
        0.056
       ],
       [
        100728,
        0.077
       ],
       [
        115648,
        0.105
       ],
       [
        140430,
        0.1229
       ],
       [
        190405,
        0.147
       ],
       [
        265545,
        0.168
       ],
       [
        null,
        0.205
       ]
      ],
      "credit": 13216
     },
     "AB": {
      "name": "Alberta",
      "brackets": [
       [
        61200,
        0.08
       ],
       [
        154259,
        0.1
       ],
       [
        185111,
        0.12
       ],
       [
        246813,
        0.13
       ],
       [
        370220,
        0.14
       ],
       [
        null,
        0.15
       ]
      ],
      "credit": 22769
     },
     "XX": {
      "name": "Other province (federal only)",
      "brackets": [
       [
        null,
        0
       ]
      ],
      "credit": 0
     }
    }
   }
  },
  "retire": {
   "label": "RRSP & TFSA",
   "types": [
    "RRSP",
    "TFSA",
    "FHSA",
    "RESP",
    "Workplace pension"
   ],
   "limits": "2026 limits: TFSA $7,000, RRSP 18% of last year's earned income up to $33,810."
  },
  "fdLabel": "GICs",
  "deadlines": [
   [
    3,
    15,
    "First tax instalment"
   ],
   [
    4,
    30,
    "File and pay your return"
   ],
   [
    6,
    15,
    "Self-employed filing deadline, and second instalment"
   ],
   [
    9,
    15,
    "Third tax instalment"
   ],
   [
    12,
    15,
    "Fourth tax instalment"
   ]
  ],
  "freelance": {
   "vat": "GST/HST registration is required once revenue passes $30,000 in four consecutive quarters.",
   "points": [
    "You pay both halves of CPP (11.9% up to $74,600, then 8% CPP2 up to $85,000).",
    "Quarterly instalments are due if your net tax owing is over $3,000.",
    "Self-employed people file by 15 June, but any balance is still due on 30 April."
   ]
  },
  "regulators": [
   [
    "OBSI",
    "Free ombudsman for banking and investment complaints.",
    "https://www.obsi.ca/"
   ],
   [
    "Financial Consumer Agency of Canada",
    "Your rights with banks and how to complain.",
    "https://www.canada.ca/en/financial-consumer-agency.html"
   ],
   [
    "CIRO",
    "Complaints about investment dealers and advisers.",
    "https://www.ciro.ca/"
   ],
   [
    "Canadian Anti-Fraud Centre",
    "Report scams and fraud.",
    "https://antifraudcentre-centreantifraude.ca/"
   ]
  ],
  "keywords": {
   "groceries": "loblaws|sobeys|metro inc|no frills|safeway|costco|walmart|freshco|superstore|food basics",
   "eating": "tim hortons|skip ?the ?dishes|doordash|uber ?eats|starbucks|a&w|mcdonald",
   "shopping": "amazon|canadian tire|best buy|shoppers drug|winners|dollarama",
   "transport": "presto|petro-canada|esso|shell|uber|lyft|via rail|compass card",
   "utilities": "rogers|bell canada|telus|fido|koodo|hydro|enbridge|fortisbc",
   "emi": "mortgage|loan|line of credit|car payment",
   "invest": "wealthsimple|questrade|td direct|rrsp|tfsa contrib",
   "insurance": "intact|desjardins ins|sun life|manulife|canada life|td insurance",
   "tax": "canada revenue|cra |receiver general",
   "rent": "rent|landlord|property mgmt"
  },
  "salaryWords": "payroll|pay deposit|salary",
  "tagline": "RRSP, TFSA, federal brackets, CPP and EI"
 },
 "AU": {
  "code": "AU",
  "slug": "au",
  "name": "Australia",
  "short": "Australia",
  "currency": "AUD",
  "symbol": "A$",
  "money": "dollar",
  "locale": "en-AU",
  "hreflang": "en-AU",
  "dateOrder": "dmy",
  "taxYear": "Income year 2026-27",
  "checkWith": "a financial adviser on ASIC's Financial Advisers Register, a registered tax agent, and the ATO",
  "taxYearSpan": "1 July 2026 to 30 June 2027",
  "checked": "October 2026",
  "tz": [
   "Australia/Sydney",
   "Australia/Melbourne",
   "Australia/Brisbane",
   "Australia/Perth",
   "Australia/Adelaide",
   "Australia/Hobart",
   "Australia/Darwin",
   "Australia/Canberra"
  ],
  "example": 90000,
  "tax": {
   "incomeTaxLabel": "Income tax",
   "allowance": null,
   "brackets": [
    [
     18200,
     0
    ],
    [
     45000,
     0.15
    ],
    [
     135000,
     0.3
    ],
    [
     190000,
     0.37
    ],
    [
     null,
     0.45
    ]
   ],
   "levies": [
    {
     "label": "Medicare levy (2%)",
     "rate": 0.02,
     "base": "taxable",
     "kind": "both",
     "shadeIn": {
      "from": 28011,
      "rate": 0.1
     }
    }
   ],
   "notes": [
    "Resident rates from 1 July 2026, when the 16% rate fell to 15%. The low income tax offset and the Medicare levy phase-in for low incomes are included.",
    "Your employer also pays 12% super on top of your salary, and HELP study debt repayments are not included."
   ],
   "offsets": [
    {
     "label": "Low income tax offset",
     "steps": [
      [
       37500,
       700,
       0,
       0
      ],
      [
       45000,
       700,
       -0.05,
       37500
      ],
      [
       66667,
       325,
       -0.015,
       45000
      ]
     ]
    }
   ]
  },
  "retire": {
   "label": "Super",
   "types": [
    "Superannuation (employer)",
    "Personal super contributions",
    "SMSF",
    "First Home Super Saver"
   ],
   "limits": "Employers pay the super guarantee of 12% on top of ordinary earnings."
  },
  "fdLabel": "Term Deposits",
  "deadlines": [
   [
    7,
    1,
    "New income year starts"
   ],
   [
    7,
    28,
    "Quarterly BAS and PAYG instalment (April to June)"
   ],
   [
    10,
    28,
    "Quarterly BAS (July to September)"
   ],
   [
    10,
    31,
    "Lodge your tax return if you lodge it yourself"
   ],
   [
    2,
    28,
    "Quarterly BAS (October to December)"
   ],
   [
    4,
    28,
    "Quarterly BAS (January to March)"
   ]
  ],
  "freelance": {
   "vat": "GST registration is required once turnover reaches A$75,000 a year.",
   "points": [
    "You need an ABN to invoice as a sole trader.",
    "There is no compulsory super for yourself, but personal contributions can be tax deductible.",
    "Once you owe enough tax, the ATO puts you on quarterly PAYG instalments."
   ]
  },
  "regulators": [
   [
    "AFCA",
    "Free, independent resolution of complaints about banks, insurers and super funds.",
    "https://www.afca.org.au/"
   ],
   [
    "ASIC Moneysmart",
    "Check a company or adviser and learn your rights.",
    "https://moneysmart.gov.au/"
   ],
   [
    "Scamwatch",
    "Report scams and get help.",
    "https://www.scamwatch.gov.au/"
   ]
  ],
  "keywords": {
   "groceries": "woolworths|coles|aldi|iga|harris farm|costco",
   "eating": "menulog|doordash|uber ?eats|guzman|grill'd|mcdonald|hungry jack",
   "shopping": "amazon|kmart|target|big w|jb hi-fi|bunnings|officeworks|myer|david jones",
   "transport": "myki|opal|go card|ampol|bp |shell|7-eleven fuel|uber|didi|linkt|e-toll",
   "utilities": "telstra|optus|vodafone|agl|origin energy|energyaustralia|red energy|sydney water",
   "emi": "home loan|mortgage|loan repay|afterpay|zip pay",
   "invest": "commsec|vanguard|stake|selfwealth|raiz|spaceship|superhero",
   "insurance": "nrma|aami|allianz|budget direct|medibank|bupa|hcf|nib",
   "tax": "\\bato\\b|australian taxation",
   "rent": "rent|real estate|ray white|lj hooker"
  },
  "salaryWords": "salary|wages|payroll|pay ",
  "tagline": "Super, stage 3 brackets, Medicare levy and GST"
 },
 "SG": {
  "code": "SG",
  "slug": "sg",
  "name": "Singapore",
  "short": "Singapore",
  "currency": "SGD",
  "symbol": "S$",
  "money": "dollar",
  "locale": "en-SG",
  "hreflang": "en-SG",
  "dateOrder": "dmy",
  "taxYear": "Year of Assessment 2026",
  "checkWith": "a MAS licensed financial adviser, a tax professional, IRAS and the CPF Board",
  "taxYearSpan": "income earned in 2025, taxed in 2026",
  "checked": "October 2026",
  "tz": [
   "Asia/Singapore"
  ],
  "example": 80000,
  "tax": {
   "incomeTaxLabel": "Income tax",
   "allowance": {
    "type": "deduction",
    "amount": 1000,
    "label": "Earned income relief"
   },
   "brackets": [
    [
     20000,
     0
    ],
    [
     30000,
     0.02
    ],
    [
     40000,
     0.035
    ],
    [
     80000,
     0.07
    ],
    [
     120000,
     0.115
    ],
    [
     160000,
     0.15
    ],
    [
     200000,
     0.18
    ],
    [
     240000,
     0.19
    ],
    [
     280000,
     0.195
    ],
    [
     320000,
     0.2
    ],
    [
     500000,
     0.22
    ],
    [
     1000000,
     0.23
    ],
    [
     null,
     0.24
    ]
   ],
   "levies": [
    {
     "label": "CPF, your 20% (saved for you)",
     "rate": 0.2,
     "upTo": 102000,
     "kind": "salary",
     "type": "saving",
     "deductibleShare": 1,
     "onlyStatus": "cpf"
    }
   ],
   "notes": [
    "Resident rates. CPF applies to citizens and permanent residents aged 55 and below, and your contribution counts as relief from tax.",
    "No one-off personal income tax rebate is included, Budget 2026 did not announce one for YA 2026."
   ],
   "statusOptions": [
    [
     "cpf",
     "Citizen or PR (pays CPF)"
    ],
    [
     "foreigner",
     "Foreigner (no CPF)"
    ]
   ]
  },
  "retire": {
   "label": "CPF & SRS",
   "types": [
    "CPF Ordinary Account",
    "CPF Special Account",
    "CPF MediSave",
    "SRS",
    "Endowment plan"
   ],
   "limits": "CPF: 20% from you and 17% from your employer, up to the S$8,000 monthly ordinary wage ceiling."
  },
  "fdLabel": "Fixed Deposits",
  "deadlines": [
   [
    4,
    18,
    "File your tax return online"
   ],
   [
    3,
    1,
    "Tax filing opens"
   ]
  ],
  "freelance": {
   "vat": "GST registration is required once taxable turnover passes S$1 million a year.",
   "points": [
    "Self-employed people pay tax on net trade income at the same resident rates.",
    "If your net trade income is over S$6,000 you must contribute to MediSave.",
    "Keep records for five years, since IRAS can ask for them."
   ]
  },
  "regulators": [
   [
    "FIDReC",
    "Independent resolution of disputes with banks and insurers.",
    "https://www.fidrec.com.sg/"
   ],
   [
    "Monetary Authority of Singapore",
    "Check a firm and give feedback on a financial institution.",
    "https://www.mas.gov.sg/"
   ],
   [
    "ScamShield",
    "Call 1799 if you think you are being scammed.",
    "https://www.scamshield.gov.sg/"
   ]
  ],
  "keywords": {
   "groceries": "ntuc|fairprice|cold storage|sheng siong|giant|redmart|don don donki",
   "eating": "grabfood|foodpanda|deliveroo|kopitiam|toast box|ya kun|starbucks|mcdonald",
   "shopping": "shopee|lazada|amazon|uniqlo|courts|harvey norman|ikea",
   "transport": "grab|gojek|comfortdelgro|ez-link|simplygo|tada|shell|esso|caltex|parking",
   "utilities": "singtel|starhub|\\bm1\\b|sp services|sp group|circles\\.life|geneco|senoko",
   "emi": "hdb loan|home loan|mortgage|car loan",
   "invest": "endowus|syfe|stashaway|tiger brokers|moomoo|poems|interactive brokers|cdp",
   "insurance": "prudential|aia|great eastern|ntuc income|income insurance|manulife|aviva",
   "tax": "iras|inland revenue",
   "rent": "rent|propertyguru"
  },
  "salaryWords": "salary|giro.*sal|payroll",
  "tagline": "CPF, SRS, YA 2026 resident rates and GST"
 },
 "AE": {
  "code": "AE",
  "slug": "ae",
  "name": "United Arab Emirates",
  "short": "UAE",
  "currency": "AED",
  "symbol": "AED",
  "money": "dirham",
  "locale": "en-AE",
  "hreflang": "en-AE",
  "dateOrder": "dmy",
  "taxYear": "2026",
  "checkWith": "an adviser licensed by the Capital Market Authority, DFSA or FSRA, an FTA registered tax agent, and MOHRE for gratuity",
  "taxYearSpan": "no personal income tax year",
  "checked": "October 2026",
  "tz": [
   "Asia/Dubai"
  ],
  "example": 240000,
  "tax": {
   "incomeTaxLabel": "Personal income tax",
   "allowance": null,
   "brackets": [
    [
     null,
     0
    ]
   ],
   "levies": [],
   "corporate": {
    "rate": 0.09,
    "threshold": 375000,
    "minTurnover": 1000000,
    "label": "Corporate tax on business profit"
   },
   "notes": [
    "There is no personal income tax on salary, savings or investments in the UAE.",
    "A person running a business pays 9% corporate tax on profit above AED 375,000 once business turnover passes AED 1 million in a year."
   ]
  },
  "retire": {
   "label": "Savings Plans",
   "types": [
    "End of service benefits",
    "DEWS (Dubai)",
    "Workplace savings scheme",
    "GPSSA pension (UAE nationals)"
   ],
   "limits": "Most expatriates build retirement savings themselves; end of service gratuity is the main employer benefit."
  },
  "fdLabel": "Fixed Deposits",
  "deadlines": [
   [
    1,
    1,
    "New calendar year: review your savings and gratuity"
   ],
   [
    9,
    30,
    "Corporate tax return for a calendar-year business (9 months after year end)"
   ]
  ],
  "freelance": {
   "vat": "VAT registration is mandatory once taxable supplies pass AED 375,000 a year (voluntary from AED 187,500).",
   "points": [
    "Salary and personal investment income are not taxed.",
    "Business income: corporate tax of 9% on profit above AED 375,000 applies once turnover from the business passes AED 1 million.",
    "A freelance permit or trade licence is needed to work for yourself."
   ]
  },
  "regulators": [
   [
    "Sanadak",
    "The UAE's independent ombudsman for banking and insurance complaints.",
    "https://www.sanadak.gov.ae/"
   ],
   [
    "Central Bank of the UAE",
    "Consumer protection and complaints about licensed banks.",
    "https://www.centralbank.ae/"
   ],
   [
    "Securities and Commodities Authority",
    "Complaints about brokers and investment firms.",
    "https://www.sca.gov.ae/"
   ]
  ],
  "keywords": {
   "groceries": "carrefour|lulu|spinneys|union coop|choithrams|waitrose|kibsons|noon minutes|instashop",
   "eating": "talabat|deliveroo|careem food|noon food|zomato|starbucks|tim hortons",
   "shopping": "noon|amazon\\.ae|namshi|ikea|centrepoint|sharaf dg|virgin megastore",
   "transport": "careem|uber|salik|rta|nol|enoc|adnoc|eppco|emarat|parkin",
   "utilities": "dewa|etisalat|\\be&\\b|\\bdu\\b|addc|sewa|fewa|empower|tabreed",
   "emi": "loan|mortgage|car finance|tabby|tamara",
   "invest": "sarwa|interactive brokers|baraka|stake|wio invest",
   "insurance": "daman|axa|oman insurance|sukoon|orient insurance|adnic",
   "tax": "federal tax authority|\\bfta\\b",
   "rent": "rent|ejari|cheque.*rent|real estate"
  },
  "salaryWords": "salary|sal |wps|payroll",
  "tagline": "No income tax: gratuity, savings plans, VAT and corporate tax"
 },
 "NZ": {
  "code": "NZ",
  "slug": "nz",
  "name": "New Zealand",
  "short": "New Zealand",
  "currency": "NZD",
  "symbol": "NZ$",
  "money": "dollar",
  "locale": "en-NZ",
  "hreflang": "en-NZ",
  "dateOrder": "dmy",
  "taxYear": "Tax year 2026-27",
  "checkWith": "an FMA licensed financial advice provider, a chartered accountant or tax agent, and Inland Revenue",
  "taxYearSpan": "1 April 2026 to 31 March 2027",
  "checked": "October 2026",
  "tz": [
   "Pacific/Auckland",
   "Pacific/Chatham"
  ],
  "example": 75000,
  "tax": {
   "incomeTaxLabel": "Income tax",
   "allowance": null,
   "brackets": [
    [
     15600,
     0.105
    ],
    [
     53500,
     0.175
    ],
    [
     78100,
     0.3
    ],
    [
     180000,
     0.33
    ],
    [
     null,
     0.39
    ]
   ],
   "levies": [
    {
     "label": "ACC earners' levy (1.75%)",
     "rate": 0.0175,
     "upTo": 156641,
     "kind": "both"
    },
    {
     "label": "KiwiSaver, your 3.5% (saved for you)",
     "rate": 0.035,
     "kind": "salary",
     "type": "saving"
    }
   ],
   "notes": [
    "KiwiSaver default contributions rose to 3.5% for employees and employers from 1 April 2026.",
    "Self-employed ACC levies are set differently by ACC; the earners' levy is used here as an estimate."
   ]
  },
  "retire": {
   "label": "KiwiSaver",
   "types": [
    "KiwiSaver",
    "PIE fund",
    "Workplace superannuation"
   ],
   "limits": "From 1 April 2026 the default is 3.5% from you and 3.5% from your employer."
  },
  "fdLabel": "Term Deposits",
  "deadlines": [
   [
    4,
    1,
    "New tax year starts"
   ],
   [
    7,
    7,
    "File your IR3 return if you do it yourself"
   ],
   [
    8,
    28,
    "First provisional tax instalment"
   ],
   [
    1,
    15,
    "Second provisional tax instalment"
   ],
   [
    5,
    7,
    "Third provisional tax instalment"
   ]
  ],
  "freelance": {
   "vat": "GST registration is required once turnover passes NZ$60,000 a year.",
   "points": [
    "Self-employed income is taxed at the same rates, filed on an IR3 return.",
    "Provisional tax applies once your residual income tax is over NZ$5,000.",
    "Put aside money for tax and ACC levies as you invoice."
   ]
  },
  "regulators": [
   [
    "Banking Ombudsman Scheme",
    "Free help with complaints about banks.",
    "https://bankomb.org.nz/"
   ],
   [
    "Financial Markets Authority",
    "Report concerns about investment providers.",
    "https://www.fma.govt.nz/"
   ],
   [
    "Financial Services Complaints Ltd",
    "Disputes with insurers, lenders and advisers.",
    "https://www.fscl.org.nz/"
   ],
   [
    "Netsafe",
    "Help with online scams and fraud.",
    "https://netsafe.org.nz/"
   ]
  ],
  "keywords": {
   "groceries": "countdown|woolworths|new world|pak ?n ?save|four square|fresh choice",
   "eating": "uber ?eats|menulog|delivereasy|mcdonald|burger king|columbus coffee",
   "shopping": "the warehouse|kmart|briscoes|noel leeming|mitre 10|bunnings|farmers",
   "transport": "at hop|snapper|z energy|bp |mobil|gull|uber|waka kotahi",
   "utilities": "spark|one nz|2degrees|mercury|genesis|contact energy|meridian|watercare",
   "emi": "home loan|mortgage|loan repay",
   "invest": "sharesies|kernel|simplicity|hatch|inv(estment)? now|kiwisaver",
   "insurance": "aa insurance|ami|state insurance|tower|southern cross|nib",
   "tax": "inland revenue|\\bird\\b",
   "rent": "rent|tenancy|bond"
  },
  "salaryWords": "salary|wages|payroll",
  "tagline": "KiwiSaver, PAYE brackets, ACC levy and provisional tax"
 }
}/*END*/;

(function(){
  const DATA = window.CORPUS_COUNTRY_DATA;
  const ORDER = ['IN', 'US', 'UK', 'CA', 'AU', 'SG', 'AE', 'NZ'];

  /* ---------- which country is this person in ---------- */
  function readSettings(){ try{ return (JSON.parse(localStorage.getItem('corpus_data_v1') || '{}').settings) || {}; }catch(e){ return {}; } }
  function guessCountry(){
    try{
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      for(const c of ORDER) if(DATA[c].tz.includes(tz)) return c;
      const langs = navigator.languages || [navigator.language || ''];
      for(const l of langs){ const r = (l.split('-')[1] || '').toUpperCase(); const map = { GB: 'UK', IN: 'IN', US: 'US', CA: 'CA', AU: 'AU', SG: 'SG', AE: 'AE', NZ: 'NZ' }; if(map[r]) return map[r]; }
    }catch(e){}
    return 'IN';
  }
  // a country page (for example /us/income-tax-calculator.html) shows that country without changing the saved choice
  const pageCountry = document.documentElement.getAttribute('data-page-country');
  function country(){ if(DATA[pageCountry]) return pageCountry; const s = readSettings(); return DATA[s.country] ? s.country : guessCountry(); }
  function isChosen(){ return !!DATA[readSettings().country]; }
  function setCountry(code, keepCurrency){
    if(!DATA[code]) return;
    let d; try{ d = JSON.parse(localStorage.getItem('corpus_data_v1') || 'null'); }catch(e){}
    if(!d) d = (typeof defaultData === 'function') ? defaultData() : { settings: {} };
    d.settings = d.settings || {};
    d.settings.country = code;
    if(!keepCurrency) d.settings.currency = DATA[code].currency;
    try{ localStorage.setItem('corpus_data_v1', JSON.stringify(d)); }catch(e){}
    document.documentElement.dataset.country = code;
    document.dispatchEvent(new CustomEvent('corpus:country', { detail: code }));
  }
  // a link like dashboard.html?country=US picks the country
  try{ const q = new URLSearchParams(location.search).get('country'); if(q && DATA[q.toUpperCase()]) setCountry(q.toUpperCase()); }catch(e){}
  document.documentElement.dataset.country = country();

  /* ---------- tax engine, driven by the data above ---------- */
  const band = (x, from, upTo) => Math.max(0, Math.min(x, upTo == null ? Infinity : upTo) - (from || 0));
  function progressive(x, brackets){
    let tax = 0, prev = 0; const parts = [];
    for(const [up, rate] of brackets){
      const top = up == null ? Infinity : up;
      if(x > prev){ const slice = Math.min(x, top) - prev; tax += slice * rate; parts.push({ from: prev, to: top, rate, tax: slice * rate }); }
      prev = top;
    }
    return { tax, parts };
  }
  // piecewise amounts such as Australia's low income tax offset or Ontario's health premium:
  // steps are [upTo, base, rate, from], giving base + rate × (x − from) in that slice
  function piecewise(x, steps){
    for(const [up, base, rate, from] of steps){ if(up == null || x <= up) return Math.max(0, base + rate * (x - from)); }
    return 0;
  }
  // income: yearly salary, or yearly profit when kind is 'self'. revenue: business turnover (UAE test).
  // opts: status (US filing status, Singapore CPF), region (Canadian province), stateRate (US, % as a number)
  function computeTax(code, income, opts){
    opts = opts || {};
    const P = DATA[code]; if(!P) return null;
    income = Math.max(0, Number(income) || 0);
    const kind = opts.kind === 'self' ? 'self' : 'salary';
    if(P.tax.engine === 'india'){
      const r = typeof incomeTaxNew === 'function' ? incomeTaxNew(income, { salaried: kind === 'salary' }) : { total: 0, taxable: income };
      return { code, income, taxable: r.taxable, incomeTax: r.total, levies: 0, savings: 0, total: r.total, takeHome: income - r.total, effective: income ? r.total / income : 0, lines: [{ label: 'Income tax, new regime, with cess', amount: r.total }], parts: [] };
    }
    const T = P.tax;
    const status = opts.status || (T.statusOptions ? T.statusOptions[0][0] : 'single');
    const married = status === 'married' && T.married;
    const S = married ? T.married : T;
    const lines = []; let deductible = 0, levies = 0, savings = 0, creditBase = 0;
    const applyLevy = (l, baseAmt) => {
      const from = married && l.fromMarried != null ? l.fromMarried : (l.from || 0);
      let amt = l.rate * band(baseAmt, from, l.upTo);
      if(l.shadeIn) amt = Math.min(amt, l.shadeIn.rate * Math.max(0, baseAmt - l.shadeIn.from));
      if(amt <= 0) return;
      if(l.type === 'saving') savings += amt; else levies += amt;
      deductible += amt * (l.deductibleShare || 0);
      creditBase += amt * (l.creditShare || 0);
      lines.push({ label: l.label, amount: amt, saving: l.type === 'saving' });
    };
    const mine = (T.levies || []).filter(l => (l.kind === 'both' || l.kind === kind) && (!l.onlyStatus || l.onlyStatus === status));
    mine.filter(l => l.base !== 'taxable').forEach(l => applyLevy(l, l.base === 'self9235' ? income * 0.9235 : income));
    const levyCredits = creditBase;
    (T.credits || []).filter(c => c.kind === 'both' || c.kind === kind).forEach(c => { creditBase += c.amount; });
    let taxable = Math.max(0, income - deductible), allowance = 0;
    const A = S.allowance !== undefined ? S.allowance : T.allowance;
    if(A && A.type === 'deduction'){
      allowance = A.amount;
      if(A.taper) allowance = Math.max(0, allowance - Math.max(0, income - A.taper.from) * A.taper.rate);
      taxable = Math.max(0, taxable - allowance);
    }
    let { tax, parts } = progressive(taxable, S.brackets || T.brackets);
    if(A && A.type === 'credit'){
      allowance = income <= A.from ? A.amount : A.amount - (A.amount - A.min) * Math.min(1, (income - A.from) / (A.to - A.from));
      tax = Math.max(0, tax - (allowance + creditBase) * A.rate);
    }
    let offsetTotal = 0;
    (T.offsets || []).forEach(o => { const v = Math.min(tax, piecewise(taxable, o.steps)); if(v > 0){ tax -= v; offsetTotal += v; } });
    if(kind === 'self' && T.corporate){
      const c = T.corporate, turnover = opts.revenue != null ? Number(opts.revenue) : income;
      tax = turnover > c.minTurnover ? c.rate * Math.max(0, income - c.threshold) : 0;
      taxable = income; parts = [];
    }
    mine.filter(l => l.base === 'taxable').forEach(l => applyLevy(l, taxable));
    lines.unshift({ label: kind === 'self' && T.corporate ? T.corporate.label : (T.incomeTaxLabel || 'Income tax'), amount: tax });
    let regionTax = 0, region = null;
    if(T.regions){
      const key = T.regions.list[opts.region] ? opts.region : T.regions.default;
      const R = T.regions.list[key]; region = { key, name: R.name };
      const low = (R.brackets.find(b => b[1] > 0) || [0, 0])[1];
      let rt = progressive(taxable, R.brackets).tax;
      rt = Math.max(0, rt - (R.credit + levyCredits) * low);
      if(R.surtax) rt += R.surtax.reduce((sum, [over, rate]) => sum + rate * Math.max(0, rt - over), 0);
      if(rt > 0){ lines.splice(1, 0, { label: `${R.name} income tax`, amount: rt }); regionTax += rt; }
      if(R.premium && kind === 'salary' || R.premium && kind === 'self'){ const pr = piecewise(taxable, R.premium); if(pr > 0){ lines.splice(2, 0, { label: R.premiumLabel || 'Health premium', amount: pr }); regionTax += pr; } }
    }
    if(T.stateRate && Number(opts.stateRate) > 0){
      const st = Math.max(0, income - deductible - (A && A.type === 'deduction' ? allowance : 0)) * Number(opts.stateRate) / 100;
      if(st > 0){ lines.splice(1, 0, { label: `State income tax (${opts.stateRate}%, estimate)`, amount: st }); regionTax += st; }
    }
    const total = tax + levies + regionTax;
    return { code, income, taxable, allowance, incomeTax: tax, regionTax, region, offsets: offsetTotal, levies, savings, total, takeHome: income - total - savings, effective: income ? total / income : 0, lines, parts, status };
  }
  function marginalRate(code, income, opts){
    const a = computeTax(code, income, opts), b = computeTax(code, income + 100, opts);
    return a && b ? (b.total - a.total) / 100 : 0;
  }
  // UAE end of service gratuity: 21 days' basic pay a year for the first five years, 30 days after, capped at two years' pay
  function uaeGratuity(basicMonthly, years){
    const daily = basicMonthly / 30;
    if(years < 1) return { amount: 0, eligible: false };
    const first = Math.min(years, 5) * 21 * daily, rest = Math.max(0, years - 5) * 30 * daily;
    return { amount: Math.min(first + rest, basicMonthly * 24), eligible: true, capped: first + rest > basicMonthly * 24 };
  }

  /* ---------- upcoming country deadlines for the dashboard and calendar ---------- */
  function countryDeadlines(code, from, withinDays){
    const P = DATA[code]; if(!P || !P.deadlines) return [];
    from = from || new Date(); const end = new Date(from.getTime() + (withinDays || 366) * 864e5);
    const out = [];
    for(let y = from.getFullYear(); y <= from.getFullYear() + 1; y++){
      P.deadlines.forEach(([m, d, label]) => {
        const dt = new Date(y, m - 1, d);
        if(dt >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) && dt <= end) out.push({ date: dt, label, kind: 'tax' });
      });
    }
    return out.sort((a, b) => a.date - b.date);
  }

  window.CorpusCountry = {
    DATA, ORDER, get: (c) => DATA[c || country()], current: country, isChosen, set: setCountry, guess: guessCountry,
    isIndia: () => country() === 'IN', computeTax, piecewise, marginalRate, uaeGratuity, deadlines: countryDeadlines, progressive,
    list: () => ORDER.map(c => DATA[c])
  };
})();
