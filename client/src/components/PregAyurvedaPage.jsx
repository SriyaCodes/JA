import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaBookmark, FaLeaf, FaBaby } from 'react-icons/fa';
import translations from './Pregtranslations';
import Navbar from '../components/Navbar';
import navbarTranslations from '../translations/navbarTranslations'; 
const PregAyurvedaPage = () => {
  const [userData, setUserData] = useState(null);
  const [streak, setStreak]   = useState(0); 
  const [language, setLanguage] = useState('en-IN');
  const [bookmarked, setBookmarked] = useState([]);
  const [trimester, setTrimester] = useState(1);
  const auth = getAuth();
  const t = translations[language] || translations['en-IN'];
  // Pregnancy Ayurvedic remedies organized by trimester and language
  const ayurvedicRemedies = {
    'en-IN': { // English
    1: [ // First Trimester
      {
        id: 101,
        title: 'Ginger-Lemon Infusion',
        description: 'Natural remedy for morning sickness and nausea',
        benefits: [
          'Reduces nausea and vomiting',
          'Aids digestion',
          'Boosts immunity',
          'Hydrates the body'
        ],
        ingredients: [
          '1 cup warm water',
          '1 inch fresh ginger (thinly sliced)',
          '1 tbsp lemon juice',
          '1 tsp honey (optional)'
        ],
        preparation: [
          'Boil water and add ginger slices',
          'Let steep for 5-7 minutes',
          'Strain and add lemon juice',
          'Add honey if desired',
          'Sip slowly throughout the day'
        ],
        duration: 'As needed during first trimester',
        precautions: 'Avoid excessive amounts if you have heartburn',
        image:'/assets/gingerlemon.jpg'
      },
      {
        id: 102,
        title: 'Coconut Water Elixir',
        description: 'Replenishes electrolytes and prevents dehydration',
        benefits: [
          'Rich in natural electrolytes',
          'Prevents urinary infections',
          'Cooling for the body',
          'Provides essential minerals'
        ],
        ingredients: [
          '1 cup fresh coconut water',
          '1 tsp coriander powder',
          'Pinch of rock salt'
        ],
        preparation: [
          'Mix all ingredients well',
          'Drink fresh in the morning',
          'Can be consumed 2-3 times weekly'
        ],
        duration: '2-3 times per week',
        precautions: 'Avoid if allergic to coconut',
        image:'/assets/coconut.jpg'
      },
      {
        id: 103,
        title: 'Fennel Seed Tea',
        description: 'Digestive aid for early pregnancy discomfort',
        benefits: [
          'Relieves bloating and gas',
          'Reduces acidity',
          'Calms the stomach',
          'Improves appetite'
        ],
        ingredients: [
          '1 tsp fennel seeds',
          '1 cup hot water',
          '1 tsp honey (optional)'
        ],
        preparation: [
          'Crush fennel seeds lightly',
          'Steep in hot water for 5 minutes',
          'Strain and add honey if desired',
          'Drink after meals'
        ],
        duration: 'Daily after meals',
        precautions: 'Limit to 2 cups per day',
        image:'/assets/fenneltea.jpg'
      }
    ],
    
  },
    'hi-IN': {
  1: [ // पहली तिमाही
    {
      id: 101,
      title: 'अदरक-नींबू का काढ़ा',
      description: 'सुबह की उल्टी और मतली के लिए प्राकृतिक उपचार',
      benefits: [
        'मतली और उल्टी को कम करता है',
        'पाचन में सहायक',
        'प्रतिरक्षा प्रणाली को बढ़ाता है',
        'शरीर को हाइड्रेट करता है'
      ],
      ingredients: [
        '1 कप गर्म पानी',
        '1 इंच ताज़ा अदरक (पतले स्लाइस में काटा हुआ)',
        '1 टेबलस्पून नींबू का रस',
        '1 टीस्पून शहद (वैकल्पिक)'
      ],
      preparation: [
        'पानी उबालें और उसमें अदरक डालें',
        '5-7 मिनट तक भिगोकर रखें',
        'छानकर उसमें नींबू का रस मिलाएं',
        'इच्छा अनुसार शहद मिलाएं',
        'दिन भर धीरे-धीरे पीएं'
      ],
      duration: 'पहली तिमाही के दौरान आवश्यकता अनुसार',
      precautions: 'यदि एसिडिटी हो तो अधिक मात्रा में सेवन न करें',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'नारियल पानी अमृत',
      description: 'इलेक्ट्रोलाइट की पूर्ति और डिहाइड्रेशन से बचाव',
      benefits: [
        'प्राकृतिक इलेक्ट्रोलाइट्स से भरपूर',
        'मूत्र संक्रमण को रोकता है',
        'शरीर को ठंडक प्रदान करता है',
        'आवश्यक खनिज प्रदान करता है'
      ],
      ingredients: [
        '1 कप ताज़ा नारियल पानी',
        '1 टीस्पून धनिया पाउडर',
        'चुटकी भर सेंधा नमक'
      ],
      preparation: [
        'सभी सामग्री को अच्छे से मिलाएं',
        'सुबह ताज़ा पीएं',
        'सप्ताह में 2-3 बार सेवन कर सकते हैं'
      ],
      duration: 'सप्ताह में 2-3 बार',
      precautions: 'यदि नारियल से एलर्जी है तो सेवन न करें',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'सौंफ की चाय',
      description: 'प्रारंभिक गर्भावस्था में पाचन के लिए सहायक',
      benefits: [
        'फुलाव और गैस से राहत',
        'एसिडिटी को कम करता है',
        'पेट को शांत करता है',
        'भूख को बढ़ाता है'
      ],
      ingredients: [
        '1 टीस्पून सौंफ के दाने',
        '1 कप गर्म पानी',
        '1 टीस्पून शहद (वैकल्पिक)'
      ],
      preparation: [
        'सौंफ को हल्का कूटें',
        'गर्म पानी में 5 मिनट तक भिगोएं',
        'छानकर शहद मिलाएं (यदि चाहें)',
        'भोजन के बाद पीएं'
      ],
      duration: 'हर भोजन के बाद प्रतिदिन',
      precautions: 'दिन में अधिकतम 2 कप तक सीमित रखें',
      image:'/assets/fenneltea.jpg'
    }
  ]

       
  
},

    'ta-IN': {
  1: [ // முதல் காலம்
    {
      id: 101,
      title: 'இஞ்சி-எலுமிச்சை மூலிகை குடிநீர்',
      description: 'காலை நோய் மற்றும் வாந்திக்கு இயற்கை மருந்து',
      benefits: [
        'வாந்தி மற்றும் மயக்கத்தை குறைக்கும்',
        'செரிமானத்திற்கு உதவுகிறது',
        'நோய் எதிர்ப்பு சக்தியை அதிகரிக்கிறது',
        'உடலை ஈரமாக வைக்கிறது'
      ],
      ingredients: [
        '1 கப் சூடான தண்ணீர்',
        '1 அங்குலம் تازாக இஞ்சி (மெல்லிய துண்டுகளாக வெட்டியது)',
        '1 மேசைக்கரண்டி எலுமிச்சை சாறு',
        '1 டீஸ்பூன் தேன் (விருப்பப்படி)'
      ],
      preparation: [
        'தண்ணீரைக் கொதிக்க வைத்து அதில் இஞ்சியைச் சேர்க்கவும்',
        '5-7 நிமிடங்கள் ஊற விடவும்',
        'பின்னர் வடிகட்டி எலுமிச்சை சாறு சேர்க்கவும்',
        'தேவைப்பட்டால் தேன் சேர்க்கவும்',
        'நாள்நாளாக மெதுவாக குடிக்கவும்'
      ],
      duration: 'முதல் காலத்தில் தேவைப்படும் போதே',
      precautions: 'அதிகமாக எடுத்துக்கொள்வதை தவிர்க்கவும், அமிலத்தன்மை இருந்தால்',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'தேங்காய் நீர் எலிக்சர்',
      description: 'மின்னழுத்தங்களை நிரப்பும் மற்றும் நீரிழப்பை தடுக்கும்',
      benefits: [
        'இயற்கை மின்னழுத்தங்களில் வளமானது',
        'மூத்திர பாதை தொற்றுகளைத் தடுக்கிறது',
        'உடலுக்கு குளிர்ச்சியளிக்கிறது',
        'முக்கிய தாதுக்கள் வழங்குகிறது'
      ],
      ingredients: [
        '1 கப் புதிய தேங்காய் நீர்',
        '1 டீஸ்பூன் கொத்தமல்லி தூள்',
        'சிறிது கல் உப்பு'
      ],
      preparation: [
        'அனைத்து பொருட்களையும் நன்கு கலந்து கொள்ளவும்',
        'காலையில் புது பதமாக குடிக்கவும்',
        'வாரம் 2-3 முறை குடிக்கலாம்'
      ],
      duration: 'வாரத்திற்கு 2-3 முறை',
      precautions: 'தேங்காய்க்கு அலர்ஜி இருந்தால் தவிர்க்கவும்',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'பெருஞ்சீரகம் டீ',
      description: 'கொளுத்தல் மற்றும் எளிதில் செரிக்க இயற்கையான உதவி',
      benefits: [
        'வயிற்று வீக்கம் மற்றும் வாயு குறைக்கும்',
        'அமிலத்தன்மையை குறைக்கும்',
        'வயிற்றைப் பராமரிக்கிறது',
        'பசிக்குத் தூண்டுகிறது'
      ],
      ingredients: [
        '1 டீஸ்பூன் பெருஞ்சீரகம்',
        '1 கப் சூடான தண்ணீர்',
        '1 டீஸ்பூன் தேன் (விருப்பப்படி)'
      ],
      preparation: [
        'பெருஞ்சீரகத்தை லேசாக நசுக்கவும்',
        'சூடான தண்ணீரில் 5 நிமிடங்கள் ஊற விடவும்',
        'பின்னர் வடிகட்டி தேவைப்பட்டால் தேன் சேர்க்கவும்',
        'உணவுக்குப் பிறகு குடிக்கவும்'
      ],
      duration: 'உணவுக்குப் பிறகு தினமும்',
      precautions: 'ஒரு நாளில் அதிகபட்சம் 2 கப்புகள் மட்டும்',
      image:'/assets/fenneltea.jpg'
    }
  ]
 
},'te-IN': {
  1: [ // మొదటి త్రైమాసికం
    {
      id: 101,
      title: 'అల్లం-నిమ్మ రసం ఇన్ఫ్యూషన్',
      description: 'ఉదయ కాల వాంతులు మరియు అసౌకర్యం తగ్గించేందుకు సహజ చికిత్స',
      benefits: [
        'వాంతులు మరియు అసహ్యతను తగ్గిస్తుంది',
        'జీర్ణক্রియను మెరుగుపరుస్తుంది',
        'ఐమ్యూనిటీని పెంచుతుంది',
        'శరీరానికి తేమను అందిస్తుంది'
      ],
      ingredients: [
        '1 కప్పు గోరువెచ్చటి నీరు',
        '1 అంగుళం తాజా అల్లం (చిన్న ముక్కలుగా కట్ చేయాలి)',
        '1 టీస్పూన్ నిమ్మరసం',
        '1 టీస్పూన్ తేనె (ఐచ్ఛికం)'
      ],
      preparation: [
        'నీటిని మరిగించి అందులో అల్లం ముక్కలు వేయాలి',
        '5-7 నిమిషాలు మరిగించాలి',
        'వడకట్టి నిమ్మరసం కలపాలి',
        'తేనె కావాలంటే కలపవచ్చు',
        'రోజంతా నెమ్మదిగా తాగాలి'
      ],
      duration: 'మొదటి త్రైమాసికంలో అవసరమైనప్పుడు',
      precautions: 'హార్ట్ బర్న్ ఉంటే అధికంగా తీసుకోవడం నివారించండి',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'కొబ్బరి నీటి ఎలిక్సిర్',
      description: 'ఎలక్ట్రోలైట్లు భర్తీ చేస్తుంది మరియు డీహైడ్రేషన్ నివారిస్తుంది',
      benefits: [
        'ఇన్ఫెక్షన్లను నివారించే సహజ ఎలక్ట్రోలైట్స్‌లో సమృద్ధి',
        'మూత్రపిండాల ఇన్ఫెక్షన్లను నివారిస్తుంది',
        'శరీరానికి చల్లదనం ఇస్తుంది',
        'అవసరమైన ఖనిజాలు అందిస్తుంది'
      ],
      ingredients: [
        '1 కప్పు తాజా కొబ్బరి నీరు',
        '1 టీస్పూన్ ధనియా పొడి',
        'కొద్దిగా రాక్ సాల్ట్'
      ],
      preparation: [
        'అన్ని పదార్థాలను బాగా కలపాలి',
        'ప్రతీరోజు ఉదయం తాజాగా తాగాలి',
        'వారం లో 2-3 సార్లు తాగవచ్చు'
      ],
      duration: 'వారం లో 2-3 సార్లు',
      precautions: 'కొబ్బరికి అలర్జీ ఉంటే తాగవద్దు',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'సోంపు టీ',
      description: 'ప్రారంభ గర్భధారణ అసౌకర్యానికి జీర్ణ సాయంగా ఉపయోగపడుతుంది',
      benefits: [
        'వాంతులు, గ్యాస్ తగ్గిస్తుంది',
        'ఆమ్లతను తగ్గిస్తుంది',
        'వయిట్ శాంతిపరిచే గుణం కలిగి ఉంటుంది',
        'ఆహార రుచి పెంచుతుంది'
      ],
      ingredients: [
        '1 టీస్పూన్ సోంపు గింజలు',
        '1 కప్పు వేడి నీరు',
        '1 టీస్పూన్ తేనె (ఐచ్ఛికం)'
      ],
      preparation: [
        'సోంపు గింజలను కొద్దిగా ముద్ద చేయాలి',
        'వేడి నీటిలో 5 నిమిషాలు మరిగించాలి',
        'వడకట్టి తేనె కలపాలి (అవసరమైతే)',
        'ఆహారం తర్వాత తాగాలి'
      ],
      duration: 'ప్రతి రోజు భోజనాల తర్వాత',
      precautions: 'రోజుకు 2 కప్పులకు మించకుండా పరిమితం చేయాలి',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
,'kn-IN': {
  1: [ // ಮೊದಲ ತ್ರೈಮಾಸಿಕ
    {
      id: 101,
      title: 'ಶುಂಠಿ-ನಿಂಬೆ ಉತ್ಕರ್ಷ',
      description: 'ಬೆಳಿಗ್ಗೆ ಮಲಬದ್ಧತೆ ಮತ್ತು ವಾಂತಿಗೆ ಸಹಜ ಪರಿಹಾರ',
      benefits: [
        'ವಾಂತಿ ಮತ್ತು ವಾಕರಿಯನ್ನೂ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ',
        'ಜೀರ್ಣಕ್ರಿಯೆಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ',
        'ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ',
        'ದೇಹಕ್ಕೆ ಆರೈಕೆ ನೀಡುತ್ತದೆ'
      ],
      ingredients: [
        '1 ಕಪ್ ಉಷ್ಣ ಜಲ',
        '1 ಇಂಚು ತಾಜಾ ಶುಂಠಿ (ಸಣ್ಣ ತುಂಡುಗಳು)',
        '1 ಟೀಸ್ಪೂನ್ ನಿಂಬೆ ರಸ',
        '1 ಟೀಸ್ಪೂನ್ ಜೇನುತುಪ್ಪ (ಐಚ್ಛಿಕ)'
      ],
      preparation: [
        'ನೀರನ್ನು ಉತ್ಕಟಿಸಿ ಶುಂಠಿಯನ್ನು ಸೇರಿಸಿ',
        '5-7 ನಿಮಿಷಗಳ ಕಾಲ ನೆನೆಸಿ',
        'ಚಡಕೆಯಿಂದ ತೆಗೆದು ನಿಂಬೆ ರಸ ಸೇರಿಸಿ',
        'ಬಯಸಿದರೆ ಜೇನುತುಪ್ಪ ಸೇರಿಸಿ',
        'ನಿಧಾನವಾಗಿ ಕುಡಿಯಿರಿ'
      ],
      duration: 'ಅವಶ್ಯಕತೆ ಇದ್ದಾಗ ಮೊದಲ ತ್ರೈಮಾಸಿಕದಲ್ಲಿ',
      precautions: 'ಹೃದಯದ ಉರಿಗಸಿಕೆ ಇದ್ದರೆ ಹೆಚ್ಚು ಸೇವಿಸಬೇಡಿ',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'ತೆಂಗಿನೀರು ಮಿಶ್ರಣ',
      description: 'ಇಲೆಕ್ಟ್ರೋಲೈಟ್‌ಗಳನ್ನು ಪೂರೈಸಿ ಜಲಶೋಷಣೆಗೆ ಸಹಾಯ',
      benefits: [
        'ಸಹಜ ಇಲೆಕ್ಟ್ರೋಲೈಟ್‌ಗಳಲ್ಲಿ ಶ್ರೀಮಂತ',
        'ಮೂತ್ರ tract ಸೋಂಕುಗಳನ್ನು ತಡೆಯುತ್ತದೆ',
        'ದೇಹಕ್ಕೆ ತಂಪು ನೀಡುತ್ತದೆ',
        'ಅತ್ಯಾವಶ್ಯಕ ಖನಿಜಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ'
      ],
      ingredients: [
        '1 ಕಪ್ ತಾಜಾ ತೆಂಗಿನೀರು',
        '1 ಟೀಸ್ಪೂನ್ ಕೊತ್ತಂಬರಿ ಪುಡಿ',
        'ಉಪ್ಪಿನ ಕಲ್ಲು ಸ್ವಲ್ಪ'
      ],
      preparation: [
        'ಎಲ್ಲಾ ಪದಾರ್ಥಗಳನ್ನು ಚೆನ್ನಾಗಿ ಮಿಶ್ರಣ ಮಾಡಿ',
        'ಬೆಳಿಗ್ಗೆ ತಾಜಾ ಕುಡಿಯಿರಿ',
        'ವಾರದಲ್ಲಿ 2-3 ಬಾರಿ ಸೇವಿಸಬಹುದು'
      ],
      duration: 'ವಾರದಲ್ಲಿ 2-3 ಬಾರಿ',
      precautions: 'ತೆಂಗಿನಕ್ಕೇನಾದರೂ ಅಲರ್ಜಿ ಇದ್ದರೆ ಸೇವಿಸಬೇಡಿ',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'ಸೋಪು ಬೀಜದ ಕಷಾಯ',
      description: 'ಪ್ರಾರಂಭದ ತ್ರೈಮಾಸಿಕದ ಜೀರ್ಣ ಸಮಸ್ಯೆಗಳಿಗೆ ಪರಿಹಾರ',
      benefits: [
        'ಉಬ್ಬರೆ ಮತ್ತು ಅನಾಹವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ',
        'ಆಮ್ಲತೆಯನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ',
        'ಪೆಟ್ಟನ್ನು ಶಾಂತಗೊಳಿಸುತ್ತದೆ',
        'ಆಹಾರದ ಆಸೆ ಹೆಚ್ಚಿಸುತ್ತದೆ'
      ],
      ingredients: [
        '1 ಟೀಸ್ಪೂನ್ ಸೋಪು ಬೀಜಗಳು',
        '1 ಕಪ್ ಬಿಸಿ ನೀರು',
        '1 ಟೀಸ್ಪೂನ್ ಜೇನುತುಪ್ಪ (ಐಚ್ಛಿಕ)'
      ],
      preparation: [
        'ಸೋಪು ಬೀಜಗಳನ್ನು ಸ್ವಲ್ಪ ಪುಡಿಮಾಡಿ',
        'ಬಿಸಿ ನೀರಿನಲ್ಲಿ 5 ನಿಮಿಷ ನೆನೆಸಿ',
        'ಗಡಕೆಯಿಂದ ತೆಗೆದು ಜೇನುತುಪ್ಪ ಸೇರಿಸಿ (ಬಯಸಿದರೆ)',
        'ಊಟದ ನಂತರ ಕುಡಿಯಿರಿ'
      ],
      duration: 'ದಿನವೂ ಊಟದ ನಂತರ',
      precautions: 'ದಿನಕ್ಕೆ 2 ಕಪ್‌ಗಿಂತ ಹೆಚ್ಚು ಕುಡಿಯಬೇಡಿ',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
,'mr-IN': {
  1: [ // पहिली तिमाही
    {
      id: 101,
      title: 'आलं-लिंबू मिश्रण',
      description: 'सकाळची मळमळ व उलटीसाठी नैसर्गिक उपाय',
      benefits: [
        'मळमळ आणि उलटी कमी करते',
        'पचनास मदत करते',
        'प्रतिकारशक्ती वाढवते',
        'शरीराला हायड्रेट ठेवते'
      ],
      ingredients: [
        '1 कप गरम पाणी',
        '1 इंच ताजं आलं (पातळ चिरलेलं)',
        '1 टेबलस्पून लिंबाचा रस',
        '1 टीस्पून मध (ऐच्छिक)'
      ],
      preparation: [
        'पाणी उकळून त्यात आलं टाका',
        '5-7 मिनिटे झाकून ठेवा',
        'गाळून त्यात लिंबाचा रस टाका',
        'हवं असल्यास मध टाका',
        'हळूहळू दिवसभर प्यावं'
      ],
      duration: 'पहिल्या तिमाहीत आवश्यकतेनुसार',
      precautions: 'जर अ‍ॅसिडिटी असेल तर जास्त प्रमाणात घेऊ नका',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'नारळपाणी मिश्रण',
      description: 'इलेक्ट्रोलाइट्स भरून काढतो आणि डिहायड्रेशन टाळतो',
      benefits: [
        'नैसर्गिक इलेक्ट्रोलाइट्सचा समृद्ध स्रोत',
        'मूत्रमार्गाच्या संसर्गापासून संरक्षण',
        'शरीराला थंडावा देतो',
        'महत्त्वाचे खनिज प्रदान करतो'
      ],
      ingredients: [
        '1 कप ताजं नारळपाणी',
        '1 टीस्पून धण्याची पूड',
        'थोडं सैंधव मीठ'
      ],
      preparation: [
        'सर्व साहित्य एकत्र नीट मिसळा',
        'सकाळी ताजं प्यावं',
        'आठवड्यातून 2-3 वेळा घेता येईल'
      ],
      duration: 'आठवड्यातून 2-3 वेळा',
      precautions: 'जर नारळाची अ‍ॅलर्जी असेल तर टाळा',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'बडीशेप चहा',
      description: 'गर्भधारणेच्या सुरुवातीच्या तक्रारींसाठी पचनास मदत',
      benefits: [
        'फुगणे आणि वायू कमी करतो',
        'अ‍ॅसिडिटी कमी करतो',
        'पोट शांत करतो',
        'भूक वाढवतो'
      ],
      ingredients: [
        '1 टीस्पून बडीशेप',
        '1 कप गरम पाणी',
        '1 टीस्पून मध (ऐच्छिक)'
      ],
      preparation: [
        'बडीशेप थोडीशी चुरडून घ्या',
        'गरम पाण्यात 5 मिनिटे झाकून ठेवा',
        'गाळून त्यात मध घालावा (हवं असल्यास)',
        'जेवणानंतर प्यावं'
      ],
      duration: 'दररोज जेवणानंतर',
      precautions: 'दिवसातून 2 कपांपेक्षा जास्त घेऊ नका',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
,'bn-IN': {
  1: [ // প্রথম ত্রৈমাসিক
    {
      id: 101,
      title: 'আদা-লেবু ইনফিউশন',
      description: 'সকালবেলা বমি ও বমি বোধের জন্য প্রাকৃতিক প্রতিকার',
      benefits: [
        'বমি ও বমিভাব কমায়',
        'হজমে সাহায্য করে',
        'রোগ প্রতিরোধ ক্ষমতা বাড়ায়',
        'শরীরকে হাইড্রেট করে'
      ],
      ingredients: [
        '১ কাপ উষ্ণ জল',
        '১ ইঞ্চি তাজা আদা (পাতলা করে কাটা)',
        '১ টেবিল চামচ লেবুর রস',
        '১ চা চামচ মধু (ঐচ্ছিক)'
      ],
      preparation: [
        'জল ফুটিয়ে আদা যোগ করুন',
        '৫-৭ মিনিট ঢেকে রাখুন',
        'ছেঁকে লেবুর রস যোগ করুন',
        'চাইলে মধু যোগ করুন',
        'সারা দিন আস্তে আস্তে পান করুন'
      ],
      duration: 'প্রয়োজন অনুযায়ী প্রথম ত্রৈমাসিকে',
      precautions: 'যদি গ্যাস্ট্রিক বা অম্লতা থাকে তবে অতিরিক্ত সেবন করবেন না',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'নারকেল জল এলিক্সার',
      description: 'ইলেকট্রোলাইট পূরণ করে ও পানিশূন্যতা প্রতিরোধ করে',
      benefits: [
        'প্রাকৃতিক ইলেকট্রোলাইটে সমৃদ্ধ',
        'মূত্রনালীর সংক্রমণ প্রতিরোধ করে',
        'শরীর ঠান্ডা রাখে',
        'প্রয়োজনীয় খনিজ সরবরাহ করে'
      ],
      ingredients: [
        '১ কাপ তাজা নারকেল জল',
        '১ চা চামচ ধনে গুঁড়ো',
        'এক চিমটে সাদা লবণ / সিঁদে লবণ'
      ],
      preparation: [
        'সব উপকরণ ভালোভাবে মিশিয়ে নিন',
        'সকালে তাজা পান করুন',
        'সপ্তাহে ২-৩ বার সেবন করতে পারেন'
      ],
      duration: 'সপ্তাহে ২-৩ বার',
      precautions: 'যদি নারকেল অ্যালার্জি থাকে তবে এড়িয়ে চলুন',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'মৌরির চা',
      description: 'গর্ভাবস্থার শুরুতে হজমজনিত অস্বস্তির জন্য সহায়ক',
      benefits: [
        'অতিরিক্ত গ্যাস ও ফোলাভাব কমায়',
        'অম্লতা হ্রাস করে',
        'পেটকে শান্ত করে',
        'ক্ষুধা বাড়ায়'
      ],
      ingredients: [
        '১ চা চামচ মৌরি',
        '১ কাপ গরম জল',
        '১ চা চামচ মধু (ঐচ্ছিক)'
      ],
      preparation: [
        'মৌরি হালকাভাবে চূর্ণ করুন',
        'গরম জলে ৫ মিনিট ভিজিয়ে রাখুন',
        'ছেঁকে মধু যোগ করুন (চাইলে)',
        'খাবারের পর পান করুন'
      ],
      duration: 'প্রতিদিন খাবারের পর',
      precautions: 'দিনে ২ কাপের বেশি পান করবেন না',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
,'gu-IN': {
  1: [ // પ્રથમ ત્રિમાસિક
    {
      id: 101,
      title: 'આદુ-લીંબુ ઇન્ફ્યુઝન',
      description: 'સવારના ઉલટીઓ અને માથાફેરાની પ્રાકૃતિક સારવાર',
      benefits: [
        'ઉલટીઓ અને માથાફેરો ઘટાડે છે',
        'જઠરાંત્ર માટે લાભદાયક છે',
        'પ્રતિકારક શક્તિ વધારશે',
        'શરીરને હાઈડ્રેટ રાખે છે'
      ],
      ingredients: [
        '૧ કપ ગરમ પાણી',
        '૧ ઇંચ તાજું આદુ (પાતળા ટુકડાઓ)',
        '૧ ટેબલસ્પૂન લીંબૂનો રસ',
        '૧ ચમચી મધ (વૈકલ્પિક)'
      ],
      preparation: [
        'પાણી ઉકાળી તેમાં આદુ ઉમેરો',
        '૫-૭ મિનિટ માટે ઢાંકી રાખો',
        'છાણી ને તેમાં લીંબૂનો રસ ઉમેરો',
        'ઇચ્છા મુજબ મધ ઉમેરી શકો છો',
        'ધીરે ધીરે દિવસ દરમિયાન પીવો'
      ],
      duration: 'પ્રથમ ત્રિમાસિક દરમ્યાન જરૂર મુજબ',
      precautions: 'જ્યારેએસીડીટી હોય ત્યારે વધુ માત્રામાં ન પીવો',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'નાળિયેર પાણી ઇલિક્સિર',
      description: 'ઇલેક્ટ્રોલાઇટ્સ ભરે છે અને ડિહાઈડ્રેશન અટકાવે છે',
      benefits: [
        'કુદરતી ઇલેક્ટ્રોલાઇટ્સથી ભરપૂર',
        'મૂત્ર માર્ગના સંક્રમણથી બચાવે છે',
        'શરીરને ઠંડક આપે છે',
        'જરૂરી ખનિજ આપશે'
      ],
      ingredients: [
        '૧ કપ તાજું નાળિયેર પાણી',
        '૧ ચમચી ધાણા પાવડર',
        'થોડીક સેધું મીઠું'
      ],
      preparation: [
        'બધી સામગ્રી સારી રીતે મિક્સ કરો',
        'સવારે તાજું પીવો',
        'અઠવાડિયે ૨-૩ વાર પીશો'
      ],
      duration: 'અઠવાડિયે ૨-૩ વખત',
      precautions: 'જો નાળિયેરથી એલર્જી હોય તો ટાળો',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'સૌફ ચા',
      description: 'શરુઆતની ગર્ભાવસ્થાની અસ્વસ્થતા માટે પાચક છે',
      benefits: [
        'ફુલાવા અને વાયુ ઘટાડે છે',
        'એસીડીટી ઘટાડે છે',
        'પેટને શાંતિ આપે છે',
        'ભૂખ વધારશે'
      ],
      ingredients: [
        '૧ ચમચી સૌફ',
        '૧ કપ ગરમ પાણી',
        '૧ ચમચી મધ (વૈકલ્પિક)'
      ],
      preparation: [
        'સૌફને હળવાંથી ક્રશ કરો',
        'ગરમ પાણીમાં ૫ મિનિટ ડૂબાડો',
        'છાણી ને ઇચ્છા મુજબ મધ ઉમેરો',
        'ભોજન પછી પીવો'
      ],
      duration: 'દરરોજ ભોજન પછી',
      precautions: 'દિવસમાં ૨ કપથી વધુ ન પીવો',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
,'ml-IN': {
  1: [ // ആദ്യ ത്രൈമാസം
    {
      id: 101,
      title: 'ഇഞ്ചി-നാരങ്ങ ഇൻഫ്യൂഷൻ',
      description: 'പ്രഭാതത്തിലെ ഛര്‍ദ്ദിയും മനസ്സിലാകാത്ത അസ്വസ്ഥതകള്‍ക്കുള്ള പ്രകൃതിദത്ത മരുന്നു',
      benefits: [
        'ഛര്‍ദ്ദിയും മനസ്സിലാകാത്ത അസ്വസ്ഥതകളും കുറയ്ക്കുന്നു',
        'ജീരണം മെച്ചപ്പെടുത്തുന്നു',
        'പ്രതിരോധശക്തി വര്‍ദ്ധിപ്പിക്കുന്നു',
        'ദേഹം വെള്ളം കുടിക്കുക വഴി ഉണർന്നിരിക്കുന്നു'
      ],
      ingredients: [
        '1 കപ്പ് തണുത്ത വെള്ളം',
        '1 ഇഞ്ച് ഇഞ്ചി (അന്തരിച്ചു അരിഞ്ഞത്)',
        '1 ടേബിൾസ്പൂൺ നാരങ്ങ നീര്',
        '1 ടീസ്പൂൺ തേന് (ഐച്ഛികം)'
      ],
      preparation: [
        'വെള്ളം കെടുത്തി ഇഞ്ചി ചേർക്കുക',
        '5-7 മിനിറ്റ് തിളപ്പിക്കുക',
        'അരിപ്പ് ചെയ്യുക, പിന്നീട് നാരങ്ങ നീര് ചേർക്കുക',
        'തേന് ചേർക്കാം (ഐച്ഛികം)',
        'ദിവസം മുഴുവൻ സൂക്ഷ്മമായി കുടിക്കുക'
      ],
      duration: 'ആവശ്യമായതും നേരത്തെയുള്ള ഗര്‍ഭകാലത്ത് ഉപയോഗിക്കാവുന്നത്',
      precautions: 'ഹാര്‍ട്‌ബേണ് ഉള്ളവര്‍ അധികമായി കഴിക്കരുത്',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'തേങ്ങാ വെള്ളം എലിക്സിർ',
      description: 'ഇലക്ട്രോളൈറ്റ് പുനഃപൂരിപ്പിക്കുകയും ദേഹ വാതം ഒഴിവാക്കുകയും ചെയ്യുന്നു',
      benefits: [
        'കുശലമായ ഇലക്ട്രോളൈറ്റുകൾകൊണ്ട് സമൃദ്ധമായത്',
        'മൂത്രമാർഗ്ഗ അണുബാധ തടയുന്നു',
        'ദേഹം തണുപ്പിക്കപ്പെടുന്നു',
        'ആവശ്യമായ ധാതുക്കൾ നൽകുന്നു'
      ],
      ingredients: [
        '1 കപ്പ് തേങ്ങാ വെള്ളം',
        '1 ടീസ്പൂൺ മല്ലി പൊടി',
        'അല്‍പം കല്‍മണ്ണ് ഉപ്പ്'
      ],
      preparation: [
        'എല്ലാ ചേരുവകളും നന്നായി കുഴയ്ക്കുക',
        'രാവിലെ കുടിക്കുക',
        'ആഴ്ചയില്‍ 2-3 തവണ കഴിക്കാവുന്നതാണ്'
      ],
      duration: 'ആഴ്ചയില്‍ 2-3 തവണ',
      precautions: 'തേങ്ങക്കായിലോ അതിന്റെ ഉത്പന്നങ്ങളിലോ അലര്‍ജിയുള്ളവര്‍ ഒഴിവാക്കുക',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'പരിപ്പൂ ചായ',
      description: 'ഗര്‍ഭകാലം ആരംഭത്തിലെ അജീരണത്തിന് പ്രകൃതിദത്ത പരിഹാരം',
      benefits: [
        'വായു നിറയ്ക്കല്‍, അഴിച്ചു വിടല്‍ എന്നിവ കുറയ്ക്കുന്നു',
        'അമ്ലത്വം കുറയ്ക്കുന്നു',
        'വിശപ്പു വർദ്ധിപ്പിക്കുന്നു',
        'വയറിന് ശമനം നൽകുന്നു'
      ],
      ingredients: [
        '1 ടീസ്പൂൺ പരിപ്പൂ വിത്ത്',
        '1 കപ്പ് ചൂടുവെള്ളം',
        '1 ടീസ്പൂൺ തേന് (ഐച്ഛികം)'
      ],
      preparation: [
        'പരിപ്പൂ കുരുമുളക് അരിഞ്ഞെടുക്കുക',
        'ചൂടുവെള്ളത്തില്‍ 5 മിനിറ്റ് ആറിയുവെക്കുക',
        'അരിപ്പ് ചെയ്യുക, തേന് ചേർക്കാം',
        'ഭക്ഷണത്തിനു ശേഷം കുടിക്കുക'
      ],
      duration: 'ദിവസേന ഭക്ഷണത്തിനു ശേഷം',
      precautions: 'ഒരു ദിവസം 2 കപ്പിൽ കൂടുതലായി ഒഴിവാക്കുക',
      image:'/assets/fenneltea.jpg'
    }
  ]
}

,'pa-IN': {
  1: [ // ਪਹਿਲੀ ਤਿਮਾਹੀ
    {
      id: 101,
      title: 'ਅਦਰਕ-ਨਿੰਬੂ ਇਨਫ਼ਿਊਜ਼ਨ',
      description: 'ਸਵੇਰੇ ਦੀ ਮਤਲੋਲੀ ਅਤੇ ਉਲਟੀ ਲਈ ਕੁਦਰਤੀ ਇਲਾਜ',
      benefits: [
        'ਮਤਲੋਲੀ ਅਤੇ ਉਲਟੀ ਨੂੰ ਘਟਾਉਂਦਾ ਹੈ',
        'ਹਜ਼ਮੇ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ',
        'ਰੋਗ-ਪ੍ਰਤੀਰੋਧਕ ਤਾਕਤ ਵਧਾਉਂਦਾ ਹੈ',
        'ਸ਼ਰੀਰ ਨੂੰ ਹਾਈਡਰੇਟ ਰੱਖਦਾ ਹੈ'
      ],
      ingredients: [
        '1 ਕੱਪ ਗਰਮ ਪਾਣੀ',
        '1 ਇੰਚ ਤਾਜਾ ਅਦਰਕ (ਪਤਲਾ ਕੱਟਿਆ ਹੋਇਆ)',
        '1 ਟੇਬਲਚਮਚ ਨਿੰਬੂ ਰਸ',
        '1 ਚਮਚ ਸ਼ਹਿਦ (ਚੋਇਕਾ)'
      ],
      preparation: [
        'ਪਾਣੀ ਉਬਾਲੋ ਅਤੇ ਅਦਰਕ ਪਾ ਦਿਓ',
        '5-7 ਮਿੰਟ ਤੱਕ ਭਿੱਜਣ ਦਿਓ',
        'ਛਾਣੋ ਅਤੇ ਨਿੰਬੂ ਰਸ ਪਾਓ',
        'ਚਾਹੋ ਤਾਂ ਸ਼ਹਿਦ ਵੀ ਪਾਓ',
        'ਸਾਰੇ ਦਿਨ ਹੌਲੀ-ਹੌਲੀ ਪੀਓ'
      ],
      duration: 'ਪਹਿਲੀ ਤਿਮਾਹੀ ਦੌਰਾਨ ਲੋੜ ਮੁਤਾਬਕ',
      precautions: 'ਜੇ ਤੂੰ ਐਸਿਡਿਟੀ ਜਾਂ ਸੀਨੇ ਦੀ ਜਲਨ ਤੋਂ ਪੀੜਤ ਹੈਂ ਤਾਂ ਜ਼ਿਆਦਾ ਨਾ ਲੈਣ',
      image:'/assets/gingerlemon.jpg'
    },
    {
      id: 102,
      title: 'ਨਾਰੀਅਲ ਪਾਣੀ ਇਲਿਕਸਿਰ',
      description: 'ਇਲੈਕਟ੍ਰੋਲਾਈਟ ਰੀਫਿਲ ਕਰਦਾ ਹੈ ਅਤੇ ਡੀਹਾਈਡਰੇਸ਼ਨ ਰੋਕਦਾ ਹੈ',
      benefits: [
        'ਕੁਦਰਤੀ ਇਲੈਕਟ੍ਰੋਲਾਈਟਸ ਨਾਲ ਭਰਪੂਰ',
        'ਯੂਰੀਨ ਇੰਫੈਕਸ਼ਨ ਤੋਂ ਬਚਾਅ',
        'ਸ਼ਰੀਰ ਨੂੰ ਠੰਡਕ ਦਿੰਦਾ ਹੈ',
        'ਜ਼ਰੂਰੀ ਖਣਿਜ ਮੁਹੱਈਆ ਕਰਦਾ ਹੈ'
      ],
      ingredients: [
        '1 ਕੱਪ ਤਾਜ਼ਾ ਨਾਰੀਅਲ ਪਾਣੀ',
        '1 ਚਮਚ ਧਨੀਆ ਪਾਊਡਰ',
        'ਇੱਕ ਚਟਕੀ ਕਲਾ ਨਮਕ'
      ],
      preparation: [
        'ਸਾਰੇ ਸਮੱਗਰੀ ਨੂੰ ਵਧੀਆ ਮਿਲਾਓ',
        'ਸਵੇਰੇ ਤਾਜ਼ਾ ਪੀਓ',
        'ਹਫ਼ਤੇ ਵਿੱਚ 2-3 ਵਾਰੀ ਲੈ ਸਕਦੇ ਹੋ'
      ],
      duration: 'ਹਫ਼ਤੇ ਵਿੱਚ 2-3 ਵਾਰੀ',
      precautions: 'ਜੇ ਨਾਰੀਅਲ ਨਾਲ ਅਲਰਜੀ ਹੈ ਤਾਂ ਨਾ ਲਵੋ',
       image:'/assets/coconut.jpg'
    },
    {
      id: 103,
      title: 'ਸੌਫ ਦੀ ਚਾਹ',
      description: 'ਸ਼ੁਰੂਆਤੀ ਗਰਭਾਵਸਥਾ ਵਿੱਚ ਹਜ਼ਮੇ ਲਈ ਇਲਾਜ',
      benefits: [
        'ਗੈਸ ਅਤੇ ਅਫਾਰ ਘਟਾਉਂਦੀ ਹੈ',
        'ਐਸਿਡਿਟੀ ਨੂੰ ਘਟਾਉਂਦੀ ਹੈ',
        'ਪੇਟ ਨੂੰ ਆਰਾਮ ਦਿੰਦੀ ਹੈ',
        'ਭੁੱਖ ਵਧਾਉਂਦੀ ਹੈ'
      ],
      ingredients: [
        '1 ਚਮਚ ਸੌਫ',
        '1 ਕੱਪ ਗਰਮ ਪਾਣੀ',
        '1 ਚਮਚ ਸ਼ਹਿਦ (ਚੋਇਕਾ)'
      ],
      preparation: [
        'ਸੌਫ ਨੂੰ ਹੌਲੀ ਜਿਹਾ ਕੁੱਟੋ',
        '5 ਮਿੰਟ ਲਈ ਗਰਮ ਪਾਣੀ ਵਿੱਚ ਭਿੱਜੋ',
        'ਛਾਣੋ ਅਤੇ ਸ਼ਹਿਦ ਪਾਓ (ਜੇ ਚਾਹੋ)',
        'ਭੋਜਨ ਤੋਂ ਬਾਅਦ ਪੀਓ'
      ],
      duration: 'ਰੋਜ਼ਾਨਾ ਭੋਜਨ ਤੋਂ ਬਾਅਦ',
      precautions: 'ਰੋਜ਼ 2 ਕੱਪ ਤੋਂ ਵੱਧ ਨਾ ਲਵੋ',
      image:'/assets/fenneltea.jpg'
    }
  ]
}
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          setLanguage(docSnap.data().language || 'en-IN');
          setStreak(docSnap.streak || 0); 
          setBookmarked(docSnap.data().bookmarkedRemedies || []);
          
          if (docSnap.data().pregnancyStartDate) {
            const pregnancyStart = new Date(docSnap.data().pregnancyStartDate);
            const weeksPregnant = Math.floor((new Date() - pregnancyStart) / (7 * 24 * 60 * 60 * 1000));
            setTrimester(weeksPregnant < 13 ? 1 : weeksPregnant < 27 ? 2 : 3);
          }
        }
      }
    };
    fetchUserData();
  }, [auth.currentUser]);

  const remedies = ayurvedicRemedies[language]?.[trimester] || ayurvedicRemedies['en-IN'][trimester];

  const toggleBookmark = async (remedyId) => {
    const newBookmarked = bookmarked.includes(remedyId)
      ? bookmarked.filter(id => id !== remedyId)
      : [...bookmarked, remedyId];
    
    setBookmarked(newBookmarked);
    
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          bookmarkedRemedies: newBookmarked
        });
      } catch (error) {
        console.error("Error updating bookmarks:", error);
      }
    }
  };

  return (
     <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50">

    {/* ✅ Place Navbar outside the padded container to avoid extra spacing */}
    <Navbar title={t.title} streak={0} lang={language} />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold text-teal-800 mb-2">
          {translations[language]?.heading || translations['en-IN'].heading}
        </h1>
        <p className="text-gray-600">
          {translations[language]?.subheading || translations['en-IN'].subheading}
        </p>
        
        {/* Trimester Selector */}
        <div className="flex justify-center mt-4">
          <div className="inline-flex rounded-md shadow-sm">
           
          </div>
        </div>
      </motion.header>

      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {remedies.map((remedy) => (
          <motion.div
            key={remedy.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all"
          >
            <div className="h-48 bg-green-100 flex items-center justify-center relative">
              <img
                src={remedy.image}
                alt={remedy.title}
                className="h-full w-full object-cover"
              />
              <button
                className={`absolute top-4 right-4 p-2 rounded-full ${
                  bookmarked.includes(remedy.id) ? 'text-teal-600' : 'text-gray-400'
                }`}
                onClick={() => toggleBookmark(remedy.id)}
              >
                <FaBookmark className="text-2xl" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-teal-700 mb-2">{remedy.title}</h3>
              <p className="text-gray-600 mb-3">{remedy.description}</p>
              
              <div className="flex items-center mb-3">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-2 flex items-center">
                  <FaLeaf className="mr-1" /> {remedy.duration}
                </span>
                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded flex items-center">
                  <FaBaby className="mr-1" /> {translations[language]?.[`trimester${trimester}`] || translations['en-IN'][`trimester${trimester}`]}
                </span>
              </div>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">Benefits</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                {remedy.benefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
              </ul>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
                {remedy.ingredients.map((ingredient, i) => <li key={i}>{ingredient}</li>)}
              </ul>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">Preparation</h4>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700 mb-4">
                {remedy.preparation.map((step, i) => <li key={i}>{step}</li>)}
              </ol>

              <h4 className="text-lg font-semibold text-gray-800 mb-2">Precautions</h4>
              <p className="text-red-600">{remedy.precautions}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">
          {translations[language]?.tipsTitle || translations['en-IN'].tipsTitle}
        </h2>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-800">
            {translations[language]?.tips?.[trimester] || translations['en-IN'].tips[trimester]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PregAyurvedaPage;