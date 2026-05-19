// Static knowledge base of common sports supplements.
// In a production system this could call an external API or vector DB.
const supplementDatabase = {
  creatine: {
    name: 'Creatine Monohydrate',
    category: 'Performance',
    benefits: ['Increases phosphocreatine stores for explosive power', 'Supports strength and lean mass gains', 'May improve high-intensity interval performance'],
    typical_dose: '3–5 g/day (no loading phase needed)',
    timing: 'Any time of day; consistency matters more than timing',
    safety: 'One of the most studied supplements; considered safe for healthy adults',
    evidence_level: 'High — supported by hundreds of RCTs',
  },
  whey_protein: {
    name: 'Whey Protein',
    category: 'Protein',
    benefits: ['Fast-digesting complete protein', 'Supports muscle protein synthesis post-exercise', 'Convenient way to hit daily protein targets'],
    typical_dose: '20–40 g per serving',
    timing: 'Post-workout or any time to supplement dietary protein',
    safety: 'Generally safe; may cause discomfort in lactose-sensitive individuals',
    evidence_level: 'High',
  },
  caffeine: {
    name: 'Caffeine',
    category: 'Stimulant / Performance',
    benefits: ['Reduces perceived exertion', 'Improves endurance and power output', 'Enhances focus and alertness'],
    typical_dose: '3–6 mg per kg body weight',
    timing: '30–60 minutes before exercise',
    safety: 'Safe at moderate doses; avoid late-day use to protect sleep',
    evidence_level: 'High',
  },
  beta_alanine: {
    name: 'Beta-Alanine',
    category: 'Performance / Buffer',
    benefits: ['Raises muscle carnosine levels', 'Buffers lactic acid during high-intensity efforts', 'May extend time to fatigue in efforts lasting 1–4 minutes'],
    typical_dose: '3.2–6.4 g/day (split doses to reduce tingling)',
    timing: 'Any time; effects are chronic, not acute',
    safety: 'Safe; harmless tingling (paresthesia) is common at higher doses',
    evidence_level: 'Moderate–High',
  },
  bcaa: {
    name: 'BCAAs (Branched-Chain Amino Acids)',
    category: 'Amino Acids',
    benefits: ['May reduce exercise-induced muscle soreness', 'Supports muscle protein synthesis when dietary protein is insufficient'],
    typical_dose: '5–10 g around training',
    timing: 'Pre, during, or post-workout',
    safety: 'Safe for most people',
    evidence_level: 'Moderate — benefits are minimal if total protein intake is adequate',
  },
  magnesium: {
    name: 'Magnesium',
    category: 'Mineral',
    benefits: ['Supports hundreds of enzymatic reactions', 'May improve sleep quality and muscle recovery', 'Athletes often have higher needs due to sweat losses'],
    typical_dose: '200–400 mg/day (magnesium glycinate or citrate for absorption)',
    timing: 'Evening, with or without food',
    safety: 'Safe at recommended doses; excessive intake can cause loose stools',
    evidence_level: 'Moderate',
  },
  vitamin_d: {
    name: 'Vitamin D3',
    category: 'Vitamin',
    benefits: ['Supports immune function, bone health, and muscle function', 'Deficiency is common in athletes training indoors or in low-sunlight climates'],
    typical_dose: '1000–4000 IU/day (blood test recommended to calibrate)',
    timing: 'With a meal containing fat for best absorption',
    safety: 'Safe within recommended ranges; toxicity possible at very high doses',
    evidence_level: 'Moderate',
  },
  omega3: {
    name: 'Omega-3 Fatty Acids (Fish Oil)',
    category: 'Essential Fat',
    benefits: ['Supports cardiovascular health', 'May reduce exercise-induced inflammation and soreness', 'Supports joint health'],
    typical_dose: '1–3 g EPA+DHA per day',
    timing: 'With meals',
    safety: 'Generally safe; high doses may affect blood clotting',
    evidence_level: 'Moderate',
  },
  ashwagandha: {
    name: 'Ashwagandha',
    category: 'Adaptogen',
    benefits: ['May reduce cortisol and perceived stress', 'Some evidence for modest improvements in strength and VO2 max', 'May support recovery in high-stress periods'],
    typical_dose: '300–600 mg/day of KSM-66 or Sensoril extract',
    timing: 'Any time; some prefer evening due to calming effects',
    safety: 'Generally safe; avoid during pregnancy',
    evidence_level: 'Moderate — growing body of RCTs',
  },
};

function searchSupplements({ supplement_name }) {
  const key = supplement_name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');

  // Try exact match first, then partial
  let data = supplementDatabase[key];
  if (!data) {
    const partialKey = Object.keys(supplementDatabase).find(
      (k) => k.includes(key) || key.includes(k)
    );
    data = partialKey ? supplementDatabase[partialKey] : null;
  }

  if (!data) {
    return {
      found: false,
      message: `No specific data found for "${supplement_name}". This supplement may not be in our database or may require more research. Always consult a registered dietitian for personalized advice.`,
    };
  }

  return { found: true, ...data };
}

const definition = {
  type: 'function',
  name: 'searchSupplements',
  description:
    'Looks up evidence-based information about a sports supplement or ingredient, including benefits, dosage, timing, and safety.',
  parameters: {
    type: 'object',
    properties: {
      supplement_name: {
        type: 'string',
        description: 'Name of the supplement or ingredient to look up (e.g., "creatine", "whey protein", "caffeine")',
      },
    },
    required: ['supplement_name'],
  },
};

module.exports = { definition, handler: searchSupplements };
