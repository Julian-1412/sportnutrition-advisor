// Calculates daily calorie needs and macronutrient targets from user data.
// Formula: Mifflin-St Jeor for BMR → activity multiplier → goal adjustment → macro split.
function calculateMacros({ weight_kg, height_cm, age, gender, activity_level, goal }) {
  // Mifflin-St Jeor BMR formula — the most accurate simple BMR estimate
  let bmr;
  if (gender === 'female') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  }

  // Multiply BMR by an activity factor to estimate Total Daily Energy Expenditure
  const activityMultipliers = {
    sedentary: 1.2,     // desk job, little to no exercise
    light: 1.375,       // 1–3 days/week of light exercise
    moderate: 1.55,     // 3–5 days/week of moderate exercise
    active: 1.725,      // 6–7 days/week of hard training
    very_active: 1.9,   // physically demanding job + daily training
  };

  const multiplier = activityMultipliers[activity_level] || 1.55;
  let tdee = Math.round(bmr * multiplier);

  // Adjust total calories based on the user's goal
  let calories;
  if (goal === 'lose_weight') {
    calories = tdee - 500;   // ~0.5 kg/week deficit
  } else if (goal === 'gain_muscle') {
    calories = tdee + 300;   // modest surplus to minimise fat gain
  } else {
    calories = tdee;         // maintenance
  }

  // Higher protein ratio for muscle gain; standard for other goals
  // Protein and carbs each provide 4 kcal/g; fat provides 9 kcal/g
  const proteinRatio = goal === 'gain_muscle' ? 0.35 : 0.30;
  const fatRatio = 0.25;
  const carbRatio = 1 - proteinRatio - fatRatio;

  const protein_g = Math.round((calories * proteinRatio) / 4);
  const fat_g = Math.round((calories * fatRatio) / 9);
  const carbs_g = Math.round((calories * carbRatio) / 4);

  return {
    tdee,
    target_calories: calories,
    macros: { protein_g, carbs_g, fat_g },
    goal,
    note: 'These are estimates. Adjust based on real-world progress over 2–3 weeks.',
  };
}

// OpenAI function schema — tells the model what parameters to collect from the user
// before calling this tool
const definition = {
  type: 'function',
  name: 'calculateMacros',
  description:
    'Calculates estimated daily calorie needs and macronutrient targets (protein, carbs, fat) based on user data and fitness goal.',
  parameters: {
    type: 'object',
    properties: {
      weight_kg: { type: 'number', description: 'Body weight in kilograms' },
      height_cm: { type: 'number', description: 'Height in centimeters' },
      age: { type: 'number', description: 'Age in years' },
      gender: { type: 'string', enum: ['male', 'female'], description: 'Biological gender for BMR calculation' },
      activity_level: {
        type: 'string',
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        description: 'Daily activity level',
      },
      goal: {
        type: 'string',
        enum: ['lose_weight', 'maintain', 'gain_muscle'],
        description: 'Primary fitness goal',
      },
    },
    required: ['weight_kg', 'height_cm', 'age', 'gender', 'activity_level', 'goal'],
  },
};

module.exports = { definition, handler: calculateMacros };
