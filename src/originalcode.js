import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Lock, CheckCircle, XCircle, TrendingUp, Award } from 'lucide-react';

const IFRS17TrainingGame = () => {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [unlockedModules, setUnlockedModules] = useState([0]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState({ hint: 3, eliminate: 2, skip: 1 });
  const [completedModules, setCompletedModules] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [moduleScore, setModuleScore] = useState(0);
  const [perfectModule, setPerfectModule] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);

  const modules = [
    {
      title: "IFRS 17 Fundamentals",
      icon: "📚",
      color: "from-blue-500 to-blue-600",
      questions: [
        {
          question: "What is the primary objective of IFRS 17?",
          options: [
            "To increase insurance premiums",
            "To reduce regulatory oversight",
            "To simplify tax calculations",
            "To provide transparent and comparable information about insurance contracts"
          ],
          correct: 3,
          explanation: "IFRS 17 aims to ensure consistent, transparent reporting of insurance contracts globally."
        },
        {
          question: "When did IFRS 17 become effective?",
          options: [
            "January 1, 2021",
            "January 1, 2022",
            "January 1, 2023",
            "January 1, 2024"
          ],
          correct: 2,
          explanation: "IFRS 17 became effective on January 1, 2023, replacing IFRS 4."
        },
        {
          question: "Which statement best describes the Building Block Approach (BBA)?",
          options: [
            "The default measurement model with four building blocks",
            "A simplified approach for all contracts",
            "Only for short-term contracts",
            "Exclusively for life insurance"
          ],
          correct: 0,
          explanation: "BBA is the general measurement model using fulfilment cash flows and CSM."
        }
      ]
    },
    {
      title: "Scope & Recognition",
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
          explanation: "IFRS 17 covers insurance contracts issued, reinsurance held, and investment contracts with discretionary participation features."
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
          explanation: "Recognition occurs at the earliest of: coverage beginning, first payment due, or when a group becomes onerous."
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
          explanation: "A portfolio comprises contracts with similar risks that are managed together."
        }
      ]
    },
    {
      title: "Level of Aggregation",
      icon: "📊",
      color: "from-green-500 to-green-600",
      questions: [
        {
          question: "What are the three categories for grouping contracts?",
          options: [
            "Small, medium, large",
            "Onerous, profitable at inception, and remaining contracts",
            "Short-term, medium-term, long-term",
            "Direct, reinsurance, investment"
          ],
          correct: 1,
          explanation: "IFRS 17 requires grouping into: onerous at inception, no significant possibility of becoming onerous, and remaining contracts."
        },
        {
          question: "What is the maximum span of cohorts (annual periods)?",
          options: [
            "6 months",
            "1 year",
            "2 years",
            "5 years"
          ],
          correct: 1,
          explanation: "Groups cannot include contracts issued more than one year apart."
        },
        {
          question: "Can profitable and onerous contracts be grouped together?",
          options: [
            "Yes, always",
            "No, they must be in separate groups",
            "Only for reinsurance",
            "Only for short-term contracts"
          ],
          correct: 1,
          explanation: "Profitable and onerous contracts must be in separate groups to prevent offsetting."
        }
      ]
    },
    {
      title: "Measurement Models",
      icon: "📏",
      color: "from-red-500 to-red-600",
      questions: [
        {
          question: "What does PAA stand for?",
          options: [
            "Premium Allocation Approach",
            "Profit Allocation Approach",
            "Portfolio Aggregation Approach",
            "Periodic Adjustment Approach"
          ],
          correct: 0,
          explanation: "PAA is the Premium Allocation Approach, a simplified model for short-duration contracts."
        },
        {
          question: "When can the Variable Fee Approach (VFA) be used?",
          options: [
            "For all contracts",
            "Only for contracts with direct participation features",
            "For short-term contracts only",
            "For reinsurance contracts"
          ],
          correct: 1,
          explanation: "VFA is used for contracts with direct participation features where policyholders share in investment returns."
        },
        {
          question: "What are the building blocks of the BBA?",
          options: [
            "Premium, claims, expenses, profit",
            "Present value of future cash flows, risk adjustment, CSM, and time value of money",
            "Assets, liabilities, equity, revenue",
            "Gross premium, net premium, claims, reserves"
          ],
          correct: 1,
          explanation: "BBA consists of: fulfilment cash flows (PV + risk adjustment) and contractual service margin."
        }
      ]
    },
    {
      title: "Contract Boundaries",
      icon: "🔒",
      color: "from-yellow-500 to-yellow-600",
      questions: [
        {
          question: "What determines the contract boundary?",
          options: [
            "The contract's legal termination date",
            "When the entity can compel payment or has substantive obligation to provide services",
            "Always one year from inception",
            "The policyholder's retirement age"
          ],
          correct: 1,
          explanation: "Contract boundary exists while the entity can compel payment or has a substantive obligation to provide coverage."
        },
        {
          question: "Are future renewals included within contract boundary?",
          options: [
            "Always included",
            "Never included",
            "Only if entity cannot reprice or reject the risk",
            "Only for life insurance"
          ],
          correct: 2,
          explanation: "Renewals are included only when the insurer cannot reassess risks and reprice accordingly."
        },
        {
          question: "How do contract boundaries affect measurement?",
          options: [
            "They don't affect measurement",
            "They determine which cash flows to include in measurement",
            "They only affect disclosure",
            "They only matter for PAA"
          ],
          correct: 1,
          explanation: "Contract boundaries determine which future cash flows are included in the measurement of insurance contracts."
        }
      ]
    },
    {
      title: "Initial Recognition",
      icon: "🚀",
      color: "from-indigo-500 to-indigo-600",
      questions: [
        {
          question: "What is the Contractual Service Margin (CSM)?",
          options: [
            "The expected loss on a contract",
            "The unearned profit to be recognized over coverage period",
            "The risk adjustment only",
            "The present value of premiums"
          ],
          correct: 1,
          explanation: "CSM represents unearned profit that will be recognized as services are provided."
        },
        {
          question: "What happens if a contract is onerous at initial recognition?",
          options: [
            "CSM is created",
            "Loss is deferred",
            "Loss is recognized immediately in P&L",
            "Contract is cancelled"
          ],
          correct: 2,
          explanation: "For onerous contracts, the loss (negative CSM) is recognized immediately in profit or loss."
        },
        {
          question: "What discount rate should be used for initial measurement?",
          options: [
            "Always risk-free rate",
            "Current rates at initial recognition",
            "Historical average rates",
            "Bank lending rate"
          ],
          correct: 1,
          explanation: "Discount rates at initial recognition reflect the characteristics of the cash flows and market conditions."
        }
      ]
    },
    {
      title: "Subsequent Measurement",
      icon: "🔄",
      color: "from-pink-500 to-pink-600",
      questions: [
        {
          question: "How is CSM adjusted in subsequent periods?",
          options: [
            "It remains constant",
            "Only for interest accretion",
            "For changes in fulfilment cash flows related to future service",
            "It's written off immediately"
          ],
          correct: 2,
          explanation: "CSM is adjusted for changes in estimates of future service, interest accretion, and currency changes."
        },
        {
          question: "What is 'unlocking' the CSM?",
          options: [
            "Releasing all CSM immediately",
            "Adjusting CSM for changes in future service estimates",
            "Converting CSM to cash",
            "Transferring CSM between groups"
          ],
          correct: 1,
          explanation: "Unlocking means adjusting CSM for changes in fulfilment cash flows related to future service."
        },
        {
          question: "How are experience adjustments treated?",
          options: [
            "Always adjust CSM",
            "Current period differences go to P&L immediately",
            "Deferred to future periods",
            "Ignored in measurement"
          ],
          correct: 1,
          explanation: "Experience adjustments (actual vs expected) for current period are recognized in P&L immediately."
        }
      ]
    },
    {
      title: "Onerous Contracts",
      icon: "⚠️",
      color: "from-orange-500 to-orange-600",
      questions: [
        {
          question: "When is a loss component established?",
          options: [
            "When contracts are profitable",
            "When fulfilment cash flows exceed carrying amount",
            "Only at initial recognition",
            "Never under IFRS 17"
          ],
          correct: 1,
          explanation: "A loss component is established when a group becomes onerous (fulfilment cash flows > carrying amount)."
        },
        {
          question: "How are subsequent changes to loss component allocated?",
          options: [
            "All to CSM",
            "Systematically between loss component and LRC excluding loss component",
            "All to P&L",
            "Deferred indefinitely"
          ],
          correct: 1,
          explanation: "Changes are allocated systematically based on the proportion of loss component to total LRC."
        },
        {
          question: "Can a loss component be reversed?",
          options: [
            "Never",
            "Yes, if the contract becomes profitable",
            "Only for reinsurance",
            "Only under PAA"
          ],
          correct: 1,
          explanation: "Loss components can be reversed if favorable changes make the contracts no longer onerous."
        }
      ]
    },
    {
      title: "Presentation & Disclosure",
      icon: "📋",
      color: "from-teal-500 to-teal-600",
      questions: [
        {
          question: "How should insurance revenue be presented?",
          options: [
            "Equal to premiums received",
            "Based on services provided in the period",
            "Only when claims are paid",
            "At contract inception"
          ],
          correct: 1,
          explanation: "Insurance revenue reflects services provided, not cash premiums received."
        },
        {
          question: "What must be separately disclosed on the balance sheet?",
          options: [
            "Only total insurance liabilities",
            "Portfolios in asset positions separately from those in liability positions",
            "Combined with other liabilities",
            "Only profitable contracts"
          ],
          correct: 1,
          explanation: "Portfolios in asset positions must be presented separately from those in liability positions."
        },
        {
          question: "Which reconciliation is required in the notes?",
          options: [
            "Only opening to closing equity",
            "Opening to closing balances of insurance contract liabilities",
            "Only premium reconciliation",
            "No reconciliations required"
          ],
          correct: 1,
          explanation: "Detailed reconciliations from opening to closing balances are required for transparency."
        }
      ]
    },
    {
      title: "Transition Requirements",
      icon: "🔀",
      color: "from-cyan-500 to-cyan-600",
      questions: [
        {
          question: "What are the three transition approaches?",
          options: [
            "Simple, medium, complex",
            "Full retrospective, modified retrospective, fair value",
            "Current value, historical cost, market value",
            "Prospective only"
          ],
          correct: 1,
          explanation: "IFRS 17 allows: full retrospective (if practicable), modified retrospective, or fair value approach."
        },
        {
          question: "When is the fair value approach permitted?",
          options: [
            "Always preferred",
            "When full retrospective is impracticable and for modified retrospective",
            "Never allowed",
            "Only for new contracts"
          ],
          correct: 1,
          explanation: "Fair value approach can be used when full retrospective is impracticable."
        },
        {
          question: "What is the transition CSM under fair value approach?",
          options: [
            "Zero",
            "Historical CSM",
            "Fair value less fulfilment cash flows at transition",
            "Premium received"
          ],
          correct: 2,
          explanation: "Under fair value, CSM equals fair value of contracts less fulfilment cash flows at transition date."
        }
      ]
    }
  ];

  const achievementsList = [
    { id: 1, name: "First Steps", icon: "🎯", condition: (stats) => stats.score >= 10 },
    { id: 2, name: "Quick Learner", icon: "⚡", condition: (stats) => stats.streak >= 3 },
    { id: 3, name: "Module Master", icon: "🏆", condition: (stats) => stats.modulesCompleted >= 1 },
    { id: 4, name: "IFRS Expert", icon: "🎓", condition: (stats) => stats.level >= 5 },
    { id: 5, name: "Perfect Score", icon: "💯", condition: (stats) => stats.perfectModules >= 1 },
    { id: 6, name: "Combo King", icon: "🔥", condition: (stats) => stats.maxCombo >= 5 },
    { id: 7, name: "Knowledge Seeker", icon: "📚", condition: (stats) => stats.modulesCompleted >= 5 },
    { id: 8, name: "Unstoppable", icon: "💪", condition: (stats) => stats.streak >= 10 },
  ]; 

  const handleAnswer = (answerIndex) => {
    const questionKey = `${currentModule}-${currentQuestion}`;
    if (answeredQuestions[questionKey]?.answered) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === modules[currentModule].questions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setAnsweredQuestions({ 
      ...answeredQuestions, 
      [questionKey]: { answered: true, selectedAnswer: answerIndex, wasCorrect: correct } 
    });

    if (correct) {
      const points = 10 * (combo + 1);
      setScore(score + points);
      setModuleScore(moduleScore + points);
      setStreak(streak + 1);
      setCombo(combo + 1);
      setXp(xp + 25);
      
      if ((streak + 1) % 5 === 0) {
        console.log(`🔥 ${streak + 1} STREAK! Keep going!`);
      }
      
      if (combo >= 5) {
        console.log(`💥 MEGA COMBO x${combo + 1}!`);
      }
      
      if (xp + 25 >= level * 100) {
        setLevel(level + 1);
        setXp((xp + 25) % (level * 100));
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 5000);
      }
    } else {
      setStreak(0);
      setCombo(0);
      setPerfectModule(false);
    }

    setTimeout(() => {
      if (currentQuestion < modules[currentModule].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(false);
        setSelectedAnswer(null);
      } else {
        setShowModuleComplete(true);
        setCompletedModules([...completedModules, currentModule]);
        
        if (currentModule < modules.length - 1 && !unlockedModules.includes(currentModule + 1)) {
          setUnlockedModules([...unlockedModules, currentModule + 1]);
        }
      }
    }, 5000);
  };

  const handlePowerUp = (type) => {
    if (powerUps[type] <= 0) return;
    
    setPowerUps({ ...powerUps, [type]: powerUps[type] - 1 });
    
    switch(type) {
      case 'hint':
        break;
      case 'eliminate':
        break;
      case 'skip':
        if (currentQuestion < modules[currentModule].questions.length - 1) {
          const questionKey = `${currentModule}-${currentQuestion}`;
          setAnsweredQuestions({ 
            ...answeredQuestions, 
            [questionKey]: { answered: true, selectedAnswer: null, wasCorrect: false } 
          });
          setCurrentQuestion(currentQuestion + 1);
        }
        break;
      default:
        break;
    }
  };

  const checkAchievementConditions = () => {
    for (const achDef of achievementsList) {
      if (!achievements.find(a => a.id === achDef.id)) {
        const stats = {
          score,
          streak,
          level,
          modulesCompleted: completedModules.length,
          perfectModules: 0,
          maxCombo: combo
        };
        
        if (achDef.condition(stats)) {
          setAchievements(prev => [...prev, achDef]);
          setShowAchievement(achDef);
          setTimeout(() => setShowAchievement(null), 5000);
          break;
        }
      }
    }
  };

  useEffect(() => {
    checkAchievementConditions();
  }, [score, streak, level, combo, completedModules]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-6">
          <img 
            src="/kenbright-logo.png" 
            alt="Kenbright Logo" 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-20 w-auto"
          />
          <h1 className="text-3xl font-bold text-white text-center py-2">IFRS 17 Master: Regulatory Training Game</h1>
        </div>
        
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Score</p>
                <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Zap className="text-orange-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Streak</p>
                <p className="text-2xl font-bold text-white">{streak}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Star className="text-purple-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Level {level}</p>
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-500"
                    style={{ width: `${(xp / (level * 100)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400 w-8 h-8" />
              <div>
                <p className="text-gray-400 text-sm">Combo</p>
                <p className="text-2xl font-bold text-white">x{combo + 1}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            IFRS 17 Training Modules 
            <span className="text-lg font-normal text-gray-300 ml-4">
              ({completedModules.length}/{modules.length} completed)
            </span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {modules.map((module, index) => (
              <button
                key={index}
                onClick={() => {
                  if (unlockedModules.includes(index) && !completedModules.includes(index) && index !== currentModule) {
                    setCurrentModule(index);
                    setCurrentQuestion(0);
                    setModuleScore(0);
                    setPerfectModule(true);
                    setShowFeedback(false);
                    setSelectedAnswer(null);
                  }
                }}
                disabled={!unlockedModules.includes(index) || completedModules.includes(index) || (index === currentModule && !showModuleComplete)}
                className={`relative p-4 rounded-xl transition-all duration-300 ${
                  completedModules.includes(index)
                    ? 'bg-gradient-to-br from-green-600 to-green-700 transform cursor-not-allowed shadow-lg ring-2 ring-green-400'
                    : index === currentModule && !completedModules.includes(index)
                    ? `bg-gradient-to-br ${module.color} transform scale-105 shadow-xl ring-2 ring-purple-400`
                    : unlockedModules.includes(index)
                    ? `bg-gradient-to-br ${module.color} hover:scale-105 transform cursor-pointer shadow-lg`
                    : 'bg-gray-800 opacity-50 cursor-not-allowed'
                }`}
              >
                {completedModules.includes(index) && (
                  <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-white" />
                )}
                {!unlockedModules.includes(index) && (
                  <Lock className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                )}
                <div className="text-3xl mb-2">{module.icon}</div>
                <p className="text-white text-sm font-semibold">{module.title}</p>
                {completedModules.includes(index) && (
                  <p className="text-xs text-green-200 mt-1">Completed!</p>
                )}
                {index === currentModule && !completedModules.includes(index) && (
                  <p className="text-xs text-yellow-200 mt-1">In Progress</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {showAchievement && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-full text-lg font-bold animate-pulse flex items-center gap-3">
              <span className="text-2xl">{showAchievement.icon}</span>
              Achievement Unlocked: {showAchievement.name}!
            </div>
          </div>
        )}

        {showLevelUp && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-purple-600 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
              ⭐ LEVEL UP! Level {level} ⭐
            </div>
          </div>
        )}

        {showModuleComplete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-center transform scale-110 animate-pulse">
              <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">Module Complete! 🎉</h2>
              <p className="text-2xl text-white mb-2">{modules[currentModule].title}</p>
              <p className="text-xl text-yellow-300 mb-4">
                Score: {moduleScore} points
              </p>
              {perfectModule && (
                <p className="text-2xl text-yellow-400 font-bold mb-4 animate-pulse">
                  ⭐ PERFECT MODULE! ⭐
                </p>
              )}
              <p className="text-lg text-white mb-4">
                {currentModule < modules.length - 1 
                  ? "Get ready for the next module..." 
                  : "Congratulations! You've completed all modules!"}
              </p>
              {currentModule < modules.length - 1 ? (
                <button
                  onClick={() => {
                    setCurrentModule(currentModule + 1);
                    setCurrentQuestion(0);
                    setModuleScore(0);
                    setPerfectModule(true);
                    setShowFeedback(false);
                    setSelectedAnswer(null);
                    setShowModuleComplete(false);
                  }}
                  className="mt-4 px-6 py-3 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Start Next Module →
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowModuleComplete(false);
                  }}
                  className="mt-4 px-6 py-3 bg-yellow-400 text-purple-900 rounded-full font-bold hover:bg-yellow-300 transition-all transform hover:scale-105"
                >
                  View Final Results 🏆
                </button>
              )}
            </div>
          </div>
        )}

        {modules[currentModule] && completedModules.length < modules.length && !completedModules.includes(currentModule) && (
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {modules[currentModule].title} - Question {currentQuestion + 1}/{modules[currentModule].questions.length}
                </h3>
                <div className="flex gap-2">
                  {Object.entries(powerUps).map(([type, count]) => (
                    <button
                      key={type}
                      onClick={() => handlePowerUp(type)}
                      disabled={count === 0}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                        count > 0 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {type === 'hint' && '💡'} 
                      {type === 'eliminate' && '🎯'} 
                      {type === 'skip' && '⏭️'} 
                      {count}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / modules[currentModule].questions.length) * 100}%` }}
                />
              </div>
              
              <div className="flex gap-2 justify-center mb-6">
                {modules[currentModule].questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full transition-all ${
                      answeredQuestions[`${currentModule}-${idx}`]?.answered
                        ? answeredQuestions[`${currentModule}-${idx}`]?.wasCorrect ? 'bg-green-400' : 'bg-red-400'
                        : idx === currentQuestion
                        ? 'bg-purple-400 ring-2 ring-purple-300'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-xl text-white mb-6">
                {modules[currentModule].questions[currentQuestion].question}
              </p>
              
              {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && !showFeedback && (
                <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-center">
                    ⚠️ You've already answered this question
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules[currentModule].questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && !answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && handleAnswer(index)}
                  disabled={showFeedback || answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                    answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered
                      ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index
                        ? answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect
                          ? 'bg-green-500/20 border-green-400 text-green-400'
                          : 'bg-red-500/20 border-red-400 text-red-400'
                        : index === modules[currentModule].questions[currentQuestion].correct
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 cursor-not-allowed'
                      : showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'bg-green-500/20 border-green-400 text-green-400'
                        : 'bg-red-500/20 border-red-400 text-red-400'
                      : showFeedback && index === modules[currentModule].questions[currentQuestion].correct
                      ? 'bg-green-500/20 border-green-400 text-green-400'
                      : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                    )}
                    {answeredQuestions[`${currentModule}-${currentQuestion}`]?.answered && (
                      answeredQuestions[`${currentModule}-${currentQuestion}`]?.selectedAnswer === index ? (
                        answeredQuestions[`${currentModule}-${currentQuestion}`]?.wasCorrect ? 
                          <CheckCircle className="w-5 h-5 text-green-400" /> : 
                          <XCircle className="w-5 h-5 text-red-400" />
                      ) : index === modules[currentModule].questions[currentQuestion].correct ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : null
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`mt-6 p-4 rounded-xl ${
                isCorrect ? 'bg-green-500/20 border border-green-400' : 'bg-blue-500/20 border border-blue-400'
              }`}>
                <p className={`${isCorrect ? 'text-green-400' : 'text-blue-400'} font-semibold mb-2`}>
                  {isCorrect ? `🎉 Excellent! +${10 * (combo)} points` : 'Not quite right, but here\'s the explanation:'}
                  {isCorrect && combo >= 3 && ' 🔥 COMBO!'}
                  {isCorrect && streak >= 5 && ' ⚡ STREAK!'}
                </p>
                <p className="text-gray-300">
                  {modules[currentModule].questions[currentQuestion].explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {completedModules.length === modules.length && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 mb-6 border border-yellow-400/50 text-center">
            <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">🎊 Congratulations! 🎊</h2>
            <p className="text-xl text-white mb-2">You've completed all IFRS 17 Training Modules!</p>
            <p className="text-lg text-yellow-300">Final Score: {score.toLocaleString()} points</p>
            <p className="text-lg text-purple-300">Level: {level} | Achievements: {achievements.length}</p>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Achievements Unlocked</h3>
            <div className="flex flex-wrap gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="text-white font-medium">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IFRS17TrainingGame;