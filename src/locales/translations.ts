import { LanguageCode } from '../types';

export interface SMSTemplateParams {
  title: string;
  location: string;
  date: string;
  duration: number | string;
  rate: number | string;
  workers?: number | string;
  time?: string;
}

export const SMS_TEMPLATES = {
  en: {
    opportunity: (p: SMSTemplateParams) => 
`SHRAMIK
New work opportunity.
${p.title}
Location: ${p.location}
Date: ${p.date}
Duration: ${p.duration} days
Payment: ₹${p.rate}/day

Reply:
1 — View Details
0 — Ignore`,

    details: (p: SMSTemplateParams) =>
`SHRAMIK
JOB DETAILS
${p.title}
Location: ${p.location}
Start: ${p.date}
Duration: ${p.duration} days
Payment: ₹${p.rate}/day
Workers needed: ${p.workers || 10}

Reply:
1 — ACCEPT WORK
0 — REJECT`,

    accepted: (p: SMSTemplateParams) =>
`SHRAMIK
Work accepted!
You have accepted "${p.title}". The customer will confirm your assignment shortly.`,

    rejected: (p: SMSTemplateParams) =>
`SHRAMIK
Opportunity declined for "${p.title}". We will notify you of upcoming work matches.`,

    assigned: (p: SMSTemplateParams) =>
`SHRAMIK
You have been assigned:
${p.title}
Location: ${p.location}
Start: ${p.date}
Payment: ₹${p.rate}/day
Please report at ${p.time || '8:00 AM'}.

Reply 1 to confirm.`,

    invalidReply: () =>
`SHRAMIK: Please reply 1 to view details or 0 to ignore. Once details arrive, reply 1 to accept or 0 to reject.`
  },

  hi: {
    opportunity: (p: SMSTemplateParams) => 
`SHRAMIK
नया काम उपलब्ध है।
${p.title}
स्थान: ${p.location}
तारीख: ${p.date}
अवधि: ${p.duration} दिन
भुगतान: ₹${p.rate}/दिन

उत्तर दें:
1 — विवरण देखें
0 — छोड़ें`,

    details: (p: SMSTemplateParams) =>
`SHRAMIK
काम का पूरा विवरण
${p.title}
स्थान: ${p.location}
शुरू: ${p.date}
अवधि: ${p.duration} दिन
भुगतान: ₹${p.rate}/दिन
कामगार आवश्यकता: ${p.workers || 10}

उत्तर दें:
1 — काम स्वीकारें
0 — अस्वीकार करें`,

    accepted: (p: SMSTemplateParams) =>
`SHRAMIK
काम स्वीकार कर लिया गया है!
आपने "${p.title}" स्वीकार किया। ग्राहक शीघ्र ही अंतिम आवंटन की पुष्टि करेगा।`,

    rejected: (p: SMSTemplateParams) =>
`SHRAMIK
आपने "${p.title}" अस्वीकार कर दिया है। हम आपको अन्य अवसरों की सूचना देंगे।`,

    assigned: (p: SMSTemplateParams) =>
`SHRAMIK
आपको काम सौंपा गया है:
${p.title}
स्थान: ${p.location}
शुरू: ${p.date}
भुगतान: ₹${p.rate}/दिन
कृपया सुबह ${p.time || '8:00 AM'} बजे रिपोर्ट करें।

पुष्टि के लिए 1 दबाएँ।`,

    invalidReply: () =>
`SHRAMIK: कृपया विवरण देखने के लिए 1 या छोड़ने के लिए 0 भेजें। विवरण मिलने पर स्वीकार करने हेतु 1 दबाएँ।`
  },

  mr: {
    opportunity: (p: SMSTemplateParams) => 
`SHRAMIK
नवीन काम उपलब्ध आहे.
${p.title}
स्थान: ${p.location}
तारीख: ${p.date}
कालावधी: ${p.duration} दिवस
मोबदला: ₹${p.rate}/दिवस

उत्तर द्या:
1 — तपशील पहा
0 — दुर्लक्ष करा`,

    details: (p: SMSTemplateParams) =>
`SHRAMIK
कामाचा संपूर्ण तपशील
${p.title}
स्थान: ${p.location}
सुरुवात: ${p.date}
कालावधी: ${p.duration} दिवस
मोबदला: ₹${p.rate}/दिवस
कामगार संख्या: ${p.workers || 10}

उत्तर द्या:
1 — काम स्वीकारा
0 — नकार द्या`,

    accepted: (p: SMSTemplateParams) =>
`SHRAMIK
काम स्वीकारले आहे!
तुम्ही "${p.title}" काम स्वीकारले आहे. ग्राहक लवकरच कामाची अंतिम पुष्टी करेल.`,

    rejected: (p: SMSTemplateParams) =>
`SHRAMIK
तुम्ही "${p.title}" काम नाकारले आहे. आम्ही पुढील संधींची माहिती पाठवू.`,

    assigned: (p: SMSTemplateParams) =>
`SHRAMIK
तुम्हाला काम नेमून दिले आहे:
${p.title}
स्थान: ${p.location}
सुरुवात: ${p.date}
मोबदला: ₹${p.rate}/दिवस
कृपया सकाळी ${p.time || '8:00 AM'} वाजता हजर राहा.

पुष्टीसाठी 1 दाबा.`,

    invalidReply: () =>
`SHRAMIK: कृपया तपशील पाहण्यासाठी 1 किंवा सोडण्यासाठी 0 पाठवा. तपशील आल्यावर काम स्वीकारण्यासाठी 1 दाबा.`
  }
};

export const UI_TRANSLATIONS = {
  en: {
    brand: "SHRAMIK-QUOTE",
    tagline: "Work should reach the worker.",
    subtitle: "One mobile number. More opportunities.",
    nav: {
      dashboard: "Dashboard",
      createWork: "Create Work",
      findWorkers: "Find Workers",
      myWork: "My Work",
      history: "History",
      profile: "Profile",
      login: "Login",
      register: "Get Started",
      logout: "Logout",
      smsPanel: "SMS Demo Log"
    },
    hero: {
      title: "WORK SHOULD REACH THE WORKER.",
      description: "Shramik connects customers with skilled local freelancers and delivers work opportunities directly to workers through the web and SMS.",
      getStarted: "Get Started",
      howItWorks: "How It Works",
      rolePromptTitle: "WHO ARE YOU?",
      rolePromptDesc: "Select your role to enter Shramik",
      customerCardTitle: "Customer / Contractor",
      customerCardDesc: "I need skilled people to do work.",
      customerCardExamples: "Plumbers, Painters, Carpenters, Masons, Electricians",
      customerCardBtn: "Register as Customer",
      freelancerCardTitle: "Freelancer / Worker",
      freelancerCardDesc: "I want to find and accept work.",
      freelancerCardExamples: "Receive opportunities via SMS, build work history",
      freelancerCardBtn: "Register as Freelancer"
    },
    problem: {
      tag: "THE PROBLEM",
      title: "GREAT WORKERS SHOULDN'T MISS OPPORTUNITIES BECAUSE OF CONNECTIVITY.",
      desc1: "Many skilled local workers depend on simple mobile phones with intermittent internet access. They have the expertise, the tools, and the dedication, but miss out on digital job boards.",
      desc2: "Shramik gives customers a sleek web workspace to organize projects, while bridging directly to workers over plain SMS. Zero apps. Zero internet required for workers."
    },
    howItWorksSection: {
      tag: "SIMPLE PROCESS",
      title: "HOW SHRAMIK WORKS",
      step1Title: "REGISTER",
      step1Desc: "Customer posts work online; Freelancer creates a profile.",
      step2Title: "CREATE WORK",
      step2Desc: "Customer defines location, trade skill, daily wage, and dates.",
      step3Title: "FIND WORKERS",
      step3Desc: "System matches verified local freelancers by skill, distance, and rating.",
      step4Title: "SEND SMS",
      step4Desc: "Selected workers receive instant SMS opportunity on their mobile.",
      step5Title: "REPLY 1 OR 0",
      step5Desc: "Worker replies 1 for details, then 1 to accept or 0 to reject.",
      step6Title: "COMPLETE & RECORD",
      step6Desc: "Customer assigns work; upon completion, verified work history is logged."
    },
    smsFeature: {
      tag: "THE SMS BRIDGE",
      title: "NO APP. NO BROWSER. JUST A MESSAGE.",
      desc: "Workers in low-connectivity areas never miss a wage. A simple two-digit response allows instant job acceptance.",
      demoTitle: "Interactive 2D Message Flow",
      step1Label: "1. Work Opportunity Sent",
      step2Label: "2. Worker Replies 1 for Details",
      step3Label: "3. Full Terms Delivered",
      step4Label: "4. Worker Replies 1 to Accept",
      step5Label: "5. Real-Time Dashboard Updated"
    }
  },

  hi: {
    brand: "श्रमिक-कोट",
    tagline: "काम कामगार तक पहुँचना चाहिए।",
    subtitle: "एक मोबाइल नंबर। अधिक अवसर।",
    nav: {
      dashboard: "डैशबोर्ड",
      createWork: "काम जोड़ें",
      findWorkers: "कामगार खोजें",
      myWork: "मेरा काम",
      history: "कार्य इतिहास",
      profile: "प्रोफाइल",
      login: "लॉगिन",
      register: "शुरू करें",
      logout: "लॉगआउट",
      smsPanel: "एसएमएस डेमो लॉग"
    },
    hero: {
      title: "काम कामगार तक पहुँचना चाहिए।",
      description: "श्रमिक ग्राहकों को कुशल स्थानीय फ्रीलांसरों से जोड़ता है और इंटरनेट न होने पर भी सीधे एसएमएस के माध्यम से काम के अवसर पहुंचाता है।",
      getStarted: "शुरू करें",
      howItWorks: "यह कैसे काम करता है",
      rolePromptTitle: "आप कौन हैं?",
      rolePromptDesc: "श्रमिक में प्रवेश के लिए अपनी भूमिका चुनें",
      customerCardTitle: "ग्राहक / ठेकेदार",
      customerCardDesc: "मुझे काम करवाने के लिए कुशल कारीगर चाहिए।",
      customerCardExamples: "प्लम्बर, पेंटर, बढ़ई, राजमिस्त्री, इलेक्ट्रीशियन",
      customerCardBtn: "ग्राहक के रूप में जुड़ें",
      freelancerCardTitle: "फ्रीलांसर / कामगार",
      freelancerCardDesc: "मैं काम पाना और स्वीकार करना चाहता हूँ।",
      freelancerCardExamples: "एसएमएस से काम पाएं, कार्य इतिहास बनाएं",
      freelancerCardBtn: "कामगार के रूप में जुड़ें"
    },
    problem: {
      tag: "समस्या",
      title: "कनेक्टिविटी की कमी से कोई भी कुशल कामगार अवसर से वंचित न रहे।",
      desc1: "कई कुशल कामगार सामान्य फोन का उपयोग करते हैं और हमेशा इंटरनेट उपलब्ध नहीं होता। कौशल और अनुभव होने के बावजूद वे डिजिटल अवसरों से चूक जाते हैं।",
      desc2: "श्रमिक ग्राहकों को एक व्यवस्थित वेब पोर्टल देता है, जबकि कामगारों तक एसएमएस द्वारा सीधे काम पहुँचाता है।"
    },
    howItWorksSection: {
      tag: "आसान प्रक्रिया",
      title: "श्रमिक कैसे काम करता है",
      step1Title: "पंजीकरण",
      step1Desc: "ग्राहक काम पोस्ट करता है; कामगार प्रोफाइल बनाता है।",
      step2Title: "काम बनाएं",
      step2Desc: "काम का प्रकार, स्थान, दैनिक मजदूरी और तारीख तय करें।",
      step3Title: "कामगार खोजें",
      step3Desc: "सिस्टम कौशल, दूरी और रेटिंग के आधार पर सही कामगार खोजता है।",
      step4Title: "एसएमएस भेजें",
      step4Desc: "चुने हुए कामगारों को तुरंत मोबाइल पर एसएमएस मिलता है।",
      step5Title: "1 या 0 दबाएँ",
      step5Desc: "विवरण के लिए 1, काम स्वीकारने के लिए 1 या मना करने के लिए 0 भेजें।",
      step6Title: "काम पूरा व इतिहास",
      step6Desc: "ग्राहक काम सौंपता है और पूरा होने पर इतिहास में दर्ज होता है।"
    },
    smsFeature: {
      tag: "एसएमएस सुविधा",
      title: "न ऐप. न ब्राउज़र. सिर्फ एक सामान्य संदेश।",
      desc: "कम नेटवर्क वाले क्षेत्र के कामगार भी काम स्वीकार सकते हैं।",
      demoTitle: "2D संदेश प्रवाह",
      step1Label: "1. काम का अवसर भेजा गया",
      step2Label: "2. कामगार ने विवरण के लिए 1 भेजा",
      step3Label: "3. पूर्ण विवरण प्राप्त हुआ",
      step4Label: "4. कामगार ने स्वीकार करने के लिए 1 भेजा",
      step5Label: "5. ग्राहक डैशबोर्ड तुरंत अपडेट हुआ"
    }
  },

  mr: {
    brand: "श्रमिक-कोट",
    tagline: "काम कामगारापर्यंत पोहोचले पाहिजे.",
    subtitle: "एक मोबाईल क्रमांक. अधिक संधी.",
    nav: {
      dashboard: "डॅशबोर्ड",
      createWork: "काम तयार करा",
      findWorkers: "कामगार शोधा",
      myWork: "माझे काम",
      history: "इतिहास",
      profile: "प्रोफाइल",
      login: "लॉगिन",
      register: "सुरुवात करा",
      logout: "बाहेर पडा",
      smsPanel: "एसएमएस डेमो लॉग"
    },
    hero: {
      title: "काम कामगारापर्यंत पोहोचले पाहिजे.",
      description: "श्रमिक ग्राहकांना कुशल स्थानिक कामगारांशी जोडते आणि इंटरनेट मर्यादा असली तरी थेट एसएमएस द्वारे कामाच्या संधी पोहोचवते.",
      getStarted: "सुरुवात करा",
      howItWorks: "हे कसे चालते",
      rolePromptTitle: "तुम्ही कोण आहात?",
      rolePromptDesc: "श्रमिक मध्ये प्रवेश करण्यासाठी तुमची भूमिका निवडा",
      customerCardTitle: "ग्राहक / कंत्राटदार",
      customerCardDesc: "मला काम करून घेण्यासाठी कुशल माणसे हवी आहेत.",
      customerCardExamples: "प्लंबर, पेंटर, सुतार, गवंडी, इलेक्ट्रिशियन",
      customerCardBtn: "ग्राहक म्हणून नोंदणी करा",
      freelancerCardTitle: "फ्रीलांसर / कामगार",
      freelancerCardDesc: "मला काम शोधायचे आणि स्वीकारायचे आहे.",
      freelancerCardExamples: "एसएमएस द्वारे कामाची माहिती, अनुभवाचा इतिहास",
      freelancerCardBtn: "कामगार म्हणून नोंदणी करा"
    },
    problem: {
      tag: "समस्या",
      title: "इंटरनेट नसल्यामुळे कोणत्याही कुशल कामगाराची संधी वाया जाऊ नये.",
      desc1: "अनेक कुशल स्थानिक कामगारांकडे साधा मोबाईल असतो. कौशल्य आणि प्रामाणिकपणा असूनही इंटरनेट नसल्याने ते डिजिटल संधींपासून वंचित राहतात.",
      desc2: "श्रमिक ग्राहकांना कामाचे नियोजन करण्यासाठी वेब पोर्टल देते आणि कामगारांपर्यंत थेट एसएमएस द्वारे काम पोहोचवते."
    },
    howItWorksSection: {
      tag: "सोपी पद्धत",
      title: "श्रमिक कसे काम करते",
      step1Title: "नोंदणी",
      step1Desc: "ग्राहक काम नोंदवतो; कामगार आपली माहिती भरतो.",
      step2Title: "काम तयार करा",
      step2Desc: "कौशल्य, ठिकाण, रोजंदारी आणि दिवस ठरवा.",
      step3Title: "कामगार शोधा",
      step3Desc: "सिस्टम कौशल्य आणि अंतरावर आधारित योग्य कामगार शोधते.",
      step4Title: "एसएमएस पाठवा",
      step4Desc: "निवडलेल्या कामगारांना थेट मोबाईलवर एसएमएस जातो.",
      step5Title: "1 किंवा 0 पाठवा",
      step5Desc: "तपशीलासाठी 1, काम स्वीकारण्यासाठी 1 किंवा नकार देण्यासाठी 0 पाठवा.",
      step6Title: "पूर्ण आणि नोंद",
      step6Desc: "काम पूर्ण झाल्यावर कामगाराच्या अनुभवात नोंद होते."
    },
    smsFeature: {
      tag: "एसएमएस वैशिष्ट्य",
      title: "कोणतेही ॲप नाही. ब्राउझर नाही. फक्त एक साधा संदेश.",
      desc: "कमी नेटवर्क असलेल्या भागातील कामगारही साध्या मेसेजने काम स्वीकारू शकतात.",
      demoTitle: "2D संदेश प्रवाह",
      step1Label: "1. कामाची संधी पाठवली",
      step2Label: "2. कामगाराने 1 पाठवून तपशील मागितला",
      step3Label: "3. कामाचा संपूर्ण तपशील पोहोचला",
      step4Label: "4. कामगाराने 1 पाठवून काम स्वीकारले",
      step5Label: "5. ग्राहक डॅशबोर्ड त्वरित अपडेट झाला"
    }
  }
};
