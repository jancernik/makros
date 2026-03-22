import { randomUUID } from "crypto"

import { dailyTargets, dayPlanItems, dayPlans, foods } from "../schema"
import { defineSeed } from "./lib"

export const seedIds = {
  dailyTargets: {
    today: randomUUID()
  },
  dayPlanItems: {
    chickenBreast: randomUUID(),
    egg: randomUUID(),
    lentils: randomUUID(),
    whiteRice: randomUUID()
  },
  dayPlans: {
    today: randomUUID()
  },
  foods: {
    banana: randomUUID(),
    chickenBreast: randomUUID(),
    egg: randomUUID(),
    lentils: randomUUID(),
    oats: randomUUID(),
    oliveOil: randomUUID(),
    whiteRice: randomUUID()
  }
}

export const seedEntries = [
  defineSeed(foods, [
    {
      baseAmount: 130,
      calories: 132,
      carbohydrates: 0,
      fat: 2.3,
      id: seedIds.foods.chickenBreast,
      name: "Chicken breast",
      notes: null,
      position: 0,
      protein: 28,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 130,
      carbohydrates: 28.2,
      fat: 0.3,
      id: seedIds.foods.whiteRice,
      name: "White rice",
      notes: "Cooked",
      position: 1,
      protein: 2.7,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 75,
      carbohydrates: 0.6,
      fat: 5,
      id: seedIds.foods.egg,
      name: "Egg",
      notes: null,
      position: 2,
      protein: 6.2,
      unit: "unit"
    },
    {
      baseAmount: 15,
      calories: 135,
      carbohydrates: 0,
      fat: 15,
      id: seedIds.foods.oliveOil,
      name: "Olive oil",
      notes: "1 tbsp",
      position: 3,
      protein: 0,
      unit: "ml"
    },
    {
      baseAmount: 130,
      calories: 121,
      carbohydrates: 23,
      fat: 0.7,
      id: seedIds.foods.lentils,
      name: "Lentils",
      notes: null,
      position: 4,
      protein: 6.1,
      unit: "g"
    },
    {
      baseAmount: 30,
      calories: 105,
      carbohydrates: 17,
      fat: 2.4,
      id: seedIds.foods.oats,
      name: "Oats",
      notes: null,
      position: 5,
      protein: 3.9,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 89,
      carbohydrates: 23,
      fat: 0.3,
      id: seedIds.foods.banana,
      name: "Banana",
      notes: null,
      position: 6,
      protein: 1,
      unit: "unit"
    }
  ]),

  defineSeed(dayPlans, [
    {
      date: new Date().toISOString().split("T")[0],
      id: seedIds.dayPlans.today
    }
  ]),

  defineSeed(dailyTargets, [
    {
      calories: 2800,
      carbohydrates: 363,
      dayPlanId: seedIds.dayPlans.today,
      fat: 70,
      id: seedIds.dailyTargets.today,
      protein: 180
    }
  ]),

  defineSeed(dayPlanItems, [
    {
      amount: 250,
      consumedAmount: 150,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.chickenBreast,
      id: seedIds.dayPlanItems.chickenBreast,
      position: 0
    },
    {
      amount: 120,
      consumedAmount: 120,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.whiteRice,
      id: seedIds.dayPlanItems.whiteRice,
      position: 1
    },
    {
      amount: 3,
      consumedAmount: 1,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.egg,
      id: seedIds.dayPlanItems.egg,
      position: 2
    },
    {
      amount: 200,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.lentils,
      id: seedIds.dayPlanItems.lentils,
      position: 3
    }
  ])
] as const
