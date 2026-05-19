/**
 * Estimates daily calorie needs and macronutrient targets based on user data.
 * Uses Mifflin-St Jeor for BMR, applies activity multiplier, then distributes macros
 * according to the specified goal.
 */
function calculateMacros({ weight_kg, height_cm, age, gender, activity_level, goal }) {
  // BMR via Mifflin-St Jeor
  let bmr;
  if (gender === 'female') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const multiplier = activityMultipliers[activity_level] || 1.55;
  let tdee = Math.round(bmr * multiplier);

  // Adjust calories for goal
  let calories;
  if (goal === 'lose_weight') {
    calories = tdee - 500;
  } else if (goal === 'gain_muscle') {
    calories = tdee + 300;
  } else {
    calories = tdee; // maintain
  }

  // Macro distribution (protein-forward for athletes)
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
