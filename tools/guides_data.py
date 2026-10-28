# -*- coding: utf-8 -*-
"""
Country guides: insurance, government schemes and student support for
every country except India (India has its own hand built pages).

One source of truth. build.py turns this into js/guides.js for the app
and into static pages under /us/, /uk/ ... for search engines.

Rules for editing
  * Every item links to an official (government, regulator or statutory
    body) page in `url`.
  * Figures go in the text only when they were checked on that page;
    `checked` records the month they were last checked.
  * Keep the words plain. No hyphens in running text where a space works.
"""

CHECKED = 'October 2026'   # set to the month once every item below has been verified

GUIDES = {}

# ---------------------------------------------------------------- USA
GUIDES['US'] = dict(
  insurance=dict(
    intro="Most people in the USA get health cover through work, the ACA Marketplace, Medicare or Medicaid. Life and disability cover are up to you, often with a small amount through your employer.",
    public=[
      dict(name="ACA Marketplace", what="Health plans you buy yourself on HealthCare.gov or your state's exchange, with premium tax credits for many households based on income. Sign up during open enrollment, which runs from 1 November to 15 January for 2027 cover on HealthCare.gov, or after a qualifying life event such as losing job based cover.", url="https://www.healthcare.gov/"),
      dict(name="Medicare", what="Federal health insurance from age 65, or earlier with certain disabilities. Part A covers hospital stays, Part B doctors and outpatient care, Part D prescriptions.", url="https://www.medicare.gov/"),
      dict(name="Medicaid and CHIP", what="Free or low cost cover for people and families with low income, and for children through CHIP. Rules differ by state.", url="https://www.healthcare.gov/medicaid-chip/"),
      dict(name="Social Security Disability Insurance", what="Monthly payments if a long lasting disability stops you working and you have paid enough Social Security tax. The bar is high and the wait is long, so it is a floor, not a plan.", url="https://www.ssa.gov/benefits/disability/qualify.html"),
    ],
    health="In the USA the number that matters is your plan's out of pocket maximum, the most you pay in a year for covered care. Keep at least that much in your emergency fund. If your plan qualifies for an HSA, money you put in is tax free going in, growing and coming out for medical bills.",
    disability="Long term disability insurance",
    disabilityNote="Usually pays 60% of your salary until you can work again or reach retirement age. Many employers offer group cover; check whether it is taxable and whether it covers your own occupation.",
    lifeNote="Employer life cover is often one or two times salary and ends when you leave, so it is shown but not relied on.",
    types=[
      dict(label="Health insurance", what="Pays for doctors, hospital, prescriptions and preventive care, after your deductible and copays, up to the out of pocket maximum.",
           pros=["Caps what a serious illness can cost you in a year", "Preventive care is usually free", "Employer plans are paid with pre tax money"],
           cons=["Deductibles can be thousands of dollars", "Networks limit which doctors you can see", "You can usually only change plans once a year"]),
      dict(label="Term life insurance", what="Pays a lump sum to your family if you die during the term, usually 10, 20 or 30 years.",
           pros=["Cheapest way to protect people who depend on your income", "Payouts are generally free of income tax", "Locks in a premium while you are young and healthy"],
           cons=["Pays nothing if you outlive the term", "Premiums rise sharply if you buy late", "Whole life and universal life policies cost far more for the same cover"]),
      dict(label="Long term disability", what="Replaces part of your income if illness or injury stops you working for months or years.",
           pros=["Protects your biggest asset, your earning power", "Covers illness, which is the most common cause of long absences", "Group cover through work is cheap"],
           cons=["Waiting periods of 90 days or more are common", "Benefits are often capped and can be taxable", "Definitions of disability vary a lot between policies"]),
      dict(label="Umbrella liability", what="Extra liability cover above your home and auto policies, typically in steps of one million dollars.",
           pros=["Inexpensive for the amount of cover", "Protects savings from lawsuits", "Covers things home and auto policies do not"],
           cons=["You must carry high limits on your other policies first", "Does not cover your own injuries or property", "Rarely needed with few assets"]),
      dict(label="Long term care", what="Pays for help with daily living at home or in a care facility, which Medicare mostly does not cover.",
           pros=["Care costs can drain savings quickly", "Hybrid life policies can pay out either way", "Some states offer partnership plans that protect assets"],
           cons=["Expensive, and premiums can rise later", "Hard to qualify for once health declines", "Many people never use it"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="Social Security retirement benefits", what="A monthly pension once you have about 10 years of work (40 credits). Full retirement age is 67 for anyone born in 1960 or later; claiming from 62 cuts the payment for life.", url="https://www.ssa.gov/pubs/EN-05-10035.pdf"),
      dict(name="401(k), 403(b) and IRAs", what="Tax advantaged retirement accounts. For 2026 you can defer up to $24,500 into a 401(k) and put up to $7,500 into an IRA, with extra catch up amounts from age 50.", url="https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500"),
      dict(name="Saver's Credit and Saver's Match", what="A tax credit of 10%, 20% or 50% of up to $2,000 you put into a retirement account, for people with low to moderate income. From 2027 contributions it becomes the Saver's Match: up to a 50% government match on the first $2,000, paid into your retirement account from 2028.", url="https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-credit-savers-credit"),
      dict(name="Health Savings Account", what="With a qualifying high deductible health plan, contribute up to $4,400 for yourself or $8,750 for a family in 2026, tax free in, while invested and out for medical costs.", url="https://www.irs.gov/forms-pubs/about-publication-969"),
      dict(name="Trump Accounts for children", what="A new tax advantaged investment account for children. Children born from 1 January 2025 to 31 December 2028 who are US citizens with a Social Security number can receive a one off $1,000 government deposit. Elect with Form 4547; family and employer contributions are accepted from 4 July 2026.", url="https://www.irs.gov/trumpaccounts"),
      dict(name="Series I savings bonds", what="Inflation protected bonds bought directly from the Treasury, up to $10,000 a year per person electronically.", url="https://www.treasurydirect.gov/savings-bonds/i-bonds/"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Earned Income Tax Credit", what="A refundable credit for working people with low to moderate income, larger with children. Many eligible people never claim it.", url="https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc"),
      dict(name="Child Tax Credit", what="Up to $2,200 per qualifying child under 17, of which up to $1,700 can be refunded if you have at least $2,500 of earned income. You and each child need a Social Security number valid for work.", url="https://www.irs.gov/credits-deductions/individuals/child-tax-credit"),
      dict(name="Child and Dependent Care Credit", what="A credit for part of what you pay for childcare or adult care so you can work.", url="https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information"),
      dict(name="SNAP food benefits", what="Monthly help to buy groceries for households with low income, run by each state.", url="https://fns.usda.gov/snap/applicant-recipient"),
      dict(name="Unemployment insurance", what="Weekly payments for a limited time after losing a job through no fault of your own. Apply to your state.", url="https://www.dol.gov/general/topic/unemployment-insurance"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="FHA loans", what="Mortgages insured by the government: 3.5% down with a credit score of 580 or more, or 10% down from 500 to 579.", url="https://www.hud.gov/helping-americans/loans"),
      dict(name="VA home loans", what="For eligible veterans, service members and surviving spouses, often with no down payment and no mortgage insurance.", url="https://www.benefits.va.gov/homeloans/"),
      dict(name="USDA rural home loans", what="No down payment loans for low and moderate income buyers in eligible rural areas.", url="https://www.rd.usda.gov/programs-services/single-family-housing-programs"),
      dict(name="State housing finance agencies", what="Most states run down payment and closing cost help for first time buyers. Find yours through HUD.", url="https://www.hud.gov/helping-americans/buying-a-home"),
    ]),
  ],
  students=dict(intro="Start with the FAFSA: it is the single form for federal grants, work study and loans, and most states and colleges use it too.", items=[
    dict(name="FAFSA", cat="start", level="College", what="The Free Application for Federal Student Aid. The form for each school year opens in the autumn before it starts. Fill it in every year you study, as early as you can, because some state and college aid runs out.", url="https://studentaid.gov/articles/fafsa-student-steps/"),
    dict(name="Federal Pell Grant", cat="grant", level="Undergraduate", what="Money you do not repay, for undergraduates with financial need. The maximum award for 2026-27 is $7,395.", url="https://fsapartners.ed.gov/knowledge-center/library/dear-colleague-letters/2026-01-30/2026-27-federal-pell-grant-maximum-and-minimum-award-amounts"),
    dict(name="Workforce Pell", cat="grant", level="Short courses", what="From 1 July 2026, Pell Grants can pay for approved short job training programs, some as short as 8 weeks, in fields your state says are in demand.", url="https://www.ed.gov/about/news/press-release/us-department-of-education-issues-final-rule-create-new-workforce-pell-grant-program"),
    dict(name="Federal Work Study", cat="work", level="College", what="Part time jobs for students with financial need, often on campus.", url="https://studentaid.gov/articles/8-things-federal-work-study/"),
    dict(name="Federal student loans", cat="loan", level="College", what="Direct Loans have fixed rates and income linked repayment. For loans from 1 July 2026, Grad PLUS closes to new borrowers; graduate students can borrow up to $20,500 a year ($100,000 in total), professional students $50,000 ($200,000), and Parent PLUS is capped at $20,000 a year and $65,000 per student. Undergraduate limits did not change.", url="https://www.ed.gov/about/news/press-release/fact-sheet-trump-administration-making-college-more-affordable"),
    dict(name="TEACH Grant", cat="grant", level="Future teachers", what="Up to about $4,000 a year (slightly less after automatic federal budget cuts) if you agree to teach a high need subject full time in a school serving low income students for four years within eight years of finishing. If you do not, it turns into a loan.", url="https://studentaid.gov/sites/default/files/teachCounselingGuide.pdf"),
    dict(name="529 education savings plans", cat="saving", level="School to college", what="State run investment accounts where growth is tax free if spent on qualified education, including some K to 12 tuition.", url="https://www.irs.gov/newsroom/529-plans-questions-and-answers"),
    dict(name="CareerOneStop Scholarship Finder", cat="search", level="All levels", what="A free Department of Labor search of thousands of scholarships, fellowships and grants.", url="https://www.careeronestop.org/Toolkit/Training/find-scholarships.aspx"),
    dict(name="State grants", cat="grant", level="College", what="Most states have their own grant programs, often using the FAFSA. Your state higher education agency lists them.", url="https://studentaid.gov/sites/default/files/do-you-need-money.pdf"),
  ]),
)

# ---------------------------------------------------------------- UK
GUIDES['UK'] = dict(
  insurance=dict(
    intro="The NHS treats you free when you need it, so in the UK insurance is mostly about replacing your income and paying off the mortgage, not hospital bills.",
    public=[
      dict(name="NHS", what="Free at the point of use for residents: GP, hospital and emergency care. Prescriptions are free in Scotland, Wales and Northern Ireland and charged per item in England unless you are exempt.", url="https://www.nhs.uk/nhs-services/"),
      dict(name="Statutory Sick Pay", what="Paid by your employer if you are too ill to work, for up to 28 weeks. Since 6 April 2026 it is paid from the first day of sickness, with no minimum earnings, at the flat weekly rate or 80% of your average weekly earnings if that is lower.", url="https://www.gov.uk/statutory-sick-pay"),
      dict(name="New Style ESA and Universal Credit", what="Benefits if illness or disability limits your work for longer, depending on your National Insurance record or household income.", url="https://www.gov.uk/employment-support-allowance/eligibility"),
      dict(name="Death in service from work", what="Many employers pay a lump sum, often two to four times salary, if you die while employed. It stops when you leave.", url="https://www.moneyhelper.org.uk/en/everyday-money/insurance/what-is-life-insurance"),
    ],
    health="With the NHS behind you, private medical insurance is a choice about speed and comfort for planned treatment, not a need. Income protection usually matters more, because Statutory Sick Pay is small.",
    disability="Income protection",
    disabilityNote="Pays a monthly income, typically 50 to 70% of earnings, if illness or injury stops you working, after a waiting period you choose. MoneyHelper explains the choices.",
    lifeNote="Death in service cover is shown but not relied on, because it ends when you change jobs.",
    types=[
      dict(label="Life insurance", what="A lump sum if you die during the term. Level term keeps the same payout; decreasing term shrinks with a repayment mortgage.",
           pros=["Clears the mortgage and protects your family", "Cheap when bought young", "Written in trust, it can be paid out quickly and outside your estate"],
           cons=["No payout if you outlive the term", "Premiums depend heavily on health and smoking", "Joint policies pay out only once"]),
      dict(label="Income protection", what="A monthly income while you cannot work through illness or injury, until you recover, retire or the term ends.",
           pros=["Covers the most likely risk, long illness", "Pays out repeatedly, not once", "Benefits are generally tax free when you pay the premiums"],
           cons=["Longer waiting periods keep premiums down but delay payment", "Cheaper policies may only pay for one or two years", "Check how it treats mental health claims"]),
      dict(label="Critical illness cover", what="A tax free lump sum if you are diagnosed with a listed serious illness such as some cancers, heart attack or stroke.",
           pros=["Money to adapt your home or take time off", "Often added to a life policy", "Pays regardless of whether you can work"],
           cons=["Only covers the conditions listed", "More expensive than life cover", "Severity rules mean some diagnoses do not qualify"]),
      dict(label="Private medical insurance", what="Pays for private treatment of acute conditions, avoiding NHS waiting lists for planned care.",
           pros=["Faster diagnosis and surgery", "Choice of hospital and specialist", "Often offered as a work perk"],
           cons=["Premiums rise with age", "Usually excludes chronic and pre existing conditions", "A work benefit is taxable as a benefit in kind"]),
      dict(label="Family income benefit", what="A form of life cover that pays a monthly income to your family until the end of the term instead of one lump sum.",
           pros=["Often cheaper than a lump sum policy", "Matches the way families spend", "Easy to budget around"],
           cons=["Pays less the later in the term you die", "Less flexible than a lump sum", "Not suited to clearing a mortgage"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="ISAs", what="Save or invest up to £20,000 a year with no tax on interest, dividends or gains. From 6 April 2027, no more than £12,000 of that can go into cash ISAs if you are under 65. A Junior ISA takes up to £9,000 a year for a child.", url="https://www.gov.uk/individual-savings-accounts"),
      dict(name="Lifetime ISA", what="Open from 18 to 39 and pay in up to £4,000 a year until 50. The government adds 25%, up to £1,000 a year, for a first home up to £450,000 or from age 60. Other withdrawals lose a 25% charge. The government plans a new First Time Buyer ISA in its place; existing Lifetime ISAs can carry on.", url="https://www.gov.uk/lifetime-isa"),
      dict(name="Help to Save", what="If you work and get Universal Credit, save £1 to £50 a month and receive a 50% bonus after two and four years, up to £1,200 in total. Open to new accounts until April 2027.", url="https://www.gov.uk/get-help-savings-low-income"),
      dict(name="Workplace pensions", what="Your employer must enrol you if you earn at least £10,000 a year and are between 22 and State Pension age. At least 8% of qualifying earnings goes in, of which 3% or more comes from the employer.", url="https://www.gov.uk/workplace-pensions/joining-a-workplace-pension"),
      dict(name="State Pension", what="From State Pension age, based on your National Insurance record. You usually need 35 qualifying years for the full new State Pension. Check your forecast online.", url="https://www.gov.uk/check-state-pension"),
      dict(name="Pension Credit", what="Tops up weekly income for people over State Pension age on a low income, and unlocks other help. Many who qualify do not claim.", url="https://www.gov.uk/pension-credit"),
      dict(name="Premium Bonds", what="Government backed savings with NS&I that pay prizes instead of interest, tax free, up to £50,000.", url="https://www.nsandi.com/products/premium-bonds"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Child Benefit", what="A weekly payment for each child. If the higher earning parent has income over £60,000, 1% is repaid for every £200 above that, and all of it from £80,000, through the High Income Child Benefit Charge.", url="https://www.gov.uk/child-benefit"),
      dict(name="Tax-Free Childcare", what="For every £8 you pay into the account, the government adds £2, up to £2,000 a year per child under 12, or £4,000 for a disabled child under 17. Reconfirm your details every three months.", url="https://www.gov.uk/tax-free-childcare"),
      dict(name="Free childcare hours (England)", what="Working parents can get up to 30 hours a week of funded childcare from when a child is 9 months old, in term time.", url="https://www.gov.uk/check-eligible-free-childcare-if-youre-working"),
      dict(name="Marriage Allowance", what="If one partner earns below the Personal Allowance, they can transfer £1,260 of it to a basic rate taxpayer partner, saving up to £252 a year.", url="https://www.gov.uk/marriage-allowance"),
      dict(name="Universal Credit", what="A monthly payment for people on a low income or out of work, including help with housing and childcare costs.", url="https://www.gov.uk/universal-credit"),
      dict(name="Benefits calculators", what="Free, independent calculators linked from GOV.UK show what you might be entitled to in a few minutes.", url="https://www.gov.uk/benefits-calculators"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="Lifetime ISA for a first home", what="The 25% government bonus can go towards a first home costing up to £450,000.", url="https://www.gov.uk/lifetime-isa/buying-your-first-home"),
      dict(name="Shared Ownership", what="Buy a share of a home, typically 10% to 75%, and pay rent on the rest, with the option to buy more later.", url="https://www.gov.uk/shared-ownership-scheme"),
      dict(name="First time buyer Stamp Duty relief", what="First time buyers in England and Northern Ireland pay no Stamp Duty on the first £300,000 of a home up to £500,000.", url="https://www.gov.uk/stamp-duty-land-tax/residential-property-rates"),
    ]),
  ],
  students=dict(intro="Student finance depends on where in the UK you live. The links below are for England unless they say otherwise.", items=[
    dict(name="Tuition Fee Loan", cat="loan", level="Undergraduate", what="Covers your course fees, paid straight to the university. You repay through payroll only once you earn above the threshold, and anything left is written off after 40 years on Plan 5.", url="https://www.gov.uk/government/publications/student-finance-how-youre-assessed-and-paid/student-finance-how-youre-assessed-and-paid-2026-to-2027"),
    dict(name="Maintenance Loan", cat="loan", level="Undergraduate", what="Help with living costs. How much depends on household income and where you live while studying.", url="https://www.gov.uk/student-finance/new-fulltime-students"),
    dict(name="Disabled Students' Allowance", cat="grant", level="Higher education", what="Extra support for study costs caused by a disability, long term health or mental health condition, or learning difference. It does not have to be repaid.", url="https://www.gov.uk/disabled-students-allowance-dsa"),
    dict(name="16 to 19 Bursary Fund", cat="grant", level="Sixth form and college", what="Help with costs such as travel and books for students aged 16 to 19 in England, from your school or college.", url="https://www.gov.uk/1619-bursary-fund"),
    dict(name="Student Awards Agency Scotland", cat="grant", level="Scotland", what="Scottish students studying in Scotland usually pay no tuition fees, and can get bursaries and loans for living costs.", url="https://www.saas.gov.uk/files/447/saas-student-funding-key-facts.pdf"),
    dict(name="Student Finance Wales", cat="grant", level="Wales", what="Welsh students can get a mix of grant and loan for living costs, with a larger grant for lower household incomes.", url="https://www.studentfinancewales.co.uk/"),
    dict(name="Student Finance NI", cat="loan", level="Northern Ireland", what="Loans and grants for students from Northern Ireland.", url="https://www.studentfinanceni.co.uk/"),
    dict(name="Bursaries and scholarships from universities", cat="search", level="Higher education", what="Most universities offer their own bursaries for lower income students. UCAS explains how to find them.", url="https://www.ucas.com/money-and-student-life/money/additional-funding"),
  ]),
)

# ---------------------------------------------------------------- Canada
GUIDES['CA'] = dict(
  insurance=dict(
    intro="Your province pays for doctors and hospitals. The gaps are prescription drugs, dental, vision and income if you cannot work, which is where group benefits and private cover come in.",
    public=[
      dict(name="Provincial health insurance", what="Each province and territory covers medically necessary doctor and hospital care for residents, such as OHIP in Ontario or MSP in British Columbia.", url="https://www.canada.ca/en/health-canada/services/health-cards.html"),
      dict(name="Canadian Dental Care Plan", what="Federal dental coverage for residents without dental insurance and with adjusted family net income under $90,000.", url="https://www.canada.ca/en/services/benefits/dental/dental-care-plan.html"),
      dict(name="EI sickness benefits", what="Up to 26 weeks of Employment Insurance at 55% of your earnings, up to $729 a week, if illness or injury stops you working and you have enough insured hours.", url="https://www.canada.ca/en/services/benefits/ei/ei-sickness.html"),
      dict(name="CPP disability benefit", what="A monthly payment if a severe and prolonged disability stops you working regularly, based on your CPP contributions.", url="https://www.canada.ca/en/services/benefits/publicpensions/cpp-disability-benefit.html"),
    ],
    health="Basic care is free, so plan around what is not covered: drugs, dental, eyes, physio and travel outside your province. A workplace benefits plan usually covers these; if you have none, compare individual health and dental plans.",
    disability="Disability insurance",
    disabilityNote="Usually replaces 60 to 85% of income after a waiting period. Group long term disability is common at work; self employed people need their own policy.",
    lifeNote="Group life through work is often one or two times salary and ends when you leave, so it is shown but not relied on.",
    types=[
      dict(label="Term life insurance", what="A tax free lump sum to your beneficiaries if you die during the term.",
           pros=["Low cost for large cover", "Death benefit is not taxable", "Easy to match to a mortgage or children's ages"],
           cons=["Ends with nothing if you outlive it", "Renewal premiums jump", "Permanent policies cost much more"]),
      dict(label="Disability insurance", what="Monthly income if you cannot work because of illness or injury.",
           pros=["Protects your income for years", "Benefits from a policy you pay for yourself are usually tax free", "Covers illness as well as accidents"],
           cons=["Waiting periods of 90 to 120 days are common", "Group plans may be taxable and limited", "Expensive for some occupations"]),
      dict(label="Critical illness", what="A lump sum if you are diagnosed with a covered illness such as cancer, heart attack or stroke and survive the waiting period.",
           pros=["Money for recovery time or private care", "Paid whether or not you can work", "Return of premium options exist"],
           cons=["Only listed conditions are covered", "Premiums are significant", "Definitions are strict"]),
      dict(label="Supplementary health and dental", what="Pays for prescriptions, dental, vision, physiotherapy and other costs the province does not cover.",
           pros=["Predictable costs for regular care", "Group plans are often employer paid", "Covers family members"],
           cons=["Annual limits per service", "Individual plans may exclude pre existing conditions", "Can cost more than you claim"]),
      dict(label="Travel medical", what="Emergency medical costs while outside your province or Canada, which provincial plans cover only partly.",
           pros=["Hospital bills abroad can be enormous", "Cheap for short trips", "Often included with credit cards or work plans"],
           cons=["Pre existing condition rules are strict", "Card coverage may have short limits", "Needs renewing for long stays"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="TFSA", what="Investment growth and withdrawals are tax free. The 2026 annual limit is $7,000, and unused room carries forward.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/opening.html"),
      dict(name="RRSP", what="Contributions reduce taxable income; tax is paid on withdrawal. Your limit is 18% of last year's earned income up to the yearly maximum, shown on your notice of assessment.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html"),
      dict(name="First Home Savings Account", what="Contribute up to $8,000 a year and $40,000 in total, deduct it like an RRSP, and withdraw tax free for a first home.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html"),
      dict(name="Canada Pension Plan", what="A monthly pension based on your contributions, normally from 65, available from 60 with a reduction or up to 70 with an increase.", url="https://www.canada.ca/en/employment-social-development/programs/pension-plan.html"),
      dict(name="Old Age Security and GIS", what="OAS is paid from 65 to most residents; the Guaranteed Income Supplement adds more for those with low income.", url="https://www.canada.ca/en/services/benefits/publicpensions/old-age-security.html"),
      dict(name="RDSP", what="A savings plan for people eligible for the Disability Tax Credit, with government grants and bonds added.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Canada Child Benefit", what="A tax free monthly payment for children under 18, larger for lower family incomes. File your taxes every year to keep it.", url="https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4114/canada-child-benefit.html"),
      dict(name="Canada Groceries and Essentials Benefit", what="A tax free payment four times a year for individuals and families with low and modest income. It replaced the GST/HST credit in July 2026 with the same rules, and you are considered automatically when you file your taxes.", url="https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-groceries-essentials-benefit.html"),
      dict(name="Canada Workers Benefit", what="A refundable tax credit for low income workers, with an extra amount for people eligible for the Disability Tax Credit.", url="https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-workers-benefit.html"),
      dict(name="Canada Disability Benefit", what="A monthly payment for working age people with disabilities and low income who have the Disability Tax Credit.", url="https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit/amount.html"),
      dict(name="Benefits finder", what="Answer a few questions to see federal, provincial and territorial benefits you may qualify for.", url="https://www.canada.ca/en/services/benefits/finder/tool.html"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="Home Buyers' Plan", what="Withdraw up to $60,000 from your RRSPs to buy or build a first home, and repay it over 15 years. For a first withdrawal in 2026 to 2028, repayments start in the fifth year after the withdrawal.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/what-home-buyers-plan.html"),
      dict(name="First Time Home Buyers' Tax Credit", what="A $10,000 amount that gives up to $1,500 of federal tax relief in the year you buy a qualifying first home.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31270-home-buyers-amount.html"),
      dict(name="GST relief for first time buyers", what="First time buyers of a newly built home pay no GST on homes up to $1 million and less GST up to $1.5 million, a saving of up to $50,000, for agreements signed from 20 March 2025 and before 2031.", url="https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/19-3-10/first-time-home-buyers-gst-hst-rebate.html"),
    ]),
  ],
  students=dict(intro="You apply for federal and provincial student aid together, through your province or territory.", items=[
    dict(name="Canada Student Financial Assistance", cat="start", level="College and university", what="Federal grants and loans for post secondary students, applied for through your provincial student aid office such as OSAP or StudentAid BC.", url="https://www.canada.ca/en/services/benefits/education/student-aid.html"),
    dict(name="Canada Student Grants", cat="grant", level="College and university", what="Money you do not repay, for full time and part time students with financial need, students with disabilities and students with dependants. Full time students can get up to $4,200 a year until the end of the 2026 to 2027 school year.", url="https://www.canada.ca/en/services/benefits/education/student-aid/grants-loans.html"),
    dict(name="Canada Student Loans", cat="loan", level="College and university", what="Interest on Canada Student Loans was permanently eliminated from April 2023. Repayment starts after you finish studying, and the Repayment Assistance Plan lowers or pauses payments if your income is low.", url="https://www.csnpe-nslsc.canada.ca/en/what-is-new"),
    dict(name="RESP and Canada Education Savings Grant", cat="saving", level="Before college", what="Save in an RESP and the government adds 20% of the first $2,500 each year, up to $500 a year and $7,200 per child. Lower and middle income families get up to $100 or $50 more a year.", url="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-education-savings-plans-resps/canada-education-savings-programs-cesp/canada-education-savings-grant-cesg.html"),
    dict(name="Canada Learning Bond", cat="grant", level="Before college", what="$500 in the first year and up to $2,000 in total, paid into an RESP for children from low income families, with no contribution needed.", url="https://www.canada.ca/en/services/benefits/education/education-savings/estimating-amounts.html"),
    dict(name="Post Secondary Student Support Program", cat="grant", level="First Nations and Inuit", what="Funding for tuition, travel and living costs for eligible First Nations and Inuit students.", url="https://www.sac-isc.gc.ca/eng/1100100033682/1531933580211"),
  ]),
)

# ---------------------------------------------------------------- Australia
GUIDES['AU'] = dict(
  insurance=dict(
    intro="Medicare covers public hospital care and subsidises doctors. Private hospital cover is optional but has tax rules that push higher earners towards it, and much life cover sits inside super.",
    public=[
      dict(name="Medicare", what="Free treatment as a public patient in public hospitals, and rebates for doctor visits and many tests.", url="https://www.servicesaustralia.gov.au/enrolling-medicare?context=60092"),
      dict(name="Pharmaceutical Benefits Scheme", what="Subsidised prescription medicines. Since 1 January 2026 a general patient pays at most $25 per PBS script, concession card holders much less, with a safety net for heavy users.", url="https://www.pbs.gov.au/about"),
      dict(name="Insurance inside your super", what="Most super funds include default death, total and permanent disability, and sometimes income protection cover, paid from your balance.", url="https://moneysmart.gov.au/how-life-insurance-works/insurance-through-super"),
      dict(name="NDIS", what="Funding for supports for Australians under 65 with a permanent and significant disability.", url="https://www.ndis.gov.au/understanding/what-ndis"),
    ],
    health="If your income is above the Medicare Levy Surcharge threshold ($105,000 single or $210,000 family for 2026-27) and you have no private hospital cover, you pay an extra 1 to 1.5% tax. Buying hospital cover after the 1 July following your 31st birthday also adds a Lifetime Health Cover loading of 2% a year. Extras cover is optional.",
    disability="Income protection",
    disabilityNote="Pays up to about 70% of your income after a waiting period, often available through super. Premiums for a policy held outside super are generally tax deductible.",
    lifeNote="Check the cover in your super fund first: it is already counted here if you entered it as a policy.",
    types=[
      dict(label="Private hospital cover", what="Pays for treatment as a private patient, choice of doctor and shorter waits for elective surgery.",
           pros=["Avoids the Medicare Levy Surcharge above the threshold", "Avoids the Lifetime Health Cover loading if bought early", "Shorter waits for planned surgery"],
           cons=["Gaps and excesses still apply", "Lower tiers exclude many treatments", "Premiums rise every April"]),
      dict(label="Extras cover", what="Partly pays for dental, optical, physio and similar services.",
           pros=["Useful for regular dental or physio", "Some funds give free check ups", "Simple to claim"],
           cons=["Yearly limits are low", "Often costs more than you claim back", "Does nothing for tax"]),
      dict(label="Life cover", what="A lump sum to your family if you die or are diagnosed with a terminal illness.",
           pros=["Often already inside super", "Cheaper inside super because premiums come from pre tax money", "Can clear the mortgage"],
           cons=["Default super cover may be too low", "Premiums inside super reduce your retirement balance", "Cover can lapse if the account goes inactive"]),
      dict(label="Total and permanent disability", what="A lump sum if you are unlikely ever to work again.",
           pros=["Pays for care and home changes", "Often bundled with life cover in super", "Large amounts available"],
           cons=["Own occupation definitions are rare inside super", "Claims can take time", "Tax can apply on payouts from super under 60"]),
      dict(label="Income protection", what="A monthly benefit while illness or injury stops you working.",
           pros=["Protects your income, not just a lump sum", "Premiums outside super are generally tax deductible", "Covers illness and accidents"],
           cons=["Benefit periods and waiting periods change the price a lot", "Inside super, benefits may stop after two years", "Self employed income can be hard to prove"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="Superannuation Guarantee", what="Your employer must pay 12% of your earnings into super. Since 1 July 2026, under Payday Super, it must reach your fund within 7 business days of each payday instead of quarterly.", url="https://www.ato.gov.au/businesses-and-organisations/super-for-employers/about-payday-super"),
      dict(name="Government co-contribution", what="If your income is under $64,293 in 2026-27 and you make an after tax contribution to super, the government adds up to $500, the full amount below $49,293.", url="https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/how-to-save-more-in-your-super/government-super-contributions/super-co-contribution"),
      dict(name="Low Income Super Tax Offset", what="If you earn up to $37,000, the government pays back the tax on your concessional super contributions, up to $500 a year.", url="https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/how-to-save-more-in-your-super/government-super-contributions/low-income-super-tax-offset"),
      dict(name="First Home Super Saver Scheme", what="Save for a first home inside super with voluntary contributions, up to $15,000 a year and $50,000 in total, then release them for a deposit.", url="https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/withdrawing-and-using-your-super/early-access-to-super/first-home-super-saver-scheme"),
      dict(name="Age Pension", what="A means tested pension from age 67 for people who meet residence rules.", url="https://www.servicesaustralia.gov.au/age-pension"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Family Tax Benefit", what="Fortnightly payments to help with the cost of raising children, based on family income.", url="https://www.servicesaustralia.gov.au/family-tax-benefit"),
      dict(name="Child Care Subsidy", what="Pays part of your childcare fees directly to the provider, based on family income. Since 5 January 2026, eligible families get at least 3 days a week subsidised whatever their hours of work or study.", url="https://www.servicesaustralia.gov.au/child-care-subsidy"),
      dict(name="Paid Parental Leave", what="Government funded parental leave pay for eligible working parents, with super paid on it for babies born or adopted from July 2025.", url="https://www.servicesaustralia.gov.au/parental-leave-pay"),
      dict(name="Payment and Service Finder", what="Check which Services Australia payments you might get.", url="https://www.servicesaustralia.gov.au/payment-and-service-finder"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="5% Deposit Scheme", what="Buy with a deposit from 5% (2% for single parents) without lenders mortgage insurance. Since 1 October 2025 there are no income limits or caps on places, and higher property price caps.", url="https://www.housingaustralia.gov.au/support-buy-home"),
      dict(name="State first home buyer grants and duty concessions", what="Each state and territory has its own grants and stamp duty concessions for first home buyers.", url="https://treasury.gov.au/policy-topics/housing/home-ownership-support"),
    ]),
  ],
  students=dict(intro="Most domestic students study in a Commonwealth supported place and defer their share of fees with HECS-HELP.", items=[
    dict(name="HECS-HELP", cat="loan", level="University", what="A government loan for your share of fees in a Commonwealth supported place. You repay through tax only once your income passes the repayment threshold ($67,000 in 2025-26), and the balance is indexed each June to the cost of living, not charged interest.", url="https://www.studyassist.gov.au/financial-and-study-support/hecs-help"),
    dict(name="FEE-HELP and VET Student Loans", cat="loan", level="University and VET", what="Loans for full fee places and approved vocational diplomas, repaid the same way as HECS-HELP.", url="https://www.studyassist.gov.au/financial-and-study-support/how-student-loans-work"),
    dict(name="Youth Allowance for students", cat="grant", level="School leavers to 24", what="Fortnightly payment for full time students aged 16 to 24, means tested on you and often your parents.", url="https://www.servicesaustralia.gov.au/who-can-get-youth-allowance-for-students-and-apprentices?context=43916"),
    dict(name="Austudy and ABSTUDY", cat="grant", level="25 and over, and First Nations students", what="Austudy supports full time students aged 25 and over; ABSTUDY supports Aboriginal and Torres Strait Islander students and apprentices.", url="https://www.servicesaustralia.gov.au/who-can-get-austudy?context=22441"),
    dict(name="Commonwealth Prac Payment", cat="grant", level="Teaching, nursing, midwifery, social work", what="$331.65 a week during mandatory placements for eligible students in these degrees and the Diploma of Nursing, if you get income support or pass a work and income test.", url="https://www.education.gov.au/commonwealth-prac-payment-cpp/students"),
    dict(name="Free TAFE", cat="grant", level="Vocational", what="Tuition free places in priority vocational courses, now permanent under the Free TAFE Act 2025, with at least 100,000 places a year from 2027.", url="https://www.dewr.gov.au/skills-reform/free-tafe"),
  ]),
)

# ---------------------------------------------------------------- Singapore
GUIDES['SG'] = dict(
  insurance=dict(
    intro="Every citizen and PR already has basic hospital and long term care insurance through CPF. Private plans add better wards, higher limits and life and income cover.",
    public=[
      dict(name="MediShield Life", what="Basic health insurance for all citizens and PRs for life, for large hospital bills and some costly outpatient treatment, paid from MediSave.", url="https://www.cpf.gov.sg/member/healthcare-financing/medishield-life"),
      dict(name="MediSave", what="Part of your CPF for hospital bills, some outpatient care and insurance premiums.", url="https://www.cpf.gov.sg/service/article/what-is-medisave"),
      dict(name="CareShield Life", what="Long term care insurance paying a monthly cash payout for life if you cannot do three or more daily living activities ($689 a month for claims in 2026). Automatic for citizens and PRs born in 1980 or later, from age 30.", url="https://www.cpf.gov.sg/service/article/what-is-careshield-life"),
      dict(name="Dependants' Protection Scheme", what="Low cost term life cover for CPF members aged 21 to 65, started automatically with your first working contribution unless you opt out: $70,000 up to age 60, then $55,000 to 65.", url="https://www.cpf.gov.sg/service/article/what-is-the-dependants-protection-scheme"),
      dict(name="MediFund", what="A safety net for citizens who cannot afford their medical bills after subsidies, MediShield Life and MediSave.", url="https://www.moh.gov.sg/managing-expenses/schemes-and-subsidies/medifund/"),
    ],
    health="MediShield Life is sized for subsidised B2 and C wards. An Integrated Shield Plan adds cover for A class wards or private hospitals, and its premium can be partly paid from MediSave within yearly limits. Riders that remove co-payments cost much more and must be paid in cash.",
    disability="Disability income insurance",
    disabilityNote="Replaces part of your monthly income if you cannot work through illness or injury. CareShield Life covers only severe disability, so it does not replace a salary.",
    lifeNote="The Dependants' Protection Scheme sum assured is modest, so most families need more term cover.",
    types=[
      dict(label="Integrated Shield Plan", what="A private plan that sits on top of MediShield Life for higher ward classes and private hospitals.",
           pros=["Choice of ward and specialist", "Part of the premium can be paid from MediSave", "Higher claim limits"],
           cons=["Premiums rise steeply with age", "Cash outlay above MediSave limits", "Riders add a lot of cost"]),
      dict(label="Term life insurance", what="A lump sum if you die or become totally and permanently disabled during the term.",
           pros=["Large cover for a low premium", "Easy to match to a home loan", "Can be combined with critical illness"],
           cons=["No value at the end of the term", "Whole life plans cost far more", "Premiums depend on health and smoking"]),
      dict(label="Critical illness and early critical illness", what="A lump sum on diagnosis of a covered illness, at early or severe stages depending on the plan.",
           pros=["Money during recovery", "Early stage plans pay sooner", "Pays regardless of work status"],
           cons=["Only listed conditions", "Early stage cover costs more", "Multi pay features add cost"]),
      dict(label="Disability income", what="Monthly income replacement while you cannot work.",
           pros=["Protects your largest asset", "Covers illness and injury", "Payouts can last to retirement age"],
           cons=["Fewer products on the market", "Waiting periods apply", "Payout capped at a share of income"]),
      dict(label="Personal accident", what="Pays on accidental death, disablement and accident medical costs.",
           pros=["Cheap", "Covers minor accident bills", "No medical check usually"],
           cons=["Does not cover illness", "Limited payouts", "Overlaps with other cover"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="CPF", what="Mandatory savings for citizens and PRs, split into Ordinary, Special or Retirement, and MediSave accounts, with guaranteed interest floors.", url="https://www.cpf.gov.sg/member/cpf-overview"),
      dict(name="CPF LIFE", what="A national annuity that pays a monthly income for life from 65, funded from your Retirement Account.", url="https://www.cpf.gov.sg/member/retirement-income/monthly-payouts/cpf-life"),
      dict(name="Retirement Sum Topping-Up", what="Top up your own or family members' CPF retirement savings, with tax relief of up to $8,000 for yourself and $8,000 for family each year.", url="https://www.cpf.gov.sg/member/growing-your-savings/saving-more-with-cpf/top-up-to-enjoy-higher-retirement-payouts"),
      dict(name="Matched Retirement Savings Scheme", what="For citizens aged 55 and above with retirement savings below the Basic Retirement Sum and modest income, the government matches cash top ups dollar for dollar, up to $2,000 a year and $20,000 in a lifetime.", url="https://www.cpf.gov.sg/member/infohub/educational-resources/matched-retirement-savings-scheme-what-you-need-to-know"),
      dict(name="Supplementary Retirement Scheme", what="Voluntary savings with tax relief: up to $15,300 a year for citizens and PRs and $35,700 for foreigners.", url="https://www.mof.gov.sg/news-resources/supplementary-retirement-scheme/"),
      dict(name="Singapore Savings Bonds", what="Government bonds you can redeem any month without penalty, with interest that steps up the longer you hold.", url="https://www.mas.gov.sg/bonds-and-bills/singapore-savings-bonds"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Baby Bonus and the SG Child Support Package", what="Today the Baby Bonus gives a cash gift of $11,000 to $13,000 per Singapore citizen child plus a Child Development Account with a First Step Grant and dollar for dollar matching. From April 2027 it is replaced by the SG Child Support Package: for children born from 1 April 2027, a $10,000 Baby Gift, $2,000 Child Credits a year from age 1 to 16, CDA grants and a $10,000 PSEA top up at 17. Children already in the Baby Bonus move across automatically.", url="https://www.life.gov.sg/family-parenting/benefits-support/sg-child-support-package"),
      dict(name="Workfare Income Supplement", what="Cash and CPF top ups for Singapore citizen workers aged 30 and above earning $500 to $3,000 a month.", url="https://www.cpf.gov.sg/member/growing-your-savings/government-support/workfare-income-supplement"),
      dict(name="SkillsFuture Credit", what="Credit for approved courses from age 25, with an extra top up for those aged 40 and above.", url="https://www.myskillsfuture.gov.sg/content/portal/en/career-resources/career-resources/education-career-personal-development/SkillsFuture_Credit.html"),
      dict(name="GST Voucher", what="Cash, MediSave and U-Save utility rebates for lower income citizens and households.", url="https://www.gstvoucher.gov.sg/overview-of-gstv"),
      dict(name="Silver Support Scheme", what="Quarterly cash for seniors aged 65 and above who had low incomes over their working life.", url="https://www.cpf.gov.sg/member/retirement-income/government-support/silver-support-scheme"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="CPF housing grants", what="First timer families with household income up to $9,000 a month can get the Enhanced CPF Housing Grant of up to $120,000 for a new or resale HDB flat, plus Family and Proximity grants for resale flats.", url="https://www.hdb.gov.sg/cs/infoweb/residential/buying-a-flat/understanding-your-eligibility-and-housing-loan-options/flat-and-grant-eligibility/couples-and-families"),
      dict(name="Using CPF for a home", what="Ordinary Account savings can pay the down payment and monthly instalments, within limits.", url="https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home"),
    ]),
  ],
  students=dict(intro="Government schools and universities are heavily subsidised for citizens. On top of that, means tested aid covers most of what remains.", items=[
    dict(name="MOE Financial Assistance Scheme", cat="grant", level="Primary to pre-university", what="Full fee subsidies, free textbooks and uniforms, meal and transport subsidies for students in government and government aided schools. From 2026 households earning up to $4,000 a month, or $1,000 per person, qualify.", url="https://www.moe.gov.sg/news/press-releases/20251016-moe-financial-assistance-schemes-to-benefit-an-additional-31000-students"),
    dict(name="Edusave", cat="grant", level="Primary and secondary", what="Yearly contributions into each citizen student's Edusave account for school programmes, plus Edusave scholarships and awards for merit and good conduct.", url="https://www.moe.gov.sg/financial-matters/edusave-account"),
    dict(name="Higher Education Bursaries", cat="grant", level="ITE, polytechnic and university", what="Government bursaries for citizen students. From the 2026 academic year, households earning up to $12,000 a month, or $3,000 per person, qualify, with more for lower incomes.", url="https://www.moe.gov.sg/news/edtalks/worried-about-the-cost-of-higher-education-in-singapore-read-this"),
    dict(name="Higher Education Student Loan", cat="loan", level="Polytechnic and university", what="From 1 July 2026 this single government loan replaces the Tuition Fee Loan and Study Loan. It is interest free while you study, with interest starting after you graduate or leave. Apply on the StudentLoanSG portal.", url="https://www.moe.gov.sg/financial-matters/government-loan-scheme/higher-education-student-loan"),
    dict(name="CPF Education Loan Scheme", cat="loan", level="Polytechnic and university", what="Use your own or your parents' CPF Ordinary Account savings to pay subsidised tuition fees, repaid with interest after graduation.", url="https://www.cpf.gov.sg/member/education-loan-scheme"),
    dict(name="Post-Secondary Education Account", cat="saving", level="After secondary school", what="Leftover Edusave and Child Development Account money moves here and can pay post secondary fees.", url="https://www.moe.gov.sg/financial-matters/psea/how-to-use"),
  ]),
)

# ---------------------------------------------------------------- UAE
GUIDES['AE'] = dict(
  insurance=dict(
    intro="Health insurance from your employer is compulsory, and unemployment insurance is compulsory for most employees. Life cover matters especially for expatriates, because a family's residence often depends on the earner.",
    public=[
      dict(name="Compulsory health insurance", what="Since 1 January 2025 employers in every emirate must buy health insurance for private sector employees and domestic workers when issuing or renewing a residence permit; the basic federal plan costs AED 320 a year. In Abu Dhabi and Dubai, sponsors must also insure their dependants.", url="https://u.ae/en/information-and-services/health-and-fitness/getting-a-health-insurance"),
      dict(name="Involuntary Loss of Employment insurance", what="Compulsory unemployment insurance for private sector and federal government employees, costing at most AED 5 a month (basic salary up to AED 16,000) or AED 10. After 12 continuous months of subscription it pays 60% of basic salary for up to three months, capped at AED 10,000 or AED 20,000 a month, if you lose your job for reasons other than discipline or resignation. Not subscribing costs a AED 400 fine.", url="https://u.ae/en/information-and-services/jobs/Workplace-regulations/insurance/unemployment-insurance-scheme"),
      dict(name="Thiqa", what="Full health cover for UAE nationals from Abu Dhabi, with cover in the Abu Dhabi public network for nationals from other emirates and some dependants of nationals.", url="https://www.thiqa.ae/eligibility/"),
      dict(name="End of service gratuity", what="Not insurance, but a lump sum your employer owes when you leave after a year or more: 21 days of basic pay per year for the first five years, then 30 days, capped at two years' pay (Article 51 of Federal Decree Law 33 of 2021).", url="https://u.ae/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector"),
    ],
    health="Check what your employer plan covers for outpatient care, maternity, dental and treatment outside the UAE, and whether your family is included. Top up gaps with a family plan, and keep cover continuous so new waiting periods do not start.",
    disability="Disability income cover",
    disabilityNote="Few employers provide it. A lump sum permanent disability benefit attached to life cover is more common.",
    lifeNote="Group life from your employer stops when the job ends, which may also end your family's visa, so own cover matters more here.",
    types=[
      dict(label="Family health top up", what="Covers family members and anything your employer plan leaves out, such as maternity or treatment abroad.",
           pros=["Keeps the family covered between jobs", "Choice of network and higher limits", "Can include treatment in your home country"],
           cons=["Premiums rise with age", "Pre existing conditions may have waiting periods", "Overlaps with employer cover if not checked"]),
      dict(label="Term life insurance", what="A lump sum to your family if you die during the term, wherever they live.",
           pros=["Pays out even if the family leaves the UAE", "Low cost for large sums", "Can be in a currency of your choice"],
           cons=["No value at the end", "Check that the insurer pays claims worldwide", "Medical tests for large amounts"]),
      dict(label="Critical illness", what="A lump sum on diagnosis of a covered serious illness.",
           pros=["Funds treatment choices and time off", "Paid regardless of employment", "Often added to life cover"],
           cons=["Only listed illnesses", "Can be costly", "Strict definitions"]),
      dict(label="Repatriation and expatriate cover", what="Covers moving a person or remains home, and medical evacuation.",
           pros=["Avoids large one off costs", "Cheap add on", "Peace of mind for families abroad"],
           cons=["Often already in other policies", "Limited use", "Terms vary widely"]),
    ],
  ),
  schemes=[
    dict(group="Savings and end of service", items=[
      dict(name="End of service gratuity", what="21 days of basic pay per year for the first five years and 30 days after, capped at two years' pay. Use the gratuity calculator to estimate yours.", url="https://u.ae/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector"),
      dict(name="Voluntary savings scheme for end of service benefits", what="A voluntary scheme where employers pay end of service benefits into an approved investment fund during your employment instead of one lump sum at the end, while keeping your Labour Law entitlement.", url="https://mohre.gov.ae/en/guidance-and-awareness-portal-new/alternative-end-of-service-benefits-system"),
      dict(name="DIFC Employee Workplace Savings", what="In the DIFC free zone, end of service benefits are paid into DEWS, a funded workplace savings plan, instead of building up as an unfunded gratuity.", url="https://www.difc.com/business/qualifying-schemes"),
      dict(name="Pension for UAE nationals", what="Emirati employees in the public and private sectors must be registered for a pension with GPSSA or their emirate's pension fund.", url="https://u.ae/en/information-and-services/jobs/Sector-of-employment/working-in-uae-government-sector/pensions-and-social-security-for-uae-citizens"),
    ]),
    dict(group="Work and income support", items=[
      dict(name="Unemployment insurance (ILOE)", what="Subscribe through the ILOE portal, your bank's app or kiosks: AED 5 a month if your basic salary is up to AED 16,000, AED 10 above that.", url="https://www.iloe.ae/"),
      dict(name="Wage Protection System", what="Private sector salaries must be paid through the WPS, so late or missing pay is visible to MOHRE.", url="https://www.mohre.gov.ae/en/guidance-and-awareness-portal-new/wages-protection-system"),
      dict(name="Nafis", what="The federal programme supporting UAE nationals who work in the private sector, with financial support and training.", url="https://nafis.gov.ae/"),
      dict(name="Social support for UAE nationals", what="Federal social welfare programmes for Emirati families on low income.", url="https://u.ae/en/information-and-services/social-affairs/social-welfare/social-welfare-programmes"),
    ]),
    dict(group="Housing", items=[
      dict(name="Sheikh Zayed Housing Programme", what="Interest free housing loans over up to 25 years and grants for UAE nationals on low incomes, now run by the Ministry of Energy and Infrastructure. Abu Dhabi nationals apply to the Abu Dhabi Housing Authority.", url="https://u.ae/en/information-and-services/housing/housing-authorities-and-programmes"),
      dict(name="Mohammed Bin Rashid Housing Establishment", what="Residential plots, ready homes, housing loans and home extensions for UAE nationals in Dubai.", url="https://www.mbrhe.gov.ae/en/AboutUs/Pages/FAQs.aspx"),
    ]),
  ],
  students=dict(intro="Public schooling and federal universities are free for UAE nationals. Residents rely mostly on university scholarships and merit awards.", items=[
    dict(name="Higher education scholarships for UAE nationals", cat="grant", level="University", what="The Ministry of Higher Education and Scientific Research sponsors study abroad at bachelor's, master's and PhD level at approved top universities and majors.", url="https://www.mohesr.gov.ae/En/EServices/ServiceCard/pages/scholarships.aspx"),
    dict(name="Golden Visa for outstanding students", cat="merit", level="School and university", what="Outstanding secondary school students can apply for a 5 year Golden Visa and top university students for a 10 year one, with certificates of excellence and a recommendation letter. Golden Visa holders can sponsor their spouse and children.", url="https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa"),
    dict(name="University merit scholarships", cat="search", level="University", what="Most universities in the UAE offer merit and need based tuition discounts to residents. Check each university's admissions page.", url="https://u.ae/en/information-and-services/education/higher-education/About-Higher-education-in-the-UAE"),
  ]),
)

# ---------------------------------------------------------------- New Zealand
GUIDES['NZ'] = dict(
  insurance=dict(
    intro="Public hospitals are free and ACC covers accidents for everyone, so the big gaps are illness that stops you working and faster private treatment.",
    public=[
      dict(name="Public health system", what="Free public hospital care for eligible residents, and subsidised GP visits and prescriptions.", url="https://www.health.govt.nz/"),
      dict(name="ACC", what="No fault cover for injuries from accidents, for everyone in New Zealand. If an injury stops you working, weekly compensation pays up to 80% of your earnings, usually from day 8 after the injury.", url="https://www.acc.co.nz/im-injured/financial-support/weekly-compensation"),
      dict(name="Health and disability support from MSD", what="Jobseeker Support with a health condition, and Supported Living Payment if you cannot work long term.", url="https://www.workandincome.govt.nz/products/a-z-benefits/index.html"),
    ],
    health="Public care covers emergencies and serious illness, but waits for planned surgery can be long. Private health insurance buys faster specialist and surgical care. Because ACC already covers accidents, choose income cover that focuses on illness.",
    disability="Income protection",
    disabilityNote="Pays up to about 75% of income if illness stops you working. ACC already covers injury, so look at cheaper illness focused policies.",
    lifeNote="Life cover through work, where it exists, ends when you leave.",
    types=[
      dict(label="Private health insurance", what="Pays for private specialists and surgery, avoiding public waiting lists.",
           pros=["Faster treatment for planned surgery", "Choice of specialist", "Often offered by employers"],
           cons=["Premiums rise with age", "Pre existing conditions often excluded", "Does not replace income"]),
      dict(label="Life insurance", what="A lump sum to your family if you die.",
           pros=["Clears the mortgage", "Protects dependants", "Cheap when young"],
           cons=["Premiums usually rise each year on stepped policies", "No value if you outlive it", "Needs reviewing as debts change"]),
      dict(label="Income protection", what="Monthly income while illness stops you working.",
           pros=["Fills the gap ACC leaves for illness", "Premiums are generally tax deductible", "Can pay until 65"],
           cons=["Benefit is offset against ACC payments", "Waiting periods apply", "Self employed income can be hard to prove"]),
      dict(label="Trauma insurance", what="A lump sum on diagnosis of a listed serious illness.",
           pros=["Money for recovery and treatment", "Paid regardless of work", "Can be standalone or with life cover"],
           cons=["Only listed conditions", "More expensive than life cover", "Definitions matter"]),
      dict(label="Mortgage protection", what="Covers mortgage repayments if you cannot work.",
           pros=["Keeps the home safe", "Simple to size", "Often cheaper than full income cover"],
           cons=["Pays only the mortgage", "Usually short benefit periods", "Overlaps with income protection"]),
    ],
  ),
  schemes=[
    dict(group="Savings and retirement", items=[
      dict(name="KiwiSaver", what="Workplace retirement savings. The default rate rose to 3.5% for employees and employers on 1 April 2026 and rises to 4% on 1 April 2028. The government adds 25 cents for each dollar you contribute, up to $260.72 a year, unless your taxable income is over $180,000.", url="https://www.ird.govt.nz/kiwisaver-changes"),
      dict(name="KiwiSaver first home withdrawal", what="After three years in KiwiSaver you can usually withdraw all but $1,000 of your balance to buy a first home, if your fund allows it.", url="https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/kiwisaver-benefits"),
      dict(name="NZ Superannuation", what="A universal pension from 65 for people who meet residence rules, not means tested.", url="https://www.workandincome.govt.nz/eligibility/seniors/superannuation/"),
    ]),
    dict(group="Family and income support", items=[
      dict(name="Working for Families", what="Tax credits for families with children, including Family Tax Credit, In-Work Tax Credit and Best Start for babies.", url="https://www.ird.govt.nz/working-for-families"),
      dict(name="FamilyBoost", what="Get back up to 40% of early childhood education fees, up to $1,560 a quarter, if your household income is under about $57,000 a quarter. Claim every quarter.", url="https://www.ird.govt.nz/familyboost/can-you-get-familyboost/how-much-familyboost-are-you-eligible-for"),
      dict(name="Paid parental leave", what="Up to 26 weeks of government funded payments for eligible parents, matching your usual pay up to a weekly maximum.", url="https://www.ird.govt.nz/paid-parental-leave/overview"),
      dict(name="Accommodation Supplement", what="Help with rent, board or home ownership costs for people on lower incomes.", url="https://www.workandincome.govt.nz/products/a-z-benefits/accommodation-supplement.html"),
      dict(name="Check what you might get", what="Work and Income's online tool shows payments you may qualify for.", url="https://check.msd.govt.nz/"),
    ]),
    dict(group="Buying a home", items=[
      dict(name="First Home Loan", what="Loans with a deposit from 5% through participating lenders, underwritten by Kāinga Ora, for eligible first home buyers.", url="https://kaingaora.govt.nz/en_NZ/home-ownership/"),
    ]),
  ],
  students=dict(intro="StudyLink handles student loans and allowances; fees free support now applies to the final year of study.", items=[
    dict(name="Student Loan", cat="loan", level="Tertiary", what="Covers fees, course related costs and living costs. It is interest free while you live in New Zealand, and repaid through PAYE once you earn above the threshold.", url="https://www.studylink.govt.nz/products/a-z-products/student-loan/index.html"),
    dict(name="Student Allowance", cat="grant", level="Tertiary", what="A weekly payment for living costs that you do not repay, based on your or your parents' income.", url="https://www.workandincome.govt.nz/products/a-z-benefits/student-allowance.html"),
    dict(name="Fees free final year", cat="grant", level="Tertiary", what="Learners who first started tertiary study from 1 January 2025 and finish their final year by the end of 2026 can get up to $12,000 of final year fees back, paid to their student loan first.", url="https://www.tec.govt.nz/funding/fund-finder/final-year-fees-free"),
    dict(name="Māori and Pasifika Trades Training", cat="grant", level="Trades", what="Free trades training with support and job placement for Māori and Pasifika learners.", url="https://www.tec.govt.nz/funding/funding-and-performance/funding/fund-finder/maori-and-pasifika-trades-training/"),
    dict(name="Scholarships search", cat="search", level="All levels", what="Careers NZ lists scholarships, including for Māori and Pacific learners; universities list their own too.", url="https://www.careers.govt.nz/courses/scholarships/scholarships-for-maori-learners/"),
  ]),
)
