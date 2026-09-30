import React, { useState } from 'react';
import { Utensils, Plus, Trash2, PieChart, Flame } from 'lucide-react';
import { MealItem } from '../../types/health';

interface MealsViewProps {
  meals: MealItem[];
  calorieGoal: number; // 2100 kcal
  onAddMeal: (meal: MealItem) => void;
  onDeleteMeal: (id: string) => void;
}

export const MealsView: React.FC<MealsViewProps> = ({
  meals,
  calorieGoal,
  onAddMeal,
  onDeleteMeal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayMeals = meals.filter((m) => m.date === todayStr);

  const totalCalories = todayMeals.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = todayMeals.reduce((sum, item) => sum + item.proteinGrams, 0);
  const totalCarbs = todayMeals.reduce((sum, item) => sum + item.carbsGrams, 0);
  const totalFat = todayMeals.reduce((sum, item) => sum + item.fatGrams, 0);

  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));

  const [date, setDate] = useState(todayStr);
  const [mealType, setMealType] = useState<MealItem['mealType']>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState(400);
  const [proteinGrams, setProteinGrams] = useState(30);
  const [carbsGrams, setCarbsGrams] = useState(40);
  const [fatGrams, setFatGrams] = useState(12);

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;
    const newMeal: MealItem = {
      id: 'meal-' + Date.now(),
      date,
      mealType,
      foodName: foodName.trim(),
      calories: Number(calories),
      proteinGrams: Number(proteinGrams),
      carbsGrams: Number(carbsGrams),
      fatGrams: Number(fatGrams),
    };
    onAddMeal(newMeal);
    setShowModal(false);
    setFoodName('');
  };

  const mealTypes: MealItem['mealType'][] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-400" /> Meal & Calorie Tracker
          </h3>
          <p className="text-xs text-zinc-400">Target Daily Intake: {calorieGoal} kcal</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-orange-600/20"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Summary Card Banner */}
      <div className="bg-[#0D0E16] border border-orange-500/20 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400 block mb-1">Total Calories</span>
            <div className="text-2xl font-black text-orange-400">{totalCalories} <span className="text-xs text-zinc-400 font-normal">/ {calorieGoal} kcal</span></div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400 block mb-1">Protein</span>
            <div className="text-2xl font-black text-emerald-400">{totalProtein} g</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400 block mb-1">Carbohydrates</span>
            <div className="text-2xl font-black text-cyan-400">{totalCarbs} g</div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
            <span className="text-xs text-zinc-400 block mb-1">Healthy Fats</span>
            <div className="text-2xl font-black text-amber-400">{totalFat} g</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Calorie Budget Progress</span>
            <span className="text-orange-300 font-bold">{caloriePercent}% Used</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Meal Category Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealTypes.map((type) => {
          const typeMeals = todayMeals.filter((m) => m.mealType === type);
          const typeCal = typeMeals.reduce((sum, item) => sum + item.calories, 0);

          return (
            <div key={type} className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> {type}
                </h4>
                <span className="text-xs font-semibold text-orange-400">{typeCal} kcal</span>
              </div>

              <div className="space-y-2">
                {typeMeals.length > 0 ? (
                  typeMeals.map((item) => (
                    <div key={item.id} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{item.foodName}</p>
                        <span className="text-[10px] text-zinc-400">
                          {item.proteinGrams}g P • {item.carbsGrams}g C • {item.fatGrams}g F
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-orange-300">{item.calories} kcal</span>
                        <button
                          onClick={() => onDeleteMeal(item.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 py-3 text-center">No food added for {type}.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-400" /> Add Food Item
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as any)}
                  className="w-full bg-[#1A1B2E] border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {mealTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Food / Dish Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Salad"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-600/30"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
