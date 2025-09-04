  export const modules = [
    {
      title: "IFRS 17 Fundamentals",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
      questions: [
        {
          question: "What is the primary objective of IFRS 17?",
          options: [
            "To standardize insurance accounting globally",
            "To replace IFRS 16",
            "To define financial instruments",
            "To measure investment property"
          ],
          correct: 0,
          explanation: "IFRS 17 aims to create a consistent accounting framework for insurance contracts to improve transparency and comparability."
        },
        {
            question: "What does IFRS 17 replace?",
            options: ["IAS 37", "IFRS 4", "IFRS 9", "IAS 40"],
            correct: 1,
            explanation:
            "IFRS 17 replaced IFRS 4, which was an interim standard."
        },
        {
            question: "What was the official date of initial application for IFRS 17?",
            options: [
            "1st January 2022",
            "31st December 2022",
            "1st January 2023",
            "1st January 2021"
            ],
            correct: 2,
            explanation:
            "The initial application date for IFRS 17 was 1st January 2023."
        },
      {
        question: "What does IFRS 17 apply to?",
        options: [
          "All insurance entities only",
          "Any entity issuing insurance contracts",
          "Reinsurers only",
          "Investment banks only"
        ],
        correct: 1,
        explanation:
          "This reflects IFRS 17's scope, which applies to any entity that issues insurance contracts."
      }, 
      {
        question: "How does IFRS 17 define an insurance contract?",
        options: [
          "Contract transferring insurance risk",
          "Contract transferring investment risk",
          "Contract transferring liquidity risk",
          "Contract for investment advice"
        ],
        correct: 0,
        explanation:
          "This captures the essential element of IFRS 17: transferring insurance risk from policyholder to insurer."
      },   
      {
        question: "How does IFRS 17 define 'insurance risk'?",
        options: [
          "The risk of policyholder default",
          "The risk of future investment losses",
          "The risk transferred from the policyholder to the insurer due to uncertain future events",
          "Exchange rate risk"
        ],
        correct: 2,
        explanation:
          "Insurance risk under IFRS 17 involves uncertainty about future events that may trigger insurer payment."
      },    
      {
        question: "Which of the following contracts falls under the scope of IFRS 17?",
        options: [
          "Product warranty issued by a retailer",
          "Lease contract under IFRS 16",
          "Financial guarantee contract under IFRS 9",
          "Reinsurance contract held by an insurer"
        ],
        correct: 3,
        explanation:
          "Reinsurance contracts held are explicitly included under IFRS 17's scope."
      },
      {
        question: "Which contracts are only within IFRS 17 if the issuer also issues insurance contracts?",
        options: [
          "Leases",
          "Derivatives",
          "Term Deposits",
          "Investment contracts with discretionary participation features"
        ],
        correct: 3,
        explanation:
          "These contracts are only within the scope of IFRS 17 if issued by entities that also issue insurance contracts."
      },
      {
        question: "Are product warranties issued by a retailer within IFRS 17?",
        options: [
          "Yes, always",
          "No, they fall under IAS 37",
          "Only for 12-month terms",
          "Yes, if embedded in insurance"
        ],
        correct: 1,
        explanation:
          "Retail product warranties are covered by IAS 37, not IFRS 17."
      },
      {
        question: "What type of contract is explicitly excluded from IFRS 17 scope?",
        options: [
          "Group life insurance",
          "Reinsurance contracts",
          "Insurance-linked investments",
          "Financial guarantees (under IFRS 9)"
        ],
        correct: 3,
        explanation:
          "Financial guarantee contracts are usually treated under IFRS 9 unless specifically designated as insurance."
      }
      ]
    },
    {
    title: "Combination & Separation of Insurance Contracts",
    icon: "🎯",
    color: "from-purple-500 to-purple-600",
    questions: [
        {
        question: "Which contracts are within the scope of IFRS 17?",
        options: [
            "Only life insurance contracts",
            "Only property and casualty insurance",
            "Insurance contracts, reinsurance contracts, and investment contracts with DPF",
            "Banking products only"
        ],
        correct: 2,
        explanation:
            "IFRS 17 covers insurance contracts issued, reinsurance held, and investment contracts with discretionary participation features."
        },
        {
        question: "When should an insurance contract be recognized?",
        options: [
            "When the contract is signed",
            "At the beginning of coverage period, when first payment is due, or when onerous",
            "Only when claims are made",
            "At the end of the coverage period"
        ],
        correct: 1,
        explanation:
            "Recognition occurs at the earliest of: coverage beginning, first payment due, or when a group becomes onerous."
        },
        {
        question: "What is a 'portfolio' under IFRS 17?",
        options: [
            "All contracts in the company",
            "Contracts subject to similar risks and managed together",
            "Only profitable contracts",
            "Contracts from the same year"
        ],
        correct: 1,
        explanation:
            "A portfolio comprises contracts with similar risks that are managed together."
        },
        {
        question:
            "An insurer enters into two separate contracts with the same policyholder at the same time. Contract A provides insurance coverage, while Contract B negates the financial exposure of Contract A entirely. According to IFRS 17, how should the insurer report these contracts?",
        options: [
            "Treat the contracts as a single arrangement because they achieve an overall commercial effect",
            "Report both contracts separately as independent arrangements",
            "Recognize only Contract A since it was issued first",
            "Disclose both contracts but report them under IFRS 9"
        ],
        correct: 0,
        explanation:
            "When contracts are designed to achieve an overall commercial effect (such as one negating the obligations of another), IFRS 17 requires treating them as a single arrangement to reflect the economic substance."
        },
        {
        question:
            "An insurer bundles multiple policies for a corporate client into a package with interdependent pricing. Some policies provide coverage, while others hedge specific risks associated with the insured entity. Under IFRS 17, how should these contracts be accounted for?",
        options: [
            "Each contract must be evaluated individually regardless of interdependencies",
            "The bundled contracts should be treated as a single unit if they collectively achieve an overall commercial effect",
            "Contracts should be separated since they have different durations",
            "Each contract should be reported based on legal form rather than economic substance"
        ],
        correct: 1,
        explanation:
            "IFRS 17 mandates that contracts designed to work together as a package with shared pricing or risk mitigation should be combined to reflect their true economic impact."
        },
        {
        question: "Which of the following scenarios would not require the combination of contracts under IFRS 17?",
        options: [
            "Two insurance contracts issued simultaneously to the same policyholder, with pricing designed to work together",
            "A reinsurance contract that fully offsets the risk of an insurance policy issued by the same insurer",
            "An insurance contract and an investment product sold separately with no dependency in pricing or risk",
            "A life insurance contract and a rider that cancels all coverage in the main policy"
        ],
        correct: 2,
        explanation:
            "If contracts have no interdependent pricing or risk structure, they do not need to be combined under IFRS 17. Separation is appropriate in such cases."
        },
        {
        question:
            "A life insurer offers a package where a main policy includes both insurance coverage and an investment component. The investment feature provides financial returns that could exist independently without the insurance portion. How should the insurer treat this arrangement under IFRS 17?",
        options: [
            "Recognize it as a single insurance contract",
            "Treat the entire contract under IFRS 9",
            "Combine the investment component only if it exceeds 50% of total premiums",
            "Separate the investment component if it can be sold independently"
        ],
        correct: 3,
        explanation:
            "IFRS 17 requires separating investment components if they can function independently, ensuring accurate financial reporting."
        },
        {
        question:
            "An insurer issues two separate policies to the same corporate client—one covering property damage and another covering business interruption losses linked to that property. The premiums are interdependent and structured as a bundle to provide a cohesive risk solution. What is the appropriate IFRS 17 treatment?",
        options: [
            "The contracts should always be separated",
            "The contracts should be combined if pricing is interdependent",
            "The contracts must be accounted for under IFRS 9",
            "The contracts should be combined only if policyholders request it"
        ],
        correct: 1,
        explanation:
            "IFRS 17 requires combining contracts that are designed to function together commercially, particularly if pricing reflects mutual risk dependencies."
        }
    ]
    },
    {
    title: "Level of Aggregation",
    icon: "📊",
    color: "from-green-500 to-green-600",
    questions: [
        {
        question: "What is the main purpose of aggregation under IFRS 17?",
        options: [
            "To reduce the number of contracts reported",
            "To ensure accurate timing of profit and loss recognition",
            "To make contract management easier",
            "To avoid having to assess individual contracts"
        ],
        correct: 1,
        explanation:
            "Aggregation helps ensure that profits and losses are recognized accurately and consistently in financial reporting."
        },
        {
        question: "Under IFRS 17, contracts grouped into the same portfolio must share:",
        options: [
            "The same inception date",
            "The same profit margin",
            "The same policyholder",
            "Similar risk characteristics and management structure"
        ],
        correct: 3,
        explanation:
            "Portfolios are formed based on risk similarity and being managed together."
        },
        {
        question: "How far apart can contract issuance dates be within the same group?",
        options: [
            "Any number of years",
            "Two years",
            "Not more than one year",
            "Three years if risk is similar"
        ],
        correct: 2,
        explanation:
            "IFRS 17 requires that all contracts in a group are issued no more than one year apart."
        },
        {
        question: "What is the first step in the aggregation process under IFRS 17?",
        options: [
            "Grouping by issuance year",
            "Subdividing portfolios",
            "Grouping by portfolio",
            "Assessing profitability"
        ],
        correct: 2,
        explanation:
            "Aggregation begins by forming portfolios based on similar risks and management structures."
        },
        {
        question:
            "Under IFRS 17, why are insurers not allowed to reassess contract groups after initial recognition?",
        options: [
            "To maintain consistency and transparency in reporting",
            "To reduce workload",
            "To allow for more flexibility later",
            "Because contracts cannot change after issuance"
        ],
        correct: 0,
        explanation:
            "Fixing the groupings at initial recognition supports consistent, unbiased financial reporting over time."
        },
        {
        question:
            "How does IFRS 17 recommend handling groups of contracts under the Premium Allocation Approach (PAA)?",
        options: [
            "Assume they are always profitable",
            "Assume all contracts are onerous",
            "Group them based on product type only",
            "Assume none are onerous at initial recognition unless facts suggest otherwise"
        ],
        correct: 3,
        explanation:
            "IFRS 17 allows insurers applying the PAA to assume contracts are not onerous at initial recognition, unless evidence indicates otherwise."
        },
        {
        question:
            "What additional check must be done for policies eligible for the General Measurement Model (GMM)?",
        options: [
            "Verification of market premium rates",
            "Sensitivity testing and internal report reviews",
            "Reinsurance matching",
            "Underwriter interviews"
        ],
        correct: 1,
        explanation:
            "Sensitivity testing and internal reporting are used to confirm profitability assumptions for GMM-eligible contracts."
        },
        {
        question: "Which of the following best describes a 'portfolio' under IFRS 17?",
        options: [
            "A collection of policies sold by one agent",
            "Contracts grouped based on risk and management similarity",
            "Contracts grouped by coverage period",
            "All insurance contracts issued in one year"
        ],
        correct: 1,
        explanation:
            "A portfolio consists of contracts that have similar risk characteristics and are managed together."
        },
        {
        question:
            "What should an entity use to assess whether a contract might become onerous later?",
        options: [
            "Market interest rates",
            "Past claims history only",
            "Likelihood of changes in applicable facts and circumstances",
            "Broker recommendations"
        ],
        correct: 2,
        explanation:
            "Entities must consider whether new or changing circumstances might render a contract onerous in the future."
        },
        {
        question:
            "What happens if a contract becomes onerous after initial recognition?",
        options: [
            "The group composition remains unchanged",
            "It is moved to the 'onerous' group retroactively",
            "The contract is cancelled",
            "A new group is created"
        ],
        correct: 0,
        explanation:
            "Group compositions are fixed at initial recognition, even if a contract’s status changes later."
        }
    ]
    },
    {
    title: "Recognition of Insurance Contracts",
    icon: "📏",
    color: "from-red-500 to-red-600",
    questions: [
        {
        question: "When must a group of insurance contracts be recognized under IFRS 17?",
        options: [
            "At the end of the reporting period",
            "When the last payment is received",
            "When the policyholder signs the contract",
            "At the earliest of the coverage period start, first payment due, or when the group becomes onerous"
        ],
        correct: 3,
        explanation:
            "IFRS 17 requires recognition at the earliest of these three trigger events."
        },
        {
        question: "If there is no contractual due date for the first payment, when is it considered due?",
        options: [
            "At the end of the month",
            "When it is received",
            "After coverage starts",
            "When billed"
        ],
        correct: 1,
        explanation:
            "IFRS 17 states that if no due date is set, the payment is considered due when received."
        },
        {
        question: "When should an insurer assess if a contract is onerous?",
        options: [
            "After recognition",
            "Before the earlier of coverage start or payment due",
            "At the end of the financial year",
            "Only when a loss is reported"
        ],
        correct: 1,
        explanation:
            "The standard requires a pre-recognition assessment if there's an indication of onerousness."
        },
        {
        question: "What is the treatment if IACFs are not immediately expensed?",
        options: [
            "They are recognized as an asset or liability",
            "They are deferred revenue",
            "They are added to the CSM",
            "They are amortized over the contract term"
        ],
        correct: 0,
        explanation: "IACFs are treated separately until the related group is recognized."
        },
        {
        question: "When is the acquisition asset or liability removed from the books?",
        options: [
            "When the last premium is received",
            "When the policyholder cancels",
            "When the related group of contracts is recognized",
            "At the year-end"
        ],
        correct: 2,
        explanation:
            "The asset or liability is derecognized at the point of group recognition."
        },
        {
        question: "What is the condition for including a contract in a group?",
        options: [
            "It must be active",
            "It must be issued by the end of the reporting period",
            "It must be profitable",
            "It must be short-term"
        ],
        correct: 1,
        explanation:
            "Only contracts issued by the end of the reporting period are included."
        },
        {
        question: "What happens if new contracts added to a group affect the discount rate?",
        options: [
            "The rate must be updated and applied from the start of the reporting period",
            "Nothing changes",
            "It only applies to new contracts",
            "The group must be split"
        ],
        correct: 0,
        explanation:
            "The standard requires adjusting the initial discount rate retroactively to the start of the reporting period."
        },
        {
        question: "Which of the following is TRUE regarding onerous contracts?",
        options: [
            "They must be recognized immediately",
            "They are ignored under IFRS 17",
            "They are grouped with profitable contracts",
            "They are only assessed annually"
        ],
        correct: 0,
        explanation:
            "Onerous groups must be recognized as soon as they become onerous."
        },
        {
        question: "How often can the discount rate be changed for a group?",
        options: [
            "Monthly",
            "Only if new contracts are added that change it",
            "Once a year",
            "Never"
        ],
        correct: 1,
        explanation:
            "The rate is updated only if new contracts added after the reporting period affect it."
        },
        {
        question: "Why is the initial recognition timing important under IFRS 17?",
        options: [
            "It helps identify reinsurers",
            "It is used to calculate tax",
            "It helps with customer satisfaction",
            "It determines when revenue and expenses are recorded"
        ],
        correct: 3,
        explanation:
            "Proper timing ensures that revenue, risk, and costs are reported accurately."
        }
    ]
    },    
    {
    title: "Measurement on Initial Recognition",
    icon: "🔒",
    color: "from-yellow-500 to-yellow-600",
    questions: [
        {
        question: "Which of the following is NOT a component of fulfilment cash flows?",
        options: [
            "Future cash flows",
            "Discount rate",
            "Risk adjustment",
            "Insurance acquisition commission bonus pool"
        ],
        correct: 3,
        explanation:
            "The bonus pool is not part of fulfilment cash flows. The correct components are expected cash flows, discounting, and risk adjustment."
        },
        {
        question: "Which cash flows should be included in the measurement of the contract at initial recognition?",
        options: [
            "Past claims only",
            "Cash flows related to investment returns",
            "Future premiums and claim payments",
            "Marketing expenses"
        ],
        correct: 2,
        explanation:
            "Fulfilment cash flows include expected future premiums and claims."
        },
        {
        question: "If the fulfilment cash flows are negative, what does IFRS 17 require?",
        options: [
            "Defer the difference",
            "Recognize a loss immediately",
            "Recognize a CSM",
            "Reduce the asset balance"
        ],
        correct: 1,
        explanation:
            "Negative fulfilment cash flows indicate an onerous contract; a loss is recognized in profit or loss."
        },
        {
        question: "What happens to a day-1 gain under IFRS 17?",
        options: [
            "Deferred in CSM",
            "Recognized as revenue",
            "Transferred to retained earnings",
            "Recorded as OCI"
        ],
        correct: 0,
        explanation:
            "CSM defers day-1 gains and recognizes them over the service period."
        },
        {
        question: "Why is discounting applied to future cash flows?",
        options: [
            "To increase liabilities",
            "To reflect time value of money",
            "To reduce reporting volatility",
            "To comply with IFRS 9"
        ],
        correct: 1,
        explanation:
            "Discounting ensures that future cash flows are presented in today’s money, reflecting the time value of money."
        },
        {
        question: "Which discount rate is used for initial measurement?",
        options: [
            "Zero-coupon rate",
            "Locked-in discount rate",
            "Market average rate",
            "Prime lending rate"
        ],
        correct: 1,
        explanation:
            "The locked-in rate at initial recognition is used to discount fulfilment cash flows and accrete CSM."
        },
        {
        question: "Which cost is not included in initial measurement?",
        options: [
            "Direct acquisition costs",
            "Expected claims",
            "Indirect administrative costs",
            "Risk adjustment"
        ],
        correct: 2,
        explanation:
            "Only directly attributable acquisition costs are included. Indirect costs like general admin are excluded."
        },
        {
        question: "Which cost is typically excluded from fulfilment cash flows?",
        options: [
            "Advertising and marketing",
            "Future claims",
            "Premiums",
            "Claim handling costs"
        ],
        correct: 0,
        explanation:
            "General marketing expenses are not part of fulfilment cash flows under IFRS 17."
        },
        {
        question: "Under which model is no CSM typically recognized?",
        options: [
            "GMM",
            "PAA",
            "VFA",
            "Modified GMM"
        ],
        correct: 1,
        explanation:
            "PAA does not require a CSM unless the contract is deemed onerous."
        },
        {
        question: "Which of the following is a valid reason to apply the Premium Allocation Approach (PAA) at initial recognition?",
        options: [
            "It results in higher revenue.",
            "The contract has a coverage period of more than one year",
            "The simplification does not significantly differ from GMM results",
            "It avoids recognition of acquisition costs"
        ],
        correct: 2,
        explanation:
            "PAA may be used if it would not materially differ from the GMM measurement, especially for short-duration contracts."
        }
    ] 
    }, 
    {
    title: "Subsequent Measurement",
    icon: "🚀",
    color: "from-indigo-500 to-indigo-600",
    questions: [
        {
        question: "What does subsequent measurement refer to under IFRS 17?",
        options: [
            "The reassessment of reinsurance cash flows",
            "The update of contract liabilities after initial recognition",
            "Only the measurement of incurred claims",
            "Determining if premiums are received"
        ],
        correct: 1,
        explanation:
            "Subsequent measurement involves updating the carrying amounts of insurance liabilities after initial recognition."
        },
        {
        question: "An insurance company issues a 4-year term life insurance contract with a total expected Contractual Service Margin (CSM) of $8,000 at initial recognition. The company expects to provide insurance services evenly over the 4 years. How much CSM revenue should be recognized at the end of each year, assuming no changes in estimates or contract modifications?",
        options: [
            "$2,000 per year for 4 years",
            "$0 in year 1 and $8,000 in year 4",
            "$4,000 in the first year and $1,333 in each of the following years",
            "$8,000 immediately at contract inception"
        ],
        correct: 0,
        explanation:
            "Since the insurance company provides services evenly over 4 years, the $8,000 CSM is recognized as $2,000 per year."
        },
        {
        question: "How often are fulfilment cash flows updated?",
        options: [
            "Once a year",
            "Monthly",
            "At each reporting date",
            "Never after initial recognition"
        ],
        correct: 2,
        explanation:
            "Entities must reassess fulfilment cash flows using current estimates at each reporting period."
        },
        {
        question: "How are claims incurred shown in financials?",
        options: [
            "In CSM",
            "In OCI",
            "In fulfilment cash flows",
            "In profit or loss"
        ],
        correct: 3,
        explanation:
            "Claims that relate to past service are recognized in profit or loss."
        },
        {
        question: "Which is a cause of change in risk adjustment?",
        options: [
            "Change in interest rates",
            "Increase in past claims",
            "Changes in uncertainty of future service",
            "Movement in capital reserves"
        ],
        correct: 2,
        explanation:
            "Changes in the level of uncertainty about future cash flows affect the risk adjustment."
        },
        {
        question: "Which changes are excluded from adjusting the CSM?",
        options: [
            "Future service estimates",
            "Time value updates",
            "Risk of lapses",
            "Policyholder behavior assumptions"
        ],
        correct: 1,
        explanation:
            "Changes from the passage of time (interest accretion) affect finance income/expense rather than adjusting the CSM."
        },
        {
        question: "Which of the following affects the Liability for Incurred Claims (LIC)?",
        options: [
            "Future service premiums",
            "Reinsurance commissions",
            "Claims already incurred",
            "Profit emergence"
        ],
        correct: 2,
        explanation:
            "LIC represents obligations from past events (claims already incurred but not yet paid)."
        },
        {
        question: "What does the Liability for Remaining Coverage (LRC) include?",
        options: [
            "CSM + premiums received",
            "Fulfilment cash flows + CSM",
            "Only claims paid",
            "Gross income"
        ],
        correct: 1,
        explanation:
            "LRC comprises fulfilment cash flows related to future coverage and the unearned profit (CSM)."
        },
        {
        question: "What does LIC capture?",
        options: [
            "Claims that may occur in the future",
            "Earned premiums",
            "Deferred acquisition cost",
            "Claims already incurred"
        ],
        correct: 3,
        explanation:
            "LIC reflects the insurer’s obligation for incurred claims not yet settled."
        },
        {
        question: "What role does the risk adjustment play in subsequent measurement?",
        options: [
            "Reduces cash flows",
            "Defers tax",
            "Adjusts for uncertainty in non-financial risks",
            "Ignores future inflation"
        ],
        correct: 2,
        explanation:
            "Risk adjustment captures the uncertainty in future cash flows and is re-measured at each reporting date."
        }
      ] 
    },
    {
    title: "Discounting CSM and Risk Adjustment",
    icon: "🔄",
    color: "from-pink-500 to-pink-600",
    questions: [
        {
        question: "Which of the following is NOT a required characteristic of the discount rate under IFRS 17?",
        options: [
            "Consistency with observable market prices for similar cash flows",
            "Inclusion of illiquidity premiums to reflect insurance contract liquidity",
            "Use of a single fixed discount rate across all types of contracts",
            "Alignment with other assumptions used in valuation to avoid double counting"
        ],
        correct: 2,
        explanation:
            "IFRS 17 does not require or recommend a single fixed discount rate for all contracts. Instead, the discount rate should reflect characteristics like liquidity, inflation, and dependency on underlying items."
        },
        {
        question: "Which of the following is a correct interpretation of IFRS 17's guidance on using market data to determine discount rates?",
        options: [
            "Discount rates must exclude the effect of market variables that do not impact the insurance contract's cash flows.",
            "Observable market prices should always be used, even if they include factors unrelated to insurance contract cash flows.",
            "Market observable discount rates can be used even if they reflect credit risk not relevant to the insurance liability.",
            "Discount rates should reflect all observable market factors regardless of contract characteristics."
        ],
        correct: 0,
        explanation:
            "IFRS 17 requires that discount rates exclude market variables that don’t affect the contract’s cash flows, even if these variables are in observable market prices."
        },
        {
        question: "What is the primary distinction between the bottom-up and top-down approaches for deriving discount rates under IFRS 17?",
        options: [
            "The bottom-up approach starts from asset returns and adjusts for insurance features",
            "The top-down approach uses a risk-free curve and adds risk premiums",
            "The top-down approach always requires matching the exact liquidity of insurance contracts.",
            "The bottom-up approach starts with a liquid risk-free yield curve and adjusts for illiquidity"
        ],
        correct: 3,
        explanation:
            "The bottom-up approach begins with a liquid risk-free yield curve and adjusts it to reflect the liquidity characteristics and other factors relevant to the insurance contracts."
        },
        {
        question: "Which statement is TRUE regarding liquidity adjustments in the top-down approach under IFRS 17?",
        options: [
            "Liquidity differences between the reference assets and insurance contracts must always be adjusted",
            "No liquidity adjustments are allowed under the top-down approach",
            "Adjustments are made only if the reference portfolio’s liquidity differs significantly from that of the insurance contracts",
            "Liquidity risk is already captured in the nominal cash flows, so no adjustments are required"
        ],
        correct: 2,
        explanation:
            "IFRS 17 requires liquidity adjustments under the top-down approach only if the reference portfolio’s liquidity is not sufficiently consistent with that of the insurance contracts."
        },
        {
        question: "When a group of insurance contracts becomes onerous after initial recognition under IFRS 17, what happens to the Contractual Service Margin (CSM)?",
        options: [
            "It is increased to reflect the higher expected losses.",
            "It remains unchanged, as changes are only recognized at initial recognition.",
            "It is set to zero, and a loss component is established to reflect the excess of fulfilment cash flows over the expected inflows.",
            "It is transferred to the Liability for Incurred Claims (LIC)."
        ],
        correct: 2,
        explanation:
            "If a group becomes onerous after initial recognition, IFRS 17 requires setting the CSM to zero and recognizing a loss component."
        },
        {
        question: "Can a loss component (LC) established for an onerous group of contracts under IFRS 17 be reversed in subsequent periods?",
        options: [
            "No, once established, a loss component cannot be reversed.",
            "Yes, but only through adjustments to the Risk Adjustment for non-financial risk.",
            "Only if the contracts are derecognized.",
            "Yes, if future changes in fulfilment cash flows indicate that the group is no longer onerous."
        ],
        correct: 3,
        explanation:
            "Future favorable changes in fulfilment cash flows can indicate that the group is no longer onerous, allowing reversal of the loss component."
        },
        {
        question: "In the context of IFRS 17, what does the Liability for Remaining Coverage (LRC) represent when the Contractual Service Margin (CSM) is nil?",
        options: [
            "The sum of the fulfilment cash flows and the loss component.",
            "Only the present value of future cash flows without any adjustments.",
            "The Liability for Incurred Claims (LIC) only.",
            "The Risk Adjustment for non-financial risk only."
        ],
        correct: 0,
        explanation:
            "When the CSM is zero, the LRC consists of the fulfilment cash flows plus any loss component for onerous contracts."
        },
        {
        question: "Which discount rate is used to accrete interest on the CSM?",
        options: [
            "The risk-free rate at the reporting date",
            "The weighted average discount rate for incurred claims",
            "The current market interest rate for government bonds",
            "The discount rate at initial recognition of the group of contracts"
        ],
        correct: 3,
        explanation:
            "Interest on the CSM is accreted using the locked-in discount rate set at initial recognition of the group."
        },
        {
        question: "Which of the following characteristics would lead to a higher risk adjustment according to IFRS 17 principles?",
        options: [
            "High-frequency, low-severity risks",
            "Short-duration contracts with predictable claims",
            "Risks with narrow probability distributions",
            "Contracts where little is known about emerging experience"
        ],
        correct: 3,
        explanation:
            "Greater uncertainty in emerging experience heightens the need for a larger risk adjustment."
        },
        {
        question: "Which of the following risks is excluded from the IFRS 17 risk adjustment?",
        options: [
            "Lapse risk",
            "Expense risk",
            "Financial risk (e.g. interest rate risk)",
            "Morbidity risk"
        ],
        correct: 2,
        explanation:
            "The risk adjustment covers non-financial risks only. Financial risks are reflected in discount rates or cash flows, not the risk adjustment."
        }
      ]  
    }, 
    {
    title: "Onerous Contracts",
    icon: "⚠️",
    color: "from-orange-500 to-orange-600",
    questions: [
        {
        question: "When is a contract classified as an onerous contract under IFRS 17?",
        options: [
            "When the contract is expected to lapse early",
            "When the contract has no Contractual Service Margin (CSM)",
            "When the contract is expected to incur a loss",
            "When the contract has no insurance risk"
        ],
        correct: 2,
        explanation:
            "An onerous contract is one where fulfilment cash flows exceed expected inflows (premiums), resulting in a loss."
        },
        {
        question: "How is the CSM treated for onerous contracts?",
        options: [
            "Deferred",
            "Reversed",
            "Released to profit",
            "Set to zero"
        ],
        correct: 3,
        explanation:
            "The CSM is set to zero since no future profits are expected."
        },
        {
        question: "Which component is recognized when a group is onerous at initial recognition?",
        options: [
            "Contractual Service Margin",
            "Risk Adjustment",
            "Loss Component",
            "Investment Return"
        ],
        correct: 2,
        explanation:
            "The loss component is set up to represent losses on onerous contracts and is recognized immediately in profit or loss."
        },
        {
        question: "How is the loss component recognized?",
        options: [
            "As an asset",
            "Through OCI",
            "As an adjustment to the CSM",
            "In profit or loss"
        ],
        correct: 3,
        explanation:
            "The loss component is recognized immediately in profit or loss."
        },
        {
        question: "What happens if cash flow estimates improve?",
        options: [
            "Loss component is reversed first",
            "CSM increases",
            "Risk adjustment decreases",
            "Premiums are restated"
        ],
        correct: 0,
        explanation:
            "Improvements first reduce the loss component before adjusting the CSM."
        },
        {
        question: "When is a contract classified as onerous?",
        options: [
            "When risk adjustment is high",
            "When expected profit is low",
            "When fulfilment cash flows exceed premiums",
            "When lapse rate is high"
        ],
        correct: 2,
        explanation:
            "A contract is onerous when the fulfilment cash flows exceed the expected inflows, indicating a net loss."
        },
        {
        question: "What happens to the CSM if a group of contracts becomes onerous after initial recognition?",
        options: [
            "It is increased",
            "It is set to zero and loss is recognized",
            "It is locked in",
            "It is recalculated using old assumptions"
        ],
        correct: 1,
        explanation:
            "If contracts become onerous after initial recognition, the CSM is reduced to zero, and any further loss is recognized in profit or loss."
        },
        {
        question: "Which of the following changes can make a previously profitable contract group onerous?",
        options: [
            "Increase in administrative expenses",
            "Drop in discount rates",
            "Revised premium allocation method",
            "Change in accounting policy"
        ],
        correct: 0,
        explanation:
            "Increases in expected expenses can raise fulfilment cash flows, potentially making the group onerous."
        },
        {
        question: "How does the loss component affect future insurance revenue?",
        options: [
            "No effect",
            "Increases revenue",
            "It reduces future revenue",
            "It replaces CSM in revenue recognition"
        ],
        correct: 3,
        explanation:
            "For onerous groups, the loss component replaces the CSM and is released as insurance revenue as coverage is provided."
        },
        {
        question: "What causes a change in the loss component?",
        options: [
            "Increase in discount rate",
            "Change in reinsurance treaty",
            "Adverse claims development",
            "Policyholder death"
        ],
        correct: 2,
        explanation:
            "Any adverse change in fulfilment cash flows increases the loss component."
        }
    ]
    },
    {
    title: "Premium Allocation Approach",
    icon: "📋",
    color: "from-teal-500 to-teal-600",
    questions: [
        {
        question: "When is an entity allowed to apply the Premium Allocation Approach (PAA)?",
        options: [
            "Only for life insurance contracts",
            "For all investment contracts",
            "If the contract duration is ≤12 months or if results are similar to GMM",
            "For contracts with no risk adjustment"
        ],
        correct: 2,
        explanation: "PAA can be used if the coverage period is 12 months or less, or if using PAA would yield results that are not materially different from the General Measurement Model (GMM)."
        },
        {
        question: "What does the liability for remaining coverage (LRC) under PAA represent?",
        options: [
            "Future claims paid",
            "Present value of premiums",
            "The unearned portion of premiums minus acquisition costs",
            "Incurred claims"
        ],
        correct: 2,
        explanation: "LRC under PAA reflects the simplified unearned premium approach, adjusted for amortized acquisition costs."
        },
        {
        question: "Which of the following requires risk adjustment under PAA?",
        options: [
            "Liability for incurred claims",
            "Acquisition cost asset",
            "Liability for remaining coverage",
            "Premium receivable"
        ],
        correct: 0,
        explanation: "Under PAA, the risk adjustment applies to the liability for incurred claims to account for uncertainty in non-financial risk."
        },
        {
        question: "What happens if the liability for remaining coverage is lower than fulfilment cash flows?",
        options: [
            "Create a contractual service margin",
            "Defer acquisition costs",
            "Recognize a loss",
            "Discount more"
        ],
        correct: 2,
        explanation: "If fulfilment cash flows exceed the liability for remaining coverage, the contract is deemed onerous and the excess is recognized as a loss."
        },
        {
        question: "What are fulfilment cash flows made up of?",
        options: [
            "Future premiums only",
            "Future claims and profits",
            "Expected future inflows and outflows, discounted, plus risk adjustment",
            "Written premium minus expenses"
        ],
        correct: 2,
        explanation: "Fulfilment cash flows reflect the present value of expected future inflows and outflows plus the risk adjustment for non-financial risk."
        },
        {
        question: "How is insurance revenue recognized under PAA?",
        options: [
            "All at inception",
            "When claims are paid",
            "Evenly over the coverage period",
            "At contract expiry"
        ],
        correct: 2,
        explanation: "Under PAA, revenue is typically recognized on a straight-line basis over the coverage period, reflecting insurance services provided."
        },
        {
        question: "Can insurers offset profitable and onerous contracts within a portfolio under PAA?",
        options: [
            "No, grouping rules prevent offsetting",
            "Only with auditor approval",
            "Yes",
            "Only for reinsurance"
        ],
        correct: 0,
        explanation: "IFRS 17 requires separate grouping of onerous and profitable contracts; losses cannot be offset by profitable ones."
        },
        {
        question: "What is a key disclosure requirement under IFRS 17 even when using PAA?",
        options: [
            "No disclosure required",
            "Confidence level of liabilities",
            "Market value of assets",
            "Tax provision for each contract"
        ],
        correct: 1,
        explanation: "Disclosure of the confidence level used to determine the risk adjustment is required, even under the PAA approach."
        },
        {
        question: "Can PAA be used for reinsurance contracts held?",
        options: [
            "Yes, if eligibility criteria are met",
            "No, PAA is only for direct contracts",
            "Yes, but only in life insurance",
            "Only if premiums exceed claims"
        ],
        correct: 0,
        explanation: "PAA can be applied to reinsurance contracts held if the contract meets the same criteria used for direct contracts."
        },
        {
        question: "What happens when acquisition costs are deferred for an onerous group?",
        options: [
            "The loss reduces",
            "It offsets the fulfilment cash flows",
            "It increases the recognized loss",
            "It increases future profits"
        ],
        correct: 2,
        explanation: "Deferring acquisition costs for an onerous group effectively lowers the LRC and can increase the shortfall, leading to a higher loss."
        }
    ]
    },
    {
    title: "Reinsurance Contracts Held",
    icon: "🔀",
    color: "from-cyan-500 to-cyan-600",
    questions: [
        {
        question: "What is a reinsurance contract held under IFRS 17?",
        options: [
            "A contract under which an entity receives compensation for claims from a reinsurer",
            "A contract issued to share profits with partners",
            "Contract issued to insure customers",
            "A contract for investment-linked business"
        ],
        correct: 0,
        explanation:
            "A reinsurance contract held is one where the insurer (cedant) transfers insurance risk and receives compensation from the reinsurer for claims."
        },
        {
        question: "When should a reinsurance contract held be initially recognized?",
        options: [
            "When the reinsurer pays a claim",
            "At the start of the underlying insurance contract",
            "At the earlier of coverage start or when underlying contracts are onerous",
            "At the end of the reporting period"
        ],
        correct: 2,
        explanation:
            "Recognition occurs at the earlier of when reinsurance coverage begins or when the reinsurance covers a recognized loss from onerous contracts."
        },
        {
        question: "Can a gain on purchase of reinsurance be recognized immediately?",
        options: [
            "Yes, it boosts profit",
            "No, it is included in the CSM",
            "Only if the reinsurer agrees",
            "Yes, under PAA"
        ],
        correct: 1,
        explanation:
            "Gains on the purchase of reinsurance are deferred within the Contractual Service Margin (CSM) and recognized over the coverage period."
        },
        {
        question: "Which of the following is NOT included in fulfilment cash flows for reinsurance contracts held?",
        options: [
            "Future claims recoveries",
            "Discounting",
            "Reinsurer’s risk appetite",
            "Risk adjustment"
        ],
        correct: 2,
        explanation:
            "Fulfilment cash flows include expected recoveries, discounting, and risk adjustment—not subjective elements like reinsurer's risk appetite."
        },
        {
        question: "What is the impact of reinsurance on the insurer’s risk exposure?",
        options: [
            "Increases risk",
            "No impact",
            "Transfers and reduces risk",
            "Creates an additional liability"
        ],
        correct: 2,
        explanation:
            "Reinsurance helps the insurer reduce and manage their insurance risk by transferring a portion of it to the reinsurer."
        },
        {
        question: "How are changes in fulfilment cash flows for reinsurance contracts treated?",
        options: [
            "Adjust the CSM or go through P&L",
            "Ignore until contract maturity",
            "Expensed as acquisition costs",
            "Deferred indefinitely"
        ],
        correct: 0,
        explanation:
            "Changes in fulfilment cash flows adjust the CSM if they relate to future services, or are recognized in profit or loss otherwise."
        },
        {
        question: "Under the General Model, what happens to the CSM for reinsurance contracts held over time?",
        options: [
            "It grows with claims paid",
            "It’s released based on services received",
            "It remains constant",
            "It is immediately expensed"
        ],
        correct: 1,
        explanation:
            "The CSM for reinsurance contracts held is released over time based on the receipt of reinsurance services."
        },
        {
        question: "How are reinsurance recoveries presented in the income statement?",
        options: [
            "Included in insurance revenue",
            "Included in investment income",
            "Separately from insurance revenue",
            "Net of insurance service expenses"
        ],
        correct: 2,
        explanation:
            "IFRS 17 requires that reinsurance income and expenses be presented separately from insurance revenue and service expenses."
        },
        {
        question: "How are recoveries for past claims treated under reinsurance contracts held?",
        options: [
            "Deferred in CSM",
            "Expensed as incurred",
            "Recognized in profit or loss immediately",
            "Deducted from LRC"
        ],
        correct: 2,
        explanation:
            "Recoveries for past claims are immediately recognized in profit or loss as they relate to events that have already occurred."
        },
        {
        question: "What is the impact of a reinsurance CSM being negative?",
        options: [
            "It represents a loss",
            "It is a liability",
            "It is not allowed",
            "It’s treated as an asset, not a liability"
        ],
        correct: 3,
        explanation:
            "A negative CSM on a reinsurance contract held represents a net cost to the insurer and is treated as an asset."
        }
    ]
    }
];