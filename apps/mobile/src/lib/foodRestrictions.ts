export interface FoodRestrictions {
  foods: string[]; // gi-check gikan sa lista
  other: string[]; // gi-type sa user
}

export interface Meal {
  name: string;
  desc: string;
  cal: string;
}

export const FOOD_OPTIONS = [
  { label: 'Peanuts', keywords: ['peanut'] },
  { label: 'Tree Nuts', keywords: ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'nut'] },
  { label: 'Eggs', keywords: ['egg'] },
  { label: 'Milk / Dairy', keywords: ['milk', 'cheese', 'yogurt', 'yoghurt', 'whey', 'cream', 'gainer'] },
  { label: 'Fish', keywords: ['fish', 'salmon', 'tuna', 'sardine', 'tilapia'] },
  { label: 'Shellfish', keywords: ['shrimp', 'prawn', 'crab', 'lobster', 'shellfish', 'squid'] },
  { label: 'Soy', keywords: ['soy', 'tofu', 'tempeh', 'edamame'] },
  { label: 'Wheat / Gluten', keywords: ['wheat', 'bread', 'toast', 'wrap', 'pasta', 'noodle', 'tortilla', 'flour'] },
  { label: 'Pork', keywords: ['pork', 'bacon', 'ham', 'sausage'] },
  { label: 'Beef', keywords: ['beef', 'steak'] },
  { label: 'Chicken', keywords: ['chicken'] },
];

// Bisaya/Tagalog nga pulong nga ma-type sa user
const SYNONYMS: Record<string, string[]> = {
  baboy: ['pork', 'bacon', 'ham', 'sausage'],
  baka: ['beef', 'steak'],
  manok: ['chicken'],
  isda: ['fish', 'salmon', 'tuna', 'sardine', 'tilapia'],
  hipon: ['shrimp', 'prawn'],
  alimango: ['crab'],
  itlog: ['egg'],
  gatas: ['milk', 'cheese', 'yogurt', 'yoghurt', 'whey', 'cream', 'gainer'],
  mani: ['peanut'],
  tokwa: ['tofu'],
};

const STORAGE_KEY = 'foodRestrictions';

export function loadFoodRestrictions(): FoodRestrictions {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      foods: Array.isArray(raw.foods) ? raw.foods : [],
      other: Array.isArray(raw.other) ? raw.other : [],
    };
  } catch {
    return { foods: [], other: [] };
  }
}

export function saveLocalFoodRestrictions(restrictions: FoodRestrictions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(restrictions));
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "eggs" -> "egg" aron mo-match pud sa singular
const normalize = (term: string) => {
  const t = term.trim().toLowerCase();
  return t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t;
};

function buildMatchers(restrictions: FoodRestrictions): RegExp[] {
  const fromChecklist = restrictions.foods.flatMap(
    (label) => FOOD_OPTIONS.find((o) => o.label === label)?.keywords ?? []
  );
  const fromCustom = restrictions.other.flatMap((item) => {
    const key = item.trim().toLowerCase();
    return [key, ...(SYNONYMS[key] ?? [])];
  });

  return [...fromChecklist, ...fromCustom]
    .map(normalize)
    .filter(Boolean)
    .map((term) => new RegExp('\\b' + escapeRegex(term), 'i'));
}

// Meal options kada goal ug kada meal slot. Ang first entry kada slot mao ang
// default/original nga meal; ang uban kay alternatibo - gigamit tanan para sa
// adlaw-adlaw nga rotation (tan-awa sa MealPlan.tsx) ug para sa food restrictions.
export const MEAL_PLANS: Record<string, Record<string, Meal[]>> = {
  'Muscle Gain': {
    Breakfast: [
      { name: 'Breakfast', desc: 'Oatmeal with whole milk, peanut butter, and 4 boiled eggs', cal: '~750 kcal' },
      { name: 'Breakfast', desc: 'Rice porridge with shredded chicken, sweet potato, and 2 bananas', cal: '~700 kcal' },
      { name: 'Breakfast', desc: 'Garlic rice with sautéed beef strips, sliced mango, and coconut water', cal: '~750 kcal' },
    ],
    Lunch: [
      { name: 'Lunch', desc: 'Grilled chicken breast (250g), large portion of brown rice, avocado', cal: '~900 kcal' },
      { name: 'Lunch', desc: 'Grilled pork loin (250g), large portion of rice, and steamed vegetables', cal: '~900 kcal' },
      { name: 'Lunch', desc: 'Braised chicken thighs with potatoes, brown rice, and avocado', cal: '~900 kcal' },
    ],
    Dinner: [
      { name: 'Dinner', desc: 'Salmon steak with sweet potatoes and olive oil dressing', cal: '~750 kcal' },
      { name: 'Dinner', desc: 'Beef stew with potatoes, carrots, and rice', cal: '~750 kcal' },
      { name: 'Dinner', desc: 'Baked chicken breast with sweet potatoes and olive oil', cal: '~700 kcal' },
    ],
    Snack: [
      { name: 'Snack', desc: 'Mass gainer shake, mixed nuts, and 2 bananas', cal: '~600 kcal' },
      { name: 'Snack', desc: 'Banana, rice cakes with honey, and coconut water', cal: '~500 kcal' },
      { name: 'Snack', desc: 'Boiled sweet potato, a ripe mango, and fruit juice', cal: '~450 kcal' },
    ],
  },
  'Fat Loss': {
    Breakfast: [
      { name: 'Breakfast', desc: 'Black coffee, 2 boiled eggs, and a small apple (No heavy carbs)', cal: '~200 kcal' },
      { name: 'Breakfast', desc: 'Black coffee, grilled chicken strips, and a small apple', cal: '~200 kcal' },
      { name: 'Breakfast', desc: 'Green tea, half a cup of oats cooked in water, and a small banana', cal: '~200 kcal' },
    ],
    Lunch: [
      { name: 'Lunch', desc: 'Grilled chicken salad with mixed greens, tomatoes, cucumber (No dressing/rice)', cal: '~300 kcal' },
      { name: 'Lunch', desc: 'Grilled fish fillet with steamed vegetables (no rice)', cal: '~300 kcal' },
      { name: 'Lunch', desc: 'Lean pork loin (120g) with cucumber and tomato salad', cal: '~300 kcal' },
    ],
    Dinner: [
      { name: 'Dinner', desc: 'Lean beef steak (150g) with steamed broccoli and cauliflower', cal: '~350 kcal' },
      { name: 'Dinner', desc: 'Grilled chicken breast (150g) with steamed broccoli and cauliflower', cal: '~300 kcal' },
      { name: 'Dinner', desc: 'Baked fish (150g) with sautéed spinach and lemon', cal: '~280 kcal' },
    ],
    Snack: [
      { name: 'Snack', desc: 'Celery sticks or green tea (Strictly no sugar)', cal: '~50 kcal' },
      { name: 'Snack', desc: 'Cucumber slices with lemon, or a small apple', cal: '~60 kcal' },
      { name: 'Snack', desc: 'Green tea and a few slices of watermelon', cal: '~50 kcal' },
    ],
  },
  Fitness: {
    Breakfast: [
      { name: 'Breakfast', desc: 'Scrambled eggs (3), whole wheat toast, black coffee', cal: '~400 kcal' },
      { name: 'Breakfast', desc: 'Rice porridge with shredded chicken and sliced cucumber, black coffee', cal: '~400 kcal' },
      { name: 'Breakfast', desc: 'Oatmeal cooked in water with banana slices and honey', cal: '~380 kcal' },
    ],
    Lunch: [
      { name: 'Lunch', desc: 'Grilled turkey wrap with spinach, tomatoes, and light hummus', cal: '~450 kcal' },
      { name: 'Lunch', desc: 'Grilled chicken with brown rice and steamed vegetables', cal: '~450 kcal' },
      { name: 'Lunch', desc: 'Grilled lean pork (150g) with brown rice and steamed vegetables', cal: '~470 kcal' },
    ],
    Dinner: [
      { name: 'Dinner', desc: 'Baked salmon, quinoa, and steamed broccoli', cal: '~500 kcal' },
      { name: 'Dinner', desc: 'Grilled beef (150g) with baked potato and steamed green beans', cal: '~500 kcal' },
      { name: 'Dinner', desc: 'Baked chicken breast with brown rice and steamed broccoli', cal: '~480 kcal' },
    ],
    Snack: [
      { name: 'Snack', desc: 'Greek yogurt with a handful of almonds', cal: '~200 kcal' },
      { name: 'Snack', desc: 'A banana and a small bowl of watermelon', cal: '~150 kcal' },
      { name: 'Snack', desc: 'Apple slices with cucumber sticks', cal: '~100 kcal' },
    ],
  },
};

// Ilisan ang meal nga naay bawal; kung wala gyud luwas, ayaw ipakita ang bawal
export function applyRestrictions(meals: Meal[], goal: string, restrictions: FoodRestrictions): Meal[] {
  const matchers = buildMatchers(restrictions);
  if (matchers.length === 0) return meals;

  const isSafe = (text: string) => !matchers.some((re) => re.test(text));
  const pool = MEAL_PLANS[goal] ?? MEAL_PLANS.Fitness;

  return meals.map((meal) => {
    const candidates = [meal, ...(pool[meal.name] ?? [])];
    const safe = candidates.find((m) => isSafe(m.desc));
    return (
      safe ?? {
        name: meal.name,
        desc: 'No safe option found for your restrictions. Please ask your coach or a nutritionist for a custom meal.',
        cal: '—',
      }
    );
  });
}