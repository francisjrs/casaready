export type Locale = 'en' | 'es';

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: Locale[] = ['en', 'es'];

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<Locale, Translation> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      submit: 'Submit',
      cancel: 'Cancel',
      next: 'Next',
      previous: 'Previous',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      close: 'Close',
      yes: 'Yes',
      no: 'No',
      learnMore: 'Learn More',
      contactUs: 'Contact Us',
      getStarted: 'Get Started'
    },
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      contact: 'Contact',
      language: 'Language',
      buyingProcess: 'Buying Process',
      mortgageCalculator: 'Mortgage Calculator',
      resources: 'Resources',
      testimonials: 'Testimonials'
    },
    wizard: {
      brand: 'CasaReady',
      badge: '🏠 AI-Powered Analysis',
      title: 'Get Your Personalized',
      titleHighlight: 'Home Buying Plan',
      subtitle: 'Answer a few questions about your financial situation and preferences. Our AI will analyze your profile and create a customized roadmap to homeownership.',
      backToHome: '← Back to Home',
      languageToggle: 'EN / ES',
      supportTitle: 'Need help? Our home buying specialists are here to assist you.',
      callUs: 'Call Us: (512) 412-2352',
      textUs: 'Text Us: (512) 412-2352',
      liveChat: 'Live Chat Support',
      page: {
        title: 'Get Your Personalized Home Buying Plan',
        description: 'AI-powered homebuying analysis and personalized roadmap',
        backToHome: '← Back to Home',
        badge: '🏠 AI-Powered Analysis',
        titleHighlight: 'Home Buying Plan',
        subtitle: 'Answer a few questions about your financial situation and preferences. Our AI will analyze your profile and create a customized roadmap to homeownership.',
        supportTitle: 'Need help?',
        callUs: 'Call Us:',
        textUs: 'Text Us:',
        liveChat: 'Live Chat Support'
      },
      progress: {
        title: 'Interactive Home Buying Wizard',
        titleMobile: 'Home Wizard',
        stepNotFound: 'Step not found',
        stepLoadError: 'The requested step could not be loaded',
        stepCounter: 'Step {{current}} of {{total}} steps',
        loadingNextStep: 'Loading next step',
        transitioning: 'Transitioning...',
        progressLabel: 'Progress:',
        percentComplete: '{{percent}}% complete'
      },
      steps: {
        location: {
          header: 'Where do you want to buy?',
          subtitle: 'Help us understand your preferred location and priorities',
          errorTitle: 'Please fix the following:',
          preferredLocationTitle: 'Preferred Location',
          prioritiesTitle: 'What matters most to you?',
          helpText: 'We\'ll use this information to tailor our market analysis',
          fields: {
            city: 'Texas City',
            zipCode: 'ZIP Code',
            cityPlaceholder: 'Enter city name',
            zipPlaceholder: 'Enter ZIP code'
          },
          priorities: {
            schools: 'School Quality',
            commute: 'Commute to Work',
            safety: 'Safety & Crime',
            walkability: 'Walkability',
            shopping: 'Shopping & Dining',
            parks: 'Parks & Recreation',
            nightlife: 'Nightlife & Entertainment',
            diversity: 'Community Diversity'
          },
          censusErrors: {
            notFound: 'Location data not found',
            invalid: 'Invalid location entered',
            apiError: 'Unable to fetch location data'
          }
        },
        timeline: {
          sectionTitle: 'Select Your Timeline',
          urgentBadge: 'Urgent',
          tipTitle: 'Timeline Tip',
          helpText: 'Your timeline affects strategy and loan pre-approval',
          options: {
            '0-3': {
              label: 'Ready to buy (0-3 months)',
              description: 'I\'m pre-approved and ready to start shopping'
            },
            '3-6': {
              label: 'Soon (3-6 months)',
              description: 'Getting my finances ready and exploring options'
            },
            '6-12': {
              label: 'This year (6-12 months)',
              description: 'Planning ahead and preparing for the process'
            },
            '12+': {
              label: 'Next year or later (12+ months)',
              description: 'Early planning and goal setting'
            }
          },
          tips: {
            '0-3': 'Focus on competitive offers and quick decisions. Have all documents ready.',
            '3-6': 'Start pre-approval process and improve credit score if needed.',
            '6-12': 'Perfect time to save for down payment and research neighborhoods.',
            '12+': 'Set savings goals and start building relationship with a lender.'
          }
        },
        budget: {
          header: 'What\'s your budget?',
          subtitle: 'Understanding your budget helps us find the right homes',
          helpText: 'We\'ll help you understand what you can afford',
          types: {
            price: {
              label: 'Target Home Price',
              description: 'I know how much I want to spend'
            },
            monthly: {
              label: 'Monthly Payment Budget',
              description: 'I prefer to think in monthly payments'
            }
          },
          fields: {
            targetPrice: 'Target Home Price',
            monthlyPayment: 'Monthly Payment Budget',
            targetPricePlaceholder: 'Enter target price',
            monthlyPaymentPlaceholder: 'Enter monthly budget'
          },
          tips: {
            price: 'Remember to factor in property taxes, insurance, and HOA fees',
            monthly: 'We\'ll calculate the home price range based on your monthly budget'
          }
        },
        income: {
          header: 'What\'s your annual household income?',
          subtitle: 'This helps us calculate what you can afford',
          fieldLabel: 'Annual Household Income',
          helpText: 'Include all sources of household income',
          description: 'Include all sources of income before taxes for everyone in your household.',
          sections: {
            enterIncome: 'Enter Your Annual Income',
            selectRange: 'Or select a range:'
          },
          fields: {
            annualIncome: 'Annual Household Income',
            annualIncomePlaceholder: '75000'
          },
          breakdown: {
            annual: 'Annual:',
            monthly: 'Monthly:'
          },
          ranges: {
            '30k50k': { description: 'Entry level range' },
            '50k75k': { description: 'Middle income range' },
            '75k100k': { description: 'Good income range' },
            '100k150k': { description: 'Higher income range' },
            '150kPlus': { description: 'High income range' }
          },
          sourcesInfo: {
            title: 'What to Include:',
            intro: 'Include all sources of gross (before tax) income:',
            salary: 'Salary and wages',
            bonus: 'Bonuses and commissions',
            selfEmployed: 'Self-employment income',
            rental: 'Rental income',
            investment: 'Investment income',
            other: 'Other regular income'
          },
          affordabilityPreview: {
            title: 'Affordability Preview',
            rule: 'Based on the 28% rule, your maximum monthly housing payment should be around {{amount}}.'
          },
          tipText: 'Tip: Be honest about your income. Lenders will verify this information during the loan process.'
        },
        debtsCredit: {
          header: 'Current debts and credit',
          description: 'Help us understand your current financial obligations and credit profile.',
          sections: {
            monthlyDebts: 'Monthly Debt Payments',
            creditScore: 'Credit Score Range'
          },
          fields: {
            monthlyDebts: 'Total Monthly Debt Payments',
            monthlyDebtsPlaceholder: '500'
          },
          includes: 'Include: car payments, credit cards, student loans, personal loans',
          excludes: 'Don\'t include: utilities, groceries, rent, or other living expenses',
          creditScoreOptions: {
            '800-850': {
              label: '800-850 (Exceptional)',
              description: 'Best rates available'
            },
            '740-799': {
              label: '740-799 (Very Good)',
              description: 'Excellent loan terms'
            },
            '670-739': {
              label: '670-739 (Good)',
              description: 'Good loan options'
            },
            '580-669': {
              label: '580-669 (Fair)',
              description: 'Some loan options'
            },
            '300-579': {
              label: '300-579 (Poor)',
              description: 'Limited options'
            },
            unknown: {
              label: 'I\'m not sure',
              description: 'We can help you check'
            }
          },
          infoSections: {
            creditScoreInfo: {
              title: 'About Credit Scores',
              description: 'Your credit score affects your interest rate and loan terms. Higher scores typically qualify for better rates and more loan options.',
              unknownHelp: 'Don\'t worry if you\'re not sure! We can help you check your credit score and improve it if needed.'
            },
            debtToIncomeRatio: {
              title: 'Debt-to-Income Ratio',
              description: 'Your debt-to-income ratio is approximately {{ratio}}%. Lenders typically prefer this to be below 36%.'
            }
          },
          helpText: 'Tip: Being honest about your debts and credit helps us provide accurate recommendations and loan options.'
        },
        results: {
          title: 'Your Personalized Home Buying Plan',
          subtitle: 'Based on your responses, here\'s your comprehensive analysis and recommendations',
          loading: 'Generating your analysis...',
          aiAnalysis: 'AI-Powered Analysis',
          comprehensiveAnalysis: 'Comprehensive Analysis',
          affordabilityAnalysis: 'Affordability Analysis',
          recommendedPriceRange: 'Recommended Price Range',
          affordabilityDetails: {
            basedOnIncome: 'Based on your income',
            maximumAffordable: 'Maximum Affordable',
            upperLimit: 'Upper limit',
            estimatedMonthlyPayment: 'Estimated Monthly Payment',
            piti: 'Principal, Interest, Taxes, Insurance'
          },
          sections: {
            loanPrograms: 'Recommended Loan Programs',
            actionPlan: 'Your Action Plan',
            expertTips: 'Expert Tips',
            yourInformation: 'Your Information',
            nextSteps: 'Next Steps',
            thankYou: 'Thank You!'
          },
          contactFields: {
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            leadType: 'Lead Type'
          },
          actions: {
            callSully: 'Call Sully: (512) 412-2352'
          },
          nextStepsDescription: 'Your personalized plan is ready! A Sully Ruiz team member will contact you within 24 hours to discuss your next steps.',
          thankYouDescription: 'Thank you for using our home buying wizard. We\'re excited to help you achieve your homeownership goals!',
          emailStatus: {
            notFound: 'Email address not found',
            failedToPrepare: 'Failed to prepare email',
            errorPreparing: 'Error preparing email'
          }
        },
        downPayment: {
          sectionTitle: 'Choose your down payment option',
          approximately: 'Approximately',
          helpText: 'Different down payment amounts affect your loan terms',
          types: {
            none: {
              label: 'No Down Payment (0% down)',
              description: 'Perfect for VA loans, USDA loans, or special first-time buyer programs'
            },
            amount: {
              label: 'Specific Dollar Amount',
              description: 'Enter the exact dollar amount you plan to put down'
            },
            percentage: {
              label: 'Percentage of Home Price',
              description: 'Enter the percentage of the home price you plan to put down'
            }
          },
          fields: {
            amount: 'Down Payment Amount',
            percentage: 'Down Payment Percentage',
            amountPlaceholder: 'Enter amount',
            percentagePlaceholder: 'Enter percentage'
          },
          optionsInfo: {
            title: 'Down Payment Options:',
            conventional: 'Conventional: 3-20% down',
            fha: 'FHA: 3.5% down',
            va: 'VA: 0% down (eligible veterans)',
            usda: 'USDA: 0% down (rural areas)'
          },
          programs: {
            conventional: 'Conventional loans require 3-20% down',
            fha: 'FHA loans require only 3.5% down',
            va: 'VA loans require no down payment',
            usda: 'USDA loans require no down payment'
          },
          pmiInfo: {
            title: 'About PMI (Private Mortgage Insurance)',
            lessThan20: 'With less than 20% down, you\'ll likely need PMI, which adds to your monthly payment. PMI can be removed once you reach 20% equity.',
            noDownPayment: 'With no down payment, you\'ll likely need PMI or funding fee, which adds to your monthly payment. This can be removed once you reach 20% equity.'
          },
          selectedMessages: {
            none: '✓ Selected: 0% down payment',
            amount: 'amount selected',
            percentage: 'percentage selected'
          },
          optionsTitle: 'Down Payment Options',
          optionsDescription: 'You don\'t always need 20% down! Here are your options:',
          programsList: {
            conventional: 'Conventional loans: 3-5% down',
            fha: 'FHA loans: 3.5% down',
            va: 'VA loans: 0% down (for eligible veterans)',
            usda: 'USDA loans: 0% down (rural areas)',
            firstTime: 'First-time buyer programs'
          },
          tipText: 'Tip: Choose the method that\'s easier for you to think about. We can help you explore different down payment strategies.',
          errorTitle: 'Please fix the following:',
          calculations: {
            ofTargetPrice: 'of target price',
            approximately: 'Approximately'
          }
        },
        employment: {
          header: 'Employment situation',
          subtitle: 'Your employment type affects loan options and requirements',
          sectionTitle: 'Select Your Employment Type',
          expectationsTitle: 'What to Expect',
          helpText: 'Tip: Choose the option that best describes your primary income source. We can discuss mixed situations during your consultation.',
          types: {
            w2: {
              label: 'W-2 Employee',
              description: 'Traditional employment with pay stubs',
              considerations: 'Standard documentation required'
            },
            '1099': {
              label: '1099 Contractor',
              description: 'Independent contractor or freelancer',
              considerations: 'May need 2 years of tax returns'
            },
            selfEmployed: {
              label: 'Self-Employed',
              description: 'Own a business or are self-employed',
              considerations: 'Business tax returns required'
            },
            mixed: {
              label: 'Mixed Income',
              description: 'Combination of W-2 and 1099 income',
              considerations: 'Documentation for all income sources'
            },
            retired: {
              label: 'Retired',
              description: 'Receiving retirement or pension income',
              considerations: 'Social Security and pension statements'
            },
            other: {
              label: 'Other',
              description: 'Different employment situation',
              considerations: 'We\'ll help determine requirements'
            }
          },
          advice: {
            w2: 'W-2 employees typically have the easiest approval process with recent pay stubs and tax returns.',
            '1099': '1099 contractors may need to show 2 years of stable income and higher cash reserves.',
            selfEmployed: 'Self-employed borrowers need business tax returns and may benefit from bank statement loans.',
            mixed: 'Mixed income requires documentation for all sources and may need averaged income calculations.',
            retired: 'Retirees can use Social Security, pensions, and retirement account withdrawals as qualifying income.',
            other: 'We\'ll work with you to determine the best loan program for your unique situation.'
          }
        },
        buyerProfile: {
          sectionTitle: 'Which describes you?',
          subtitle: 'Select all that apply',
          errorTitle: 'Please fix the following:',
          types: {
            firstTime: {
              label: 'First-time homebuyer',
              description: 'Special programs and benefits available'
            },
            veteran: {
              label: 'Military veteran or active duty',
              description: 'VA loan benefits available'
            },
            moveUp: {
              label: 'Move-up buyer (selling current home)',
              description: 'Bridge loan and timing options'
            },
            investment: {
              label: 'Investment property buyer',
              description: 'Investment loan programs'
            },
            relocating: {
              label: 'Relocating for work',
              description: 'Relocation loan programs'
            },
            downsizing: {
              label: 'Downsizing',
              description: 'Right-sizing for retirement or lifestyle'
            },
            upsizing: {
              label: 'Upsizing (growing family)',
              description: 'Growing family needs more space'
            }
          },
          householdSize: {
            title: 'Household Size',
            description: 'Number of people in your household',
            helpText: 'Some income-based programs have household size requirements (1-10 people)'
          },
          benefitsTitle: 'Potential Benefits',
          benefits: {
            firstTime: 'First-time buyer programs with lower down payments',
            veteran: 'VA loans with 0% down payment',
            investment: 'Investment property financing options',
            relocating: 'Relocation assistance programs'
          },
          helpText: 'Tip: Selecting relevant buyer types helps us identify programs that could save you money or provide better terms.'
        },
        contact: {
          sectionTitle: 'Contact Information',
          required: 'Required',
          fields: {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email Address',
            phone: 'Phone Number'
          },
          consent: {
            title: 'Communication Consent',
            phone: 'I consent to receive calls about my home buying inquiry',
            sms: 'I consent to receive text messages with updates and information',
            email: 'I consent to receive emails with market updates and educational content',
            description: 'By submitting this form, you agree to be contacted by phone, SMS, or email. This estimate is for educational purposes only and does not constitute a loan approval or commitment.'
          },
          streaming: {
            title: 'Generating Your Personalized Report',
            timeEstimate: 'This will take approximately 40-60 seconds. Please wait...',
            aiGenerating: 'AI Generating...',
            generatingPlan: 'Generating Your Plan...',
            success: 'Report generated successfully!',
            characterCount: 'Generated {{count}} characters',
            charactersGenerated: '{{count}} characters generated...'
          },
          submitButton: 'Generate My Home Buying Plan',
          generating: 'Generating Your Plan...',
          submissionFailed: 'Submission Failed',
          privacyNote: 'Your information is secure and will only be used to provide you with personalized home buying recommendations and assistance.',
          phonePlaceholder: '(555) 123-4567',
          generatePlan: 'Generate My Plan',
          errorGenerate: 'Failed to generate plan. Please try again.'
        }
      },
      validation: {
        timelineRequired: 'Timeline is required',
        targetPriceRequired: 'Target price is required',
        monthlyBudgetRequired: 'Monthly budget is required',
        annualIncomeRequired: 'Valid annual income is required',
        monthlyDebtsNegative: 'Monthly debts cannot be negative',
        creditScoreRequired: 'Credit score range is required',
        downPaymentRequired: 'Down payment information is required',
        employmentTypeRequired: 'Employment type is required',
        firstNameRequired: 'First name is required',
        lastNameRequired: 'Last name is required',
        emailRequired: 'Email address is required',
        emailInvalid: 'Please enter a valid email address',
        phoneRequired: 'Phone number is required',
        phoneInvalid: 'Please enter a valid phone number',
        generalError: 'Validation error occurred'
      },
      shared: {
        tip: 'Tip:',
        errorTitle: 'Please fix the following:',
        formValidationErrors: 'Form Validation Errors',
        unexpectedError: 'An unexpected error occurred',
        somethingWrong: 'Something went wrong',
        tryAgain: 'Try Again',
        reloadPage: 'Reload Page',
        errorDetails: 'Error Details (Development)',
        validating: 'Validating...',
        perMonth: '/month'
      },
      cityAutocomplete: {
        metroBadge: 'Metro',
        noCitiesFound: 'No Texas cities found for "{{query}}"',
        tryDifferentCity: 'Try a different Texas city name'
      },
      progressRestoration: {
        title: 'Resume Your Progress?',
        description: 'We found your previous wizard session. Would you like to continue where you left off?',
        progress: 'Progress:',
        completed: 'Completed:',
        lastSaved: 'Last saved:',
        steps: 'steps',
        stepOf: 'Step {{current}} of {{total}}',
        continueProgress: 'Continue Progress',
        startFresh: 'Start Fresh',
        dismiss: 'Dismiss',
        autoSaveNote: 'Your progress is automatically saved and expires after 24 hours.',
        progressSaved: 'Progress saved'
      },
      stepIndicator: {
        navLabel: 'Step progress indicator',
        totalStepsLabel: '{{count}} steps in total',
        stepOf: 'Step {{current}} of {{total}}',
        breadcrumbLabel: 'Breadcrumb navigation',
        progressSummaryLabel: 'Progress summary',
        currentStepAnnouncement: 'Currently on step {{current}}: {{title}}',
        statusLabels: {
          completed: 'Completed',
          current: 'Current step',
          available: 'Available',
          upcoming: 'Upcoming'
        },
        actionDescriptions: {
          clickToNavigate: 'Click to navigate to this step',
          currentStep: 'You are currently on this step',
          futureStep: 'This step will be available after completing previous steps'
        },
        progressSummary: {
          stepOf: 'Step {{current}} of {{total}}',
          completedProgress: '{{completed}} completed • {{percentage}}% done',
          detailedProgress: 'Progress details: You have completed {{completed}} out of {{total}} steps. You are currently on step {{current}}. Overall progress: {{percentage}} percent complete.'
        }
      },
      navigation: {
        back: 'Back',
        nextStep: 'Next Step',
        processing: 'Processing...',
        transitioning: 'Transitioning...',
        ariaLabels: {
          goBackToPrevious: 'Go back to previous step',
          processingWait: 'Processing, please wait',
          continueToNext: 'Continue to next step'
        }
      },
      loading: {
        default: 'Loading...',
        form: 'Loading form...',
        options: 'Loading options...',
        list: 'Loading list...'
      },
      service: {
        apiError: 'Service temporarily unavailable',
        networkError: 'Network connection error',
        unexpectedError: 'An unexpected error occurred'
      }
    },
    pages: {
      home: {
        header: {
          badge: '🏠 Your Austin Home Buying Expert',
          title: 'Find Your',
          titleHighlight: 'Austin Home',
          titleSuffix: 'with Expert Guidance',
          subtitle: 'Your trusted bilingual REALTOR® serving Austin, Round Rock, Pflugerville, and surrounding areas. Specializing in first-time buyers, ITIN clients, and self-employed professionals.',
          ctaPrimary: 'Start Your Journey',
          ctaSecondary: 'See How It Works',
          ctaSecondaryMobile: 'Learn More'
        },
        nav: {
          features: 'Features',
          howItWorks: 'How It Works',
          testimonials: 'Success Stories',
          languageToggle: 'EN / ES',
          closeMenu: 'Close menu',
          openMenu: 'Open menu'
        },
        hero: {
          sullyBadge: '🏆 200+ Families Served',
          sullyLanguages: '🌎 EN/ES',
          sullyTitle: 'Sully Ruiz, REALTOR®',
          sullyCompany: 'Keller Williams Austin NW',
          formTitle: 'Connect with Sully Today',
          formSubtitle: 'Get your free Austin market analysis and personalized home buying strategy',
          successTitle: 'Thank You!',
          successMessage: 'Your information has been submitted successfully. Sully will contact you shortly to discuss your home buying goals.',
          successCta: 'Start Full Consultation'
        },
        stats: {
          families: '200+',
          familiesLabel: 'Austin Families Served',
          experience: '5+',
          experienceLabel: 'Years Austin Market',
          languages: 'English / Español',
          languagesLabel: 'Bilingual Service'
        },
        features: {
          badge: '✨ Full-Service Real Estate',
          title: 'Everything You Need to',
          titleHighlight: 'Buy Confidently',
          subtitle: 'From initial consultation to closing day, Sully provides expert guidance through every step of your Austin home buying journey',
          firstTime: {
            icon: '🏠',
            title: 'First-Time Buyer Expertise',
            description: 'Specialized guidance for first-time homebuyers navigating the Austin market, including down payment assistance programs and FHA loans.'
          },
          itin: {
            icon: '💼',
            title: 'ITIN & Self-Employed Support',
            description: 'Expert assistance for ITIN holders and self-employed professionals with alternative income documentation and specialized loan programs.'
          },
          bilingual: {
            icon: '🌎',
            title: 'Bilingual Service (EN/ES)',
            description: 'Full real estate services in both English and Spanish, ensuring clear communication throughout your home buying process.'
          },
          marketAnalysis: {
            icon: '📈',
            title: 'Austin Market Analysis',
            description: 'Deep local market knowledge covering Austin, Round Rock, Pflugerville, Georgetown, Hutto, and Cedar Park with current pricing trends.'
          },
          negotiation: {
            icon: '🤝',
            title: 'Negotiation Expertise',
            description: 'Strong negotiation skills to secure the best deal possible, whether in a competitive market or working with motivated sellers.'
          },
          network: {
            icon: '🏢',
            title: 'Keller Williams Network',
            description: 'Access to the powerful Keller Williams network of lenders, inspectors, contractors, and other professionals to support your transaction.'
          }
        },
        howItWorks: {
          title: 'How It Works',
          subtitle: 'Three simple steps to start your Austin home buying journey with Sully',
          step1: {
            number: '01',
            title: 'Initial Consultation',
            description: 'Meet with Sully to discuss your goals, budget, timeline, and preferred Austin neighborhoods. This consultation is always free and no-pressure.'
          },
          step2: {
            number: '02',
            title: 'Market Strategy',
            description: 'Sully creates a personalized home search strategy, connects you with trusted lenders, and guides you through pre-approval.'
          },
          step3: {
            number: '03',
            title: 'Find & Close',
            description: 'Start touring homes, make competitive offers with expert negotiation support, and close on your dream Austin home.'
          },
          cta: 'Start Your Journey'
        },
        testimonials: {
          title: 'Trusted by Austin Families',
          subtitle: 'Hear from real Austin homeowners who achieved their dreams with Sully\'s expert guidance',
          maria: {
            quote: 'Sully helped us navigate our first home purchase with patience and expertise. His bilingual support made all the difference for our family. ¡Gracias, Sully!',
            author: 'Maria & Carlos Gonzalez',
            role: 'First-time Homebuyers',
            location: 'Round Rock, TX'
          },
          james: {
            quote: 'As a self-employed contractor, I thought buying a home would be impossible. Sully connected me with the right lender and we closed in 45 days!',
            author: 'James Martinez',
            role: 'Self-Employed Contractor',
            location: 'Pflugerville, TX'
          },
          sarah: {
            quote: 'Sully\'s knowledge of the Austin market helped us find the perfect home in Georgetown. His negotiation skills saved us $15,000!',
            author: 'Sarah & Mike Johnson',
            role: 'Growing Family',
            location: 'Georgetown, TX'
          }
        },
        finalCta: {
          title: 'Ready to Find Your Austin Home?',
          subtitle: 'Contact Sully today for your free consultation and market analysis. Experience the difference of working with a trusted local expert who speaks your language.',
          ctaPrimary: 'Contact Sully Today',
          ctaSecondary: 'Call (512) 412-2352'
        }
      },
    },
    components: {
      heroForm: {
        fields: {
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email Address',
          phone: 'Phone Number',
          income: 'Annual Household Income'
        },
        incomeOptions: {
          default: 'Select income range',
          '30k50k': '$30,000 - $50,000',
          '50k75k': '$50,000 - $75,000',
          '75k100k': '$75,000 - $100,000',
          '100k150k': '$100,000 - $150,000',
          '150kPlus': '$150,000+'
        },
        submitButton: 'Get My Personalized Plan',
        submittingButton: 'Processing...',
        helpText: 'This helps us provide accurate affordability estimates',
        privacyTitle: 'Secure & Private',
        privacyNotice: 'By submitting, you agree to our privacy policy. No spam, ever.'
      },
      footer: {
        company: {
          description: 'Your trusted bilingual REALTOR® specializing in first-time buyers, ITIN clients, and Austin area real estate.',
          tagline: 'Servicio en Español'
        },
        services: {
          title: 'Services',
          firstTimeBuyers: 'First-Time Buyers',
          itinSupport: 'ITIN Support',
          bilingualService: 'Bilingual Service',
          marketAnalysis: 'Market Analysis'
        },
        serviceAreas: {
          title: 'Service Areas',
          austin: 'Austin',
          roundRock: 'Round Rock',
          pflugerville: 'Pflugerville',
          georgetown: 'Georgetown',
          hutto: 'Hutto',
          cedarPark: 'Cedar Park'
        },
        contact: {
          title: 'Contact',
          email: 'realtor@sullyruiz.com',
          phone: '(512) 412-2352',
          license: 'Licensed in Texas',
          company: 'Keller Williams Austin NW',
          whatsapp: 'WhatsApp Available'
        },
        legal: {
          texasNotice: 'Texas Real Estate Commission Consumer Protection Notice',
          texasInfo: 'Texas Real Estate Commission Information About Brokerage Services',
          termsOfUse: 'Terms of Use',
          privacyPolicy: 'Privacy Policy',
          cookiePolicy: 'Cookie Policy',
          dmca: 'DMCA',
          fairHousing: 'Fair Housing',
          accessibility: 'Accessibility',
          kwCopyright: 'Keller Williams Realty, Inc., a franchise company, is an Equal Opportunity Employer and supports the Fair Housing Act. Each Keller Williams® office is independently owned and operated.',
          kwCopyright2: 'Copyright © 1996-2025 Keller Williams Realty, Inc. All rights reserved.',
          sullyRights: '© 2025 Sully Ruiz, REALTOR®. All rights reserved.'
        }
      },
    },
    form: {
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        tooShort: 'Too short',
        tooLong: 'Too long',
        invalidNumber: 'Please enter a valid number',
        tooYoung: 'Must be at least 18 years old'
      },
      saveProgress: 'Save Progress',
      restoreProgress: 'Restore Previous Session',
      clearProgress: 'Start Over',
      autoSave: 'Auto-saved',
      unsavedChanges: 'You have unsaved changes'
    },
    accessibility: {
      skipToContent: 'Skip to main content',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      languageSelector: 'Select language',
      darkModeToggle: 'Toggle dark mode',
      currentLanguage: 'Current language: English'
    }
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      submit: 'Enviar',
      cancel: 'Cancelar',
      next: 'Siguiente',
      previous: 'Anterior',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      close: 'Cerrar',
      yes: 'Sí',
      no: 'No',
      learnMore: 'Saber Más',
      contactUs: 'Contáctanos',
      getStarted: 'Comenzar'
    },
    nav: {
      home: 'Inicio',
      about: 'Acerca de',
      services: 'Servicios',
      contact: 'Contacto',
      language: 'Idioma',
      buyingProcess: 'Proceso de Compra',
      mortgageCalculator: 'Calculadora Hipotecaria',
      resources: 'Recursos',
      testimonials: 'Testimonios'
    },
    wizard: {
      brand: 'CasaReady',
      badge: '🏠 Análisis Impulsado por IA',
      title: 'Obtén Tu',
      titleHighlight: 'Plan Personalizado de Compra de Vivienda',
      subtitle: 'Responde algunas preguntas sobre tu situación financiera y preferencias. Nuestra IA analizará tu perfil y creará una hoja de ruta personalizada hacia la propiedad de vivienda.',
      backToHome: '← Volver al Inicio',
      languageToggle: 'EN / ES',
      supportTitle: '¿Necesitas ayuda? Nuestros especialistas en compra de vivienda están aquí para asistirte.',
      callUs: 'Llámanos: (512) 412-2352',
      textUs: 'Envíanos Mensaje: (512) 412-2352',
      liveChat: 'Soporte de Chat en Vivo',
      page: {
        title: 'Obtén Tu Plan Personalizado de Compra de Vivienda',
        description: 'Análisis de compra de vivienda impulsado por IA y hoja de ruta personalizada',
        backToHome: '← Volver al Inicio',
        badge: '🏠 Análisis Impulsado por IA',
        titleHighlight: 'Plan de Compra de Vivienda',
        subtitle: 'Responde algunas preguntas sobre tu situación financiera y preferencias. Nuestra IA analizará tu perfil y creará una hoja de ruta personalizada hacia la propiedad de vivienda.',
        supportTitle: '¿Necesitas ayuda?',
        callUs: 'Llámanos:',
        textUs: 'Envíanos Mensaje:',
        liveChat: 'Soporte de Chat en Vivo'
      },
      progress: {
        title: 'Asistente Interactivo de Compra de Casa',
        titleMobile: 'Asistente Casa',
        stepNotFound: 'Paso no encontrado',
        stepLoadError: 'El paso solicitado no se pudo cargar',
        stepCounter: 'Paso {{current}} de {{total}} pasos',
        loadingNextStep: 'Cargando siguiente paso',
        transitioning: 'Transicionando...',
        progressLabel: 'Progreso:',
        percentComplete: '{{percent}}% completado'
      },
      steps: {
        location: {
          header: '¿Dónde quieres comprar?',
          subtitle: 'Ayúdanos a entender tu ubicación preferida y prioridades',
          errorTitle: 'Por favor corrige lo siguiente:',
          preferredLocationTitle: 'Ubicación Preferida',
          prioritiesTitle: '¿Qué es lo más importante para ti?',
          helpText: 'Usaremos esta información para personalizar nuestro análisis de mercado',
          fields: {
            city: 'Ciudad de Texas',
            zipCode: 'Código Postal',
            cityPlaceholder: 'Ingresa nombre de la ciudad',
            zipPlaceholder: 'Ingresa código postal'
          },
          priorities: {
            schools: 'Calidad de Escuelas',
            commute: 'Traslado al Trabajo',
            safety: 'Seguridad y Crimen',
            walkability: 'Caminabilidad',
            shopping: 'Compras y Restaurantes',
            parks: 'Parques y Recreación',
            nightlife: 'Vida Nocturna y Entretenimiento',
            diversity: 'Diversidad Comunitaria'
          },
          censusErrors: {
            notFound: 'Datos de ubicación no encontrados',
            invalid: 'Ubicación inválida ingresada',
            apiError: 'No se pudieron obtener datos de ubicación'
          }
        },
        timeline: {
          sectionTitle: 'Selecciona Tu Cronograma',
          urgentBadge: 'Urgente',
          tipTitle: 'Consejo de Cronograma',
          helpText: 'Tu cronograma afecta la estrategia y pre-aprobación del préstamo',
          options: {
            '0-3': {
              label: 'Listo para comprar (0-3 meses)',
              description: 'Estoy pre-aprobado y listo para comenzar a buscar'
            },
            '3-6': {
              label: 'Pronto (3-6 meses)',
              description: 'Preparando mis finanzas y explorando opciones'
            },
            '6-12': {
              label: 'Este año (6-12 meses)',
              description: 'Planificando con anticipación y preparándome para el proceso'
            },
            '12+': {
              label: 'El próximo año o más tarde (12+ meses)',
              description: 'Planificación temprana y establecimiento de objetivos'
            }
          },
          tips: {
            '0-3': 'Enfócate en ofertas competitivas y decisiones rápidas. Ten todos los documentos listos.',
            '3-6': 'Comienza el proceso de pre-aprobación y mejora tu puntaje crediticio si es necesario.',
            '6-12': 'Momento perfecto para ahorrar para el pago inicial e investigar vecindarios.',
            '12+': 'Establece metas de ahorro y comienza a construir una relación con un prestamista.'
          }
        },
        budget: {
          header: '¿Cuál es tu presupuesto?',
          subtitle: 'Entender tu presupuesto nos ayuda a encontrar las casas adecuadas',
          helpText: 'Te ayudaremos a entender lo que puedes permitirte',
          types: {
            price: {
              label: 'Precio Objetivo de Casa',
              description: 'Sé cuánto quiero gastar'
            },
            monthly: {
              label: 'Presupuesto de Pago Mensual',
              description: 'Prefiero pensar en pagos mensuales'
            }
          },
          fields: {
            targetPrice: 'Precio Objetivo de Casa',
            monthlyPayment: 'Presupuesto de Pago Mensual',
            targetPricePlaceholder: 'Ingresa precio objetivo',
            monthlyPaymentPlaceholder: 'Ingresa presupuesto mensual'
          },
          tips: {
            price: 'Recuerda incluir impuestos de propiedad, seguro y cuotas de HOA',
            monthly: 'Calcularemos el rango de precio de casa basado en tu presupuesto mensual'
          }
        },
        income: {
          header: '¿Cuál es tu ingreso anual del hogar?',
          subtitle: 'Esto nos ayuda a calcular lo que puedes permitirte',
          fieldLabel: 'Ingreso Anual del Hogar',
          helpText: 'Incluye todas las fuentes de ingreso del hogar',
          description: 'Incluye todas las fuentes de ingreso antes de impuestos para todos en tu hogar.',
          sections: {
            enterIncome: 'Ingresa tu Ingreso Anual',
            selectRange: 'O selecciona un rango:'
          },
          fields: {
            annualIncome: 'Ingreso Anual Familiar',
            annualIncomePlaceholder: '75000'
          },
          breakdown: {
            annual: 'Anual:',
            monthly: 'Mensual:'
          },
          ranges: {
            '30k50k': { description: 'Rango de nivel inicial' },
            '50k75k': { description: 'Rango de ingresos medios' },
            '75k100k': { description: 'Buen rango de ingresos' },
            '100k150k': { description: 'Rango de ingresos altos' },
            '150kPlus': { description: 'Rango de ingresos muy altos' }
          },
          sourcesInfo: {
            title: 'Qué Incluir:',
            intro: 'Incluye todas las fuentes de ingreso bruto (antes de impuestos):',
            salary: 'Salario y sueldos',
            bonus: 'Bonos y comisiones',
            selfEmployed: 'Ingresos por trabajo independiente',
            rental: 'Ingresos por alquiler',
            investment: 'Ingresos por inversiones',
            other: 'Otros ingresos regulares'
          },
          affordabilityPreview: {
            title: 'Vista Previa de Asequibilidad',
            rule: 'Basado en la regla del 28%, tu pago máximo mensual de vivienda debería ser alrededor de {{amount}}.'
          },
          tipText: 'Consejo: Sé honesto sobre tus ingresos. Los prestamistas verificarán esta información durante el proceso de préstamo.'
        },
        debtsCredit: {
          header: 'Deudas actuales y crédito',
          description: 'Ayúdanos a entender tus obligaciones financieras actuales y perfil crediticio.',
          sections: {
            monthlyDebts: 'Pagos Mensuales de Deuda',
            creditScore: 'Rango de Puntaje Crediticio'
          },
          fields: {
            monthlyDebts: 'Total de Pagos Mensuales de Deuda',
            monthlyDebtsPlaceholder: '500'
          },
          includes: 'Incluye: pagos de auto, tarjetas de crédito, préstamos estudiantiles, préstamos personales',
          excludes: 'No incluyas: servicios públicos, comestibles, renta, u otros gastos de vida',
          creditScoreOptions: {
            '800-850': {
              label: '800-850 (Excepcional)',
              description: 'Mejores tasas disponibles'
            },
            '740-799': {
              label: '740-799 (Muy Bueno)',
              description: 'Excelentes términos de préstamo'
            },
            '670-739': {
              label: '670-739 (Bueno)',
              description: 'Buenas opciones de préstamo'
            },
            '580-669': {
              label: '580-669 (Regular)',
              description: 'Algunas opciones de préstamo'
            },
            '300-579': {
              label: '300-579 (Pobre)',
              description: 'Opciones limitadas'
            },
            unknown: {
              label: 'No estoy seguro',
              description: 'Podemos ayudarte a verificar'
            }
          },
          infoSections: {
            creditScoreInfo: {
              title: 'Sobre los Puntajes de Crédito',
              description: 'Tu puntaje de crédito afecta tu tasa de interés y términos del préstamo. Puntajes más altos típicamente califican para mejores tasas y más opciones de préstamo.',
              unknownHelp: '¡No te preocupes si no estás seguro! Podemos ayudarte a verificar tu puntaje de crédito y mejorarlo si es necesario.'
            },
            debtToIncomeRatio: {
              title: 'Ratio Deuda-a-Ingresos',
              description: 'Tu ratio deuda-a-ingresos es aproximadamente {{ratio}}%. Los prestamistas típicamente prefieren que esto esté por debajo del 36%.'
            }
          },
          helpText: 'Consejo: Ser honesto sobre tus deudas y crédito nos ayuda a proporcionar recomendaciones precisas y opciones de préstamo.'
        },
        results: {
          title: 'Tu Plan Personalizado de Compra de Casa',
          subtitle: 'Basado en tus respuestas, aquí está tu análisis integral y recomendaciones',
          loading: 'Generando tu análisis...',
          aiAnalysis: 'Análisis Impulsado por IA',
          comprehensiveAnalysis: 'Análisis Integral',
          affordabilityAnalysis: 'Análisis de Capacidad de Pago',
          recommendedPriceRange: 'Rango de Precio Recomendado',
          affordabilityDetails: {
            basedOnIncome: 'Basado en tus ingresos',
            maximumAffordable: 'Máximo Asequible',
            upperLimit: 'Límite superior',
            estimatedMonthlyPayment: 'Pago Mensual Estimado',
            piti: 'Capital, Interés, Impuestos, Seguro'
          },
          sections: {
            loanPrograms: 'Programas de Préstamo Recomendados',
            actionPlan: 'Tu Plan de Acción',
            expertTips: 'Consejos de Expertos',
            yourInformation: 'Tu Información',
            nextSteps: 'Próximos Pasos',
            thankYou: '¡Gracias!'
          },
          contactFields: {
            name: 'Nombre',
            email: 'Correo',
            phone: 'Teléfono',
            leadType: 'Tipo de Cliente'
          },
          actions: {
            callSully: 'Llamar a Sully: (512) 412-2352'
          },
          nextStepsDescription: 'Tu plan personalizado está listo! Un miembro del equipo de Sully Ruiz te contactará dentro de 24 horas para discutir tus próximos pasos.',
          thankYouDescription: 'Gracias por usar nuestro asistente de compra de casa. ¡Estamos emocionados de ayudarte a alcanzar tus metas de ser propietario!',
          emailStatus: {
            notFound: 'Dirección de correo no encontrada',
            failedToPrepare: 'Error al preparar correo',
            errorPreparing: 'Error al preparar correo'
          }
        },
        downPayment: {
          sectionTitle: 'Elige tu opción de pago inicial',
          approximately: 'Aproximadamente',
          helpText: 'Diferentes cantidades de pago inicial afectan los términos de tu préstamo',
          types: {
            none: {
              label: 'Sin Enganche (0% de enganche)',
              description: 'Perfecto para préstamos VA, USDA, o programas especiales para compradores primerizos'
            },
            amount: {
              label: 'Cantidad Específica en Dólares',
              description: 'Ingresa la cantidad exacta en dólares que planeas dar de enganche'
            },
            percentage: {
              label: 'Porcentaje del Precio de Casa',
              description: 'Ingresa el porcentaje del precio de la casa que planeas dar de enganche'
            }
          },
          fields: {
            amount: 'Cantidad de Pago Inicial',
            percentage: 'Porcentaje de Pago Inicial',
            amountPlaceholder: 'Ingresa cantidad',
            percentagePlaceholder: 'Ingresa porcentaje'
          },
          optionsInfo: {
            title: 'Opciones de Pago Inicial:',
            conventional: 'Convencional: 3-20% de pago inicial',
            fha: 'FHA: 3.5% de pago inicial',
            va: 'VA: 0% de pago inicial (veteranos elegibles)',
            usda: 'USDA: 0% de pago inicial (áreas rurales)'
          },
          programs: {
            conventional: 'Los préstamos convencionales requieren 3-20% de pago inicial',
            fha: 'Los préstamos FHA requieren solo 3.5% de pago inicial',
            va: 'Los préstamos VA no requieren pago inicial',
            usda: 'Los préstamos USDA no requieren pago inicial'
          },
          pmiInfo: {
            title: 'Sobre PMI (Seguro Hipotecario Privado)',
            lessThan20: 'Con menos del 20% de enganche, probablemente necesitarás PMI, que se agrega a tu pago mensual. El PMI puede eliminarse una vez que alcances 20% de capital.',
            noDownPayment: 'Sin enganche, probablemente necesitarás PMI o tarifa de financiamiento, que se agrega a tu pago mensual. Esto puede eliminarse una vez que alcances 20% de capital.'
          },
          selectedMessages: {
            none: '✓ Seleccionado: 0% de enganche',
            amount: 'cantidad seleccionada',
            percentage: 'porcentaje seleccionado'
          },
          optionsTitle: 'Opciones de Enganche',
          optionsDescription: '¡No siempre necesitas 20% de enganche! Aquí están tus opciones:',
          programsList: {
            conventional: 'Préstamos convencionales: 3-5% de enganche',
            fha: 'Préstamos FHA: 3.5% de enganche',
            va: 'Préstamos VA: 0% de enganche (para veteranos elegibles)',
            usda: 'Préstamos USDA: 0% de enganche (áreas rurales)',
            firstTime: 'Programas para compradores primerizos'
          },
          tipText: 'Consejo: Elige el método que sea más fácil para ti. Podemos ayudarte a explorar diferentes estrategias de enganche.',
          errorTitle: 'Por favor corrige lo siguiente:',
          calculations: {
            ofTargetPrice: 'del precio objetivo',
            approximately: 'Aproximadamente'
          }
        },
        employment: {
          header: 'Situación laboral',
          subtitle: 'Tu tipo de empleo afecta las opciones y requisitos del préstamo',
          sectionTitle: 'Selecciona Tu Tipo de Empleo',
          expectationsTitle: 'Qué Esperar',
          helpText: 'Consejo: Elige la opción que mejor describe tu fuente principal de ingresos. Podemos discutir situaciones mixtas durante tu consulta.',
          types: {
            w2: {
              label: 'Empleado W-2',
              description: 'Empleo tradicional con talones de pago',
              considerations: 'Documentación estándar requerida'
            },
            '1099': {
              label: 'Contratista 1099',
              description: 'Contratista independiente o trabajador freelance',
              considerations: 'Puede necesitar 2 años de declaraciones de impuestos'
            },
            selfEmployed: {
              label: 'Trabajador Autónomo',
              description: 'Dueño de un negocio o trabajador autónomo',
              considerations: 'Declaraciones de impuestos del negocio requeridas'
            },
            mixed: {
              label: 'Ingresos Mixtos',
              description: 'Combinación de ingresos W-2 y 1099',
              considerations: 'Documentación para todas las fuentes de ingreso'
            },
            retired: {
              label: 'Jubilado',
              description: 'Recibiendo ingresos de jubilación o pensión',
              considerations: 'Declaraciones de Seguro Social y pensión'
            },
            other: {
              label: 'Otro',
              description: 'Situación laboral diferente',
              considerations: 'Te ayudaremos a determinar los requisitos'
            }
          },
          advice: {
            w2: 'Los empleados W-2 típicamente tienen el proceso de aprobación más fácil con talones de pago recientes y declaraciones de impuestos.',
            '1099': 'Los contratistas 1099 pueden necesitar mostrar 2 años de ingresos estables y mayores reservas de efectivo.',
            selfEmployed: 'Los prestatarios autónomos necesitan declaraciones de impuestos del negocio y pueden beneficiarse de préstamos basados en estados de cuenta bancarios.',
            mixed: 'Los ingresos mixtos requieren documentación para todas las fuentes y pueden necesitar cálculos de ingresos promediados.',
            retired: 'Los jubilados pueden usar Seguro Social, pensiones y retiros de cuentas de jubilación como ingresos calificables.',
            other: 'Trabajaremos contigo para determinar el mejor programa de préstamo para tu situación única.'
          }
        },
        buyerProfile: {
          sectionTitle: '¿Cuál te describe?',
          subtitle: 'Selecciona todas las que apliquen',
          errorTitle: 'Por favor corrige lo siguiente:',
          types: {
            firstTime: {
              label: 'Comprador primerizo',
              description: 'Programas especiales y beneficios disponibles'
            },
            veteran: {
              label: 'Veterano militar o servicio activo',
              description: 'Beneficios de préstamo VA disponibles'
            },
            moveUp: {
              label: 'Comprador que se muda (vendiendo casa actual)',
              description: 'Opciones de préstamo puente y tiempo'
            },
            investment: {
              label: 'Comprador de propiedad de inversión',
              description: 'Programas de préstamo de inversión'
            },
            relocating: {
              label: 'Relocalizándose por trabajo',
              description: 'Programas de préstamo de reubicación'
            },
            downsizing: {
              label: 'Reduciendo tamaño de casa',
              description: 'Ajustando tamaño para jubilación o estilo de vida'
            },
            upsizing: {
              label: 'Aumentando tamaño (familia creciente)',
              description: 'Familia creciente necesita más espacio'
            }
          },
          householdSize: {
            title: 'Tamaño del Hogar',
            description: 'Número de personas en tu hogar',
            helpText: 'Algunos programas basados en ingresos tienen requisitos de tamaño del hogar (1-10 personas)'
          },
          benefitsTitle: 'Beneficios Potenciales',
          benefits: {
            firstTime: 'Programas para compradores primerizos con enganches más bajos',
            veteran: 'Préstamos VA con 0% de enganche',
            investment: 'Opciones de financiamiento para propiedades de inversión',
            relocating: 'Programas de asistencia para reubicación'
          },
          helpText: 'Consejo: Seleccionar tipos de comprador relevantes nos ayuda a identificar programas que podrían ahorrarte dinero o proporcionar mejores términos.'
        },
        contact: {
          sectionTitle: 'Información de Contacto',
          required: 'Requerido',
          fields: {
            firstName: 'Nombre',
            lastName: 'Apellido',
            email: 'Correo Electrónico',
            phone: 'Número de Teléfono'
          },
          consent: {
            title: 'Consentimiento de Comunicación',
            phone: 'Consiento en recibir llamadas sobre mi consulta de compra de vivienda',
            sms: 'Consiento en recibir mensajes de texto con actualizaciones e información',
            email: 'Consiento en recibir correos electrónicos con actualizaciones del mercado y contenido educativo',
            description: 'Al enviar este formulario, aceptas ser contactado por teléfono, SMS, o correo electrónico. Esta estimación es solo para propósitos educativos y no constituye una aprobación o compromiso de préstamo.'
          },
          streaming: {
            title: 'Generando Tu Reporte Personalizado',
            timeEstimate: 'Esto tomará aproximadamente 40-60 segundos. Por favor espera...',
            aiGenerating: 'IA Generando...',
            generatingPlan: 'Generando Tu Plan...',
            success: '¡Reporte generado exitosamente!',
            characterCount: 'Generados {{count}} caracteres',
            charactersGenerated: '{{count}} caracteres generados...'
          },
          submitButton: 'Generar Mi Plan de Compra de Vivienda',
          generating: 'Generando Tu Plan...',
          submissionFailed: 'Envío Fallido',
          privacyNote: 'Tu información es segura y solo se usará para proporcionarte recomendaciones personalizadas de compra de casa y asistencia.',
          phonePlaceholder: '(555) 123-4567',
          generatePlan: 'Generar Mi Plan',
          errorGenerate: 'Error al generar el plan. Por favor intenta de nuevo.'
        }
      },
      validation: {
        timelineRequired: 'El cronograma es requerido',
        targetPriceRequired: 'El precio objetivo es requerido',
        monthlyBudgetRequired: 'El presupuesto mensual es requerido',
        annualIncomeRequired: 'Un ingreso anual válido es requerido',
        monthlyDebtsNegative: 'Las deudas mensuales no pueden ser negativas',
        creditScoreRequired: 'El rango de puntaje crediticio es requerido',
        downPaymentRequired: 'La información del pago inicial es requerida',
        employmentTypeRequired: 'El tipo de empleo es requerido',
        firstNameRequired: 'El nombre es requerido',
        lastNameRequired: 'El apellido es requerido',
        emailRequired: 'La dirección de correo electrónico es requerida',
        emailInvalid: 'Por favor ingresa una dirección de correo electrónico válida',
        phoneRequired: 'El número de teléfono es requerido',
        phoneInvalid: 'Por favor ingresa un número de teléfono válido',
        generalError: 'Ocurrió un error de validación'
      },
      shared: {
        tip: 'Consejo:',
        errorTitle: 'Por favor corrige lo siguiente:',
        formValidationErrors: 'Errores de Validación del Formulario',
        unexpectedError: 'Ocurrió un error inesperado',
        somethingWrong: 'Algo salió mal',
        tryAgain: 'Intentar de Nuevo',
        reloadPage: 'Recargar Página',
        errorDetails: 'Detalles del Error (Desarrollo)',
        validating: 'Validando...',
        perMonth: '/mes'
      },
      cityAutocomplete: {
        metroBadge: 'Metro',
        noCitiesFound: 'No se encontraron ciudades de Texas para "{{query}}"',
        tryDifferentCity: 'Intenta con una ciudad diferente de Texas'
      },
      progressRestoration: {
        title: '¿Continuar tu Progreso?',
        description: 'Encontramos tu sesión anterior del asistente. ¿Te gustaría continuar donde lo dejaste?',
        progress: 'Progreso:',
        completed: 'Completado:',
        lastSaved: 'Guardado:',
        steps: 'pasos',
        stepOf: 'Paso {{current}} de {{total}}',
        continueProgress: 'Continuar Progreso',
        startFresh: 'Empezar de Nuevo',
        dismiss: 'Descartar',
        autoSaveNote: 'Tu progreso se guarda automáticamente y expira después de 24 horas.',
        progressSaved: 'Progreso guardado'
      },
      stepIndicator: {
        navLabel: 'Indicador de progreso de pasos',
        totalStepsLabel: '{{count}} pasos en total',
        stepOf: 'Paso {{current}} de {{total}}',
        breadcrumbLabel: 'Navegación de ruta',
        progressSummaryLabel: 'Resumen de progreso',
        currentStepAnnouncement: 'Actualmente en el paso {{current}}: {{title}}',
        statusLabels: {
          completed: 'Completado',
          current: 'Paso actual',
          available: 'Disponible',
          upcoming: 'Próximo'
        },
        actionDescriptions: {
          clickToNavigate: 'Haz clic para navegar a este paso',
          currentStep: 'Actualmente estás en este paso',
          futureStep: 'Este paso estará disponible después de completar los pasos anteriores'
        },
        progressSummary: {
          stepOf: 'Paso {{current}} de {{total}}',
          completedProgress: '{{completed}} completados • {{percentage}}% hecho',
          detailedProgress: 'Detalles del progreso: Has completado {{completed}} de {{total}} pasos. Actualmente estás en el paso {{current}}. Progreso general: {{percentage}} por ciento completo.'
        }
      },
      navigation: {
        back: 'Atrás',
        nextStep: 'Siguiente Paso',
        processing: 'Procesando...',
        transitioning: 'Transicionando...',
        ariaLabels: {
          goBackToPrevious: 'Ir al paso anterior',
          processingWait: 'Procesando, por favor espera',
          continueToNext: 'Continuar al siguiente paso'
        }
      },
      loading: {
        default: 'Cargando...',
        form: 'Cargando formulario...',
        options: 'Cargando opciones...',
        list: 'Cargando lista...'
      },
      service: {
        apiError: 'Servicio temporalmente no disponible',
        networkError: 'Error de conexión de red',
        unexpectedError: 'Ocurrió un error inesperado'
      }
    },
    pages: {
      home: {
        header: {
          badge: '🏠 Tu Experto en Compra de Casas en Austin',
          title: 'Encuentra Tu',
          titleHighlight: 'Casa en Austin',
          titleSuffix: 'con Orientación Experta',
          subtitle: 'Tu REALTOR® bilingüe de confianza que sirve a Austin, Round Rock, Pflugerville y áreas circundantes. Especializado en compradores primerizos, clientes ITIN y profesionales autónomos.',
          ctaPrimary: 'Comienza Tu Jornada',
          ctaSecondary: 'Ver Cómo Funciona',
          ctaSecondaryMobile: 'Saber Más'
        },
        nav: {
          features: 'Características',
          howItWorks: 'Cómo Funciona',
          testimonials: 'Historias de Éxito',
          languageToggle: 'EN / ES',
          closeMenu: 'Cerrar menú',
          openMenu: 'Abrir menú'
        },
        hero: {
          sullyBadge: '🏆 Más de 200 Familias Atendidas',
          sullyLanguages: '🌎 EN/ES',
          sullyTitle: 'Sully Ruiz, REALTOR®',
          sullyCompany: 'Keller Williams Austin NW',
          formTitle: 'Conéctate con Sully Hoy',
          formSubtitle: 'Obtén tu análisis gratuito del mercado de Austin y estrategia personalizada de compra de vivienda',
          successTitle: '¡Gracias!',
          successMessage: 'Tu información ha sido enviada exitosamente. Sully se pondrá en contacto contigo pronto para discutir tus objetivos de compra de vivienda.',
          successCta: 'Comenzar Consulta Completa'
        },
        stats: {
          families: 'Más de 200',
          familiesLabel: 'Familias de Austin Atendidas',
          experience: 'Más de 5',
          experienceLabel: 'Años en el Mercado de Austin',
          languages: 'English / Español',
          languagesLabel: 'Servicio Bilingüe'
        },
        features: {
          badge: '✨ Servicios Inmobiliarios Completos',
          title: 'Todo lo que Necesitas para',
          titleHighlight: 'Comprar con Confianza',
          subtitle: 'Desde la consulta inicial hasta el día de cierre, Sully proporciona orientación experta a través de cada paso de tu proceso de compra de vivienda en Austin',
          firstTime: {
            icon: '🏠',
            title: 'Experiencia en Compradores Primerizos',
            description: 'Orientación especializada para compradores de vivienda por primera vez navegando el mercado de Austin, incluyendo programas de asistencia para pago inicial y préstamos FHA.'
          },
          itin: {
            icon: '💼',
            title: 'Apoyo ITIN y Autónomos',
            description: 'Asistencia experta para portadores de ITIN y profesionales autónomos con documentación de ingresos alternativa y programas de préstamos especializados.'
          },
          bilingual: {
            icon: '🌎',
            title: 'Servicio Bilingüe (EN/ES)',
            description: 'Servicios inmobiliarios completos en inglés y español, asegurando comunicación clara durante todo tu proceso de compra de vivienda.'
          },
          marketAnalysis: {
            icon: '📈',
            title: 'Análisis del Mercado de Austin',
            description: 'Conocimiento profundo del mercado local cubriendo Austin, Round Rock, Pflugerville, Georgetown, Hutto y Cedar Park con tendencias de precios actuales.'
          },
          negotiation: {
            icon: '🤝',
            title: 'Experiencia en Negociación',
            description: 'Habilidades sólidas de negociación para asegurar el mejor trato posible, ya sea en un mercado competitivo o trabajando con vendedores motivados.'
          },
          network: {
            icon: '🏢',
            title: 'Red de Keller Williams',
            description: 'Acceso a la poderosa red de Keller Williams de prestamistas, inspectores, contratistas y otros profesionales para apoyar tu transacción.'
          }
        },
        howItWorks: {
          title: 'Cómo Funciona',
          subtitle: 'Tres simples pasos para comenzar tu proceso de compra de vivienda en Austin con Sully',
          step1: {
            number: '01',
            title: 'Consulta Inicial',
            description: 'Reúnete con Sully para discutir tus objetivos, presupuesto, cronograma y vecindarios preferidos de Austin. Esta consulta siempre es gratuita y sin presión.'
          },
          step2: {
            number: '02',
            title: 'Estrategia de Mercado',
            description: 'Sully crea una estrategia personalizada de búsqueda de vivienda, te conecta con prestamistas de confianza y te guía a través de la preaprobación.'
          },
          step3: {
            number: '03',
            title: 'Encontrar y Cerrar',
            description: 'Comienza a visitar casas, haz ofertas competitivas con apoyo experto en negociación y cierra en tu casa de ensueño en Austin.'
          },
          cta: 'Comienza Tu Jornada'
        },
        testimonials: {
          title: 'Confiado por Familias de Austin',
          subtitle: 'Escucha de verdaderos propietarios de Austin que lograron sus sueños con la orientación experta de Sully',
          maria: {
            quote: 'Sully nos ayudó a navegar nuestra primera compra de vivienda con paciencia y experiencia. Su apoyo bilingüe hizo toda la diferencia para nuestra familia. ¡Gracias, Sully!',
            author: 'María y Carlos González',
            role: 'Compradores Primerizos',
            location: 'Round Rock, TX'
          },
          james: {
            quote: 'Como contratista autónomo, pensé que comprar una casa sería imposible. Sully me conectó con el prestamista correcto y cerramos en 45 días!',
            author: 'James Martínez',
            role: 'Contratista Autónomo',
            location: 'Pflugerville, TX'
          },
          sarah: {
            quote: 'El conocimiento de Sully del mercado de Austin nos ayudó a encontrar la casa perfecta en Georgetown. ¡Sus habilidades de negociación nos ahorraron $15,000!',
            author: 'Sarah y Mike Johnson',
            role: 'Familia en Crecimiento',
            location: 'Georgetown, TX'
          }
        },
        finalCta: {
          title: '¿Listo para Encontrar Tu Casa en Austin?',
          subtitle: 'Contacta a Sully hoy para tu consulta gratuita y análisis de mercado. Experimenta la diferencia de trabajar con un experto local de confianza que habla tu idioma.',
          ctaPrimary: 'Contacta a Sully Hoy',
          ctaSecondary: 'Llama al (512) 412-2352'
        }
      },
    },
    components: {
      heroForm: {
        fields: {
          firstName: 'Nombre',
          lastName: 'Apellido',
          email: 'Correo Electrónico',
          phone: 'Número de Teléfono',
          income: 'Ingresos Anuales del Hogar'
        },
        incomeOptions: {
          default: 'Seleccionar rango de ingresos',
          '30k50k': '$30,000 - $50,000',
          '50k75k': '$50,000 - $75,000',
          '75k100k': '$75,000 - $100,000',
          '100k150k': '$100,000 - $150,000',
          '150kPlus': '$150,000+'
        },
        submitButton: 'Obtener Mi Plan Personalizado',
        submittingButton: 'Procesando...',
        helpText: 'Esto nos ayuda a proporcionar estimaciones precisas de asequibilidad',
        privacyTitle: 'Seguro y Privado',
        privacyNotice: 'Al enviar, aceptas nuestra política de privacidad. Sin spam, nunca.'
      },
      footer: {
        company: {
          description: 'Tu REALTOR® bilingüe de confianza especializado en compradores primerizos, clientes ITIN y bienes raíces del área de Austin.',
          tagline: 'Servicio en Español'
        },
        services: {
          title: 'Servicios',
          firstTimeBuyers: 'Compradores Primerizos',
          itinSupport: 'Apoyo ITIN',
          bilingualService: 'Servicio Bilingüe',
          marketAnalysis: 'Análisis de Mercado'
        },
        serviceAreas: {
          title: 'Áreas de Servicio',
          austin: 'Austin',
          roundRock: 'Round Rock',
          pflugerville: 'Pflugerville',
          georgetown: 'Georgetown',
          hutto: 'Hutto',
          cedarPark: 'Cedar Park'
        },
        contact: {
          title: 'Contacto',
          email: 'realtor@sullyruiz.com',
          phone: '(512) 412-2352',
          license: 'Licenciado en Texas',
          company: 'Keller Williams Austin NW',
          whatsapp: 'WhatsApp Disponible'
        },
        legal: {
          texasNotice: 'Aviso de Protección al Consumidor de la Comisión de Bienes Raíces de Texas',
          texasInfo: 'Información de la Comisión de Bienes Raíces de Texas Sobre Servicios de Corretaje',
          termsOfUse: 'Términos de Uso',
          privacyPolicy: 'Política de Privacidad',
          cookiePolicy: 'Política de Cookies',
          dmca: 'DMCA',
          fairHousing: 'Vivienda Justa',
          accessibility: 'Accesibilidad',
          kwCopyright: 'Keller Williams Realty, Inc., una empresa de franquicias, es un Empleador de Igualdad de Oportunidades y apoya la Ley de Vivienda Justa. Cada oficina de Keller Williams® es de propiedad y operación independiente.',
          kwCopyright2: 'Copyright © 1996-2025 Keller Williams Realty, Inc. Todos los derechos reservados.',
          sullyRights: '© 2025 Sully Ruiz, REALTOR®. Todos los derechos reservados.'
        }
      },
    },
    form: {
      validation: {
        required: 'Este campo es obligatorio',
        email: 'Por favor ingrese un correo electrónico válido',
        phone: 'Por favor ingrese un número de teléfono válido',
        tooShort: 'Muy corto',
        tooLong: 'Muy largo',
        invalidNumber: 'Por favor ingrese un número válido',
        tooYoung: 'Debe tener al menos 18 años'
      },
      saveProgress: 'Guardar Progreso',
      restoreProgress: 'Restaurar Sesión Anterior',
      clearProgress: 'Empezar de Nuevo',
      autoSave: 'Guardado automático',
      unsavedChanges: 'Tienes cambios sin guardar'
    },
    accessibility: {
      skipToContent: 'Saltar al contenido principal',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      languageSelector: 'Seleccionar idioma',
      darkModeToggle: 'Alternar modo oscuro',
      currentLanguage: 'Idioma actual: Español'
    }
  }
};

export function getNestedTranslation(
  translations: Translation,
  path: string
): string {
  const keys = path.split('.');
  let current: any = translations;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the path if translation not found
    }
  }

  return typeof current === 'string' ? current : path;
}