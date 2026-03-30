import { randomUUID } from "crypto"

import { dailyTargets, dayPlanItems, dayPlans, foods } from "../schema"
import { defineSeed } from "./lib"

const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(today.getDate() - 1)
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const toLocalDateOnly = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().split("T")[0]
}

const yesterdayDate = toLocalDateOnly(yesterday)
const todayDate = toLocalDateOnly(today)
const tomorrowDate = toLocalDateOnly(tomorrow)

export const seedIds = {
  dailyTargets: {
    today: randomUUID(),
    tomorrow: randomUUID(),
    yesterday: randomUUID()
  },
  dayPlanItems: {
    todayApple: randomUUID(),
    todayBanana: randomUUID(),
    todayChickpeas: randomUUID(),
    todayCookedHam: randomUUID(),
    todayCreamCheese: randomUUID(),
    todayEgg: randomUUID(),
    todayHamburgerBun: randomUUID(),
    todayHoney: randomUUID(),
    todayLentils: randomUUID(),
    todayMultigrainSeededBread: randomUUID(),
    todayPumpkinCornBurger: randomUUID(),
    todaySlicedSemiSoftCheese: randomUUID(),
    todayTomato: randomUUID(),
    tomorrowAvocado: randomUUID(),

    tomorrowBrownRice: randomUUID(),
    tomorrowChickenBreast: randomUUID(),
    tomorrowCornFlakes: randomUUID(),
    tomorrowEgg: randomUUID(),
    tomorrowGreekYogurt: randomUUID(),
    tomorrowLightWheatTortilla: randomUUID(),
    tomorrowOrange: randomUUID(),
    tomorrowTomato: randomUUID(),
    yesterdayApple: randomUUID(),
    yesterdayBroccoli: randomUUID(),
    yesterdayChickenBreast: randomUUID(),
    yesterdayDryEggPasta: randomUUID(),
    yesterdayEgg: randomUUID(),

    yesterdayGreekYogurt: randomUUID(),
    yesterdayHoney: randomUUID(),
    yesterdayOats: randomUUID(),
    yesterdayOliveOil: randomUUID(),
    yesterdayOrange: randomUUID(),
    yesterdayProteinBar: randomUUID(),
    yesterdaySandwichBread: randomUUID(),
    yesterdaySoftCheese: randomUUID(),
    yesterdayWhiteRice: randomUUID()
  },
  dayPlans: {
    today: randomUUID(),
    tomorrow: randomUUID(),
    yesterday: randomUUID()
  },
  foods: {
    almonds: randomUUID(),
    apple: randomUUID(),
    avocado: randomUUID(),
    banana: randomUUID(),
    broccoli: randomUUID(),
    brownRice: randomUUID(),
    chickenAndRiceYesterday: randomUUID(),
    chickenBreast: randomUUID(),
    chickpeas: randomUUID(),
    chiliPepper: randomUUID(),
    cookedHam: randomUUID(),
    cornFlakes: randomUUID(),
    creamCheese: randomUUID(),
    dryEggPasta: randomUUID(),
    egg: randomUUID(),
    greekYogurtUnsweetened: randomUUID(),
    hamburgerBun: randomUUID(),
    honey: randomUUID(),
    leanBeef: randomUUID(),
    lentils: randomUUID(),
    lightWheatTortilla: randomUUID(),
    multigrainSeededBread: randomUUID(),
    oats: randomUUID(),
    oliveOil: randomUUID(),
    onion: randomUUID(),
    orange: randomUUID(),
    peanutButter: randomUUID(),
    pearledBarley: randomUUID(),
    polenta: randomUUID(),
    popcornKernels: randomUUID(),
    potato: randomUUID(),
    proteinBar: randomUUID(),
    pumpkin: randomUUID(),
    pumpkinCornBurger: randomUUID(),
    redPepper: randomUUID(),
    salmon: randomUUID(),
    sandwichBread: randomUUID(),
    slicedSemiSoftCheese: randomUUID(),
    softCheese: randomUUID(),
    tomato: randomUUID(),
    tunaInWater: randomUUID(),
    wheatFlour: randomUUID(),
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
      hidden: false,
      id: seedIds.foods.chickenBreast,
      name: "Chicken breast",
      notes: "Raw",
      position: 0,
      protein: 28,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 130,
      carbohydrates: 28.2,
      fat: 0.3,
      hidden: false,
      id: seedIds.foods.whiteRice,
      name: "White rice",
      notes: "Dry weight",
      position: 1,
      protein: 2.7,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 332,
      carbohydrates: 70,
      fat: 2,
      hidden: false,
      id: seedIds.foods.brownRice,
      name: "Brown rice",
      notes: "Dry weight",
      position: 2,
      protein: 8.2,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 352,
      carbohydrates: 76,
      fat: 1,
      hidden: false,
      id: seedIds.foods.pearledBarley,
      name: "Pearled barley",
      notes: "Dry weight",
      position: 3,
      protein: 9.5,
      unit: "g"
    },
    {
      baseAmount: 130,
      calories: 154,
      carbohydrates: 25,
      fat: 2.9,
      hidden: false,
      id: seedIds.foods.chickpeas,
      name: "Chickpeas",
      notes: "Cooked",
      position: 4,
      protein: 6.9,
      unit: "g"
    },
    {
      baseAmount: 130,
      calories: 121,
      carbohydrates: 23,
      fat: 0.7,
      hidden: false,
      id: seedIds.foods.lentils,
      name: "Lentils",
      notes: "Cooked",
      position: 5,
      protein: 6.1,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 75,
      carbohydrates: 0.6,
      fat: 5,
      hidden: false,
      id: seedIds.foods.egg,
      name: "Egg",
      notes: null,
      position: 6,
      protein: 6.2,
      unit: "unit"
    },
    {
      baseAmount: 15,
      calories: 135,
      carbohydrates: 0,
      fat: 15,
      hidden: false,
      id: seedIds.foods.oliveOil,
      name: "Olive oil",
      notes: "1 tbsp",
      position: 7,
      protein: 0,
      unit: "ml"
    },
    {
      baseAmount: 30,
      calories: 105,
      carbohydrates: 17,
      fat: 2.4,
      hidden: false,
      id: seedIds.foods.oats,
      name: "Oats",
      notes: null,
      position: 8,
      protein: 3.9,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 89,
      carbohydrates: 23,
      fat: 0.3,
      hidden: false,
      id: seedIds.foods.banana,
      name: "Banana",
      notes: "Medium banana",
      position: 9,
      protein: 1,
      unit: "unit"
    },
    {
      baseAmount: 30,
      calories: 112,
      carbohydrates: 26,
      fat: 0,
      hidden: false,
      id: seedIds.foods.cornFlakes,
      name: "Corn flakes",
      notes: null,
      position: 10,
      protein: 1.9,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 130,
      carbohydrates: 0,
      fat: 0,
      hidden: false,
      id: seedIds.foods.tunaInWater,
      name: "Tuna in water",
      notes: "One can, 120 g drained",
      position: 11,
      protein: 30,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 146,
      carbohydrates: 26,
      fat: 2.3,
      hidden: false,
      id: seedIds.foods.hamburgerBun,
      name: "Hamburger bun",
      notes: null,
      position: 12,
      protein: 5.3,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 94,
      carbohydrates: 17.3,
      fat: 1.2,
      hidden: false,
      id: seedIds.foods.sandwichBread,
      name: "Sandwich bread",
      notes: null,
      position: 13,
      protein: 3.45,
      unit: "unit"
    },
    {
      baseAmount: 2,
      calories: 154,
      carbohydrates: 25,
      fat: 2.9,
      hidden: false,
      id: seedIds.foods.multigrainSeededBread,
      name: "Multigrain seeded bread",
      notes: null,
      position: 14,
      protein: 6.9,
      unit: "unit"
    },
    {
      baseAmount: 20,
      calories: 117,
      carbohydrates: 2,
      fat: 9.8,
      hidden: false,
      id: seedIds.foods.peanutButter,
      name: "Peanut butter",
      notes: null,
      position: 15,
      protein: 5.3,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 245,
      carbohydrates: 0,
      fat: 9.5,
      hidden: false,
      id: seedIds.foods.greekYogurtUnsweetened,
      name: "Greek yogurt",
      notes: "One tub, 300 g",
      position: 16,
      protein: 19.5,
      unit: "unit"
    },
    {
      baseAmount: 160,
      calories: 482,
      carbohydrates: 94,
      fat: 4.2,
      hidden: false,
      id: seedIds.foods.dryEggPasta,
      name: "Dry egg pasta",
      notes: "Dry weight",
      position: 17,
      protein: 16.8,
      unit: "g"
    },
    {
      baseAmount: 50,
      calories: 174,
      carbohydrates: 34,
      fat: 2,
      hidden: true,
      id: seedIds.foods.popcornKernels,
      name: "Popcorn kernels",
      notes: null,
      position: 18,
      protein: 5,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 155,
      carbohydrates: 25,
      fat: 5,
      hidden: false,
      id: seedIds.foods.proteinBar,
      name: "Protein bar",
      notes: null,
      position: 19,
      protein: 15,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 78,
      carbohydrates: 14,
      fat: 1.35,
      hidden: false,
      id: seedIds.foods.lightWheatTortilla,
      name: "Light wheat tortilla",
      notes: null,
      position: 20,
      protein: 2.5,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 27,
      carbohydrates: 0.4,
      fat: 0.8,
      hidden: false,
      id: seedIds.foods.cookedHam,
      name: "Cooked ham",
      notes: null,
      position: 21,
      protein: 4.45,
      unit: "unit"
    },
    {
      baseAmount: 30,
      calories: 99,
      carbohydrates: 24,
      fat: 0,
      hidden: false,
      id: seedIds.foods.honey,
      name: "Honey",
      notes: null,
      position: 22,
      protein: 0.1,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 332,
      carbohydrates: 70,
      fat: 1,
      hidden: false,
      id: seedIds.foods.wheatFlour,
      name: "Wheat flour",
      notes: null,
      position: 23,
      protein: 10,
      unit: "g"
    },
    {
      baseAmount: 30,
      calories: 87,
      carbohydrates: 0,
      fat: 7.1,
      hidden: false,
      id: seedIds.foods.softCheese,
      name: "Soft cheese",
      notes: null,
      position: 24,
      protein: 5.2,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 69,
      carbohydrates: 0,
      fat: 5.55,
      hidden: false,
      id: seedIds.foods.slicedSemiSoftCheese,
      name: "Sliced semi-soft cheese",
      notes: null,
      position: 25,
      protein: 4.85,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 125,
      carbohydrates: 15.5,
      fat: 1.55,
      hidden: false,
      id: seedIds.foods.pumpkinCornBurger,
      name: "Pumpkin and corn burger",
      notes: null,
      position: 26,
      protein: 12.2,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 790,
      carbohydrates: 110,
      fat: 9.5,
      hidden: true,
      id: seedIds.foods.chickenAndRiceYesterday,
      name: `Chicken and rice (${yesterdayDate})`,
      notes: "One serving, 550 g",
      position: 27,
      protein: 65,
      unit: "unit"
    },
    {
      baseAmount: 15,
      calories: 6,
      carbohydrates: 1.4,
      fat: 0.1,
      hidden: true,
      id: seedIds.foods.chiliPepper,
      name: "Chili pepper",
      notes: null,
      position: 28,
      protein: 0.3,
      unit: "g"
    },
    {
      baseAmount: 200,
      calories: 160,
      carbohydrates: 34,
      fat: 0.2,
      hidden: false,
      id: seedIds.foods.potato,
      name: "Potato",
      notes: "Boiled or baked",
      position: 36,
      protein: 4,
      unit: "g"
    },
    {
      baseAmount: 30,
      calories: 174,
      carbohydrates: 6,
      fat: 15,
      hidden: false,
      id: seedIds.foods.almonds,
      name: "Almonds",
      notes: "Handful",
      position: 30,
      protein: 6.4,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 348,
      carbohydrates: 78,
      fat: 0.8,
      hidden: false,
      id: seedIds.foods.polenta,
      name: "Polenta",
      notes: "Dry weight",
      position: 31,
      protein: 7,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 170,
      carbohydrates: 0,
      fat: 7,
      hidden: false,
      id: seedIds.foods.leanBeef,
      name: "Lean beef",
      notes: "Cooked",
      position: 32,
      protein: 26,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 208,
      carbohydrates: 0,
      fat: 13,
      hidden: false,
      id: seedIds.foods.salmon,
      name: "Salmon",
      notes: "Cooked",
      position: 33,
      protein: 20,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 160,
      carbohydrates: 9,
      fat: 15,
      hidden: false,
      id: seedIds.foods.avocado,
      name: "Avocado",
      notes: null,
      position: 34,
      protein: 2,
      unit: "g"
    },
    {
      baseAmount: 1,
      calories: 95,
      carbohydrates: 25,
      fat: 0.3,
      hidden: false,
      id: seedIds.foods.apple,
      name: "Apple",
      notes: null,
      position: 35,
      protein: 0.5,
      unit: "unit"
    },
    {
      baseAmount: 1,
      calories: 62,
      carbohydrates: 15.4,
      fat: 0.2,
      hidden: false,
      id: seedIds.foods.orange,
      name: "Orange",
      notes: null,
      position: 36,
      protein: 1.2,
      unit: "unit"
    },
    {
      baseAmount: 100,
      calories: 18,
      carbohydrates: 3.9,
      fat: 0.2,
      hidden: false,
      id: seedIds.foods.tomato,
      name: "Tomato",
      notes: null,
      position: 37,
      protein: 0.9,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 35,
      carbohydrates: 7,
      fat: 0.4,
      hidden: false,
      id: seedIds.foods.broccoli,
      name: "Broccoli",
      notes: "Steamed",
      position: 38,
      protein: 2.8,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 26,
      carbohydrates: 6.5,
      fat: 0.1,
      hidden: false,
      id: seedIds.foods.pumpkin,
      name: "Pumpkin",
      notes: "Cooked",
      position: 39,
      protein: 1,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 40,
      carbohydrates: 9.3,
      fat: 0.1,
      hidden: false,
      id: seedIds.foods.onion,
      name: "Onion",
      notes: null,
      position: 40,
      protein: 1.1,
      unit: "g"
    },
    {
      baseAmount: 100,
      calories: 31,
      carbohydrates: 6,
      fat: 0.3,
      hidden: false,
      id: seedIds.foods.redPepper,
      name: "Red pepper",
      notes: null,
      position: 41,
      protein: 1,
      unit: "g"
    },
    {
      baseAmount: 30,
      calories: 103,
      carbohydrates: 1.5,
      fat: 10.2,
      hidden: false,
      id: seedIds.foods.creamCheese,
      name: "Cream cheese",
      notes: "Spreadable",
      position: 42,
      protein: 1.8,
      unit: "g"
    }
  ]),

  defineSeed(dayPlans, [
    {
      date: yesterdayDate,
      id: seedIds.dayPlans.yesterday,
      note: "Felt full most of the day."
    },
    {
      date: todayDate,
      id: seedIds.dayPlans.today,
      note: null
    },
    {
      date: tomorrowDate,
      id: seedIds.dayPlans.tomorrow,
      note: "Dinner with family, amounts may be approximate."
    }
  ]),

  defineSeed(dailyTargets, [
    {
      calories: 2800,
      carbohydrates: 363,
      dayPlanId: seedIds.dayPlans.yesterday,
      fat: 70,
      id: seedIds.dailyTargets.yesterday,
      protein: 180
    },
    {
      calories: 2900,
      carbohydrates: 388,
      dayPlanId: seedIds.dayPlans.today,
      fat: 70,
      id: seedIds.dailyTargets.today,
      protein: 180
    },
    {
      calories: 2900,
      carbohydrates: 388,
      dayPlanId: seedIds.dayPlans.tomorrow,
      fat: 70,
      id: seedIds.dailyTargets.tomorrow,
      protein: 180
    }
  ]),

  defineSeed(dayPlanItems, [
    {
      amount: 60,
      consumedAmount: 60,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.oats,
      id: seedIds.dayPlanItems.yesterdayOats,
      position: 0
    },
    {
      amount: 30,
      consumedAmount: 30,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.honey,
      id: seedIds.dayPlanItems.yesterdayHoney,
      position: 2
    },
    {
      amount: 2,
      consumedAmount: 2,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.apple,
      id: seedIds.dayPlanItems.yesterdayApple,
      position: 3
    },
    {
      amount: 1,
      consumedAmount: 1,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.greekYogurtUnsweetened,
      id: seedIds.dayPlanItems.yesterdayGreekYogurt,
      position: 4
    },
    {
      amount: 180,
      consumedAmount: 180,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.dryEggPasta,
      id: seedIds.dayPlanItems.yesterdayDryEggPasta,
      position: 5
    },
    {
      amount: 30,
      consumedAmount: 30,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.softCheese,
      id: seedIds.dayPlanItems.yesterdaySoftCheese,
      position: 6
    },
    {
      amount: 8,
      consumedAmount: 8,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.oliveOil,
      id: seedIds.dayPlanItems.yesterdayOliveOil,
      position: 7
    },
    {
      amount: 1,
      consumedAmount: 1,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.orange,
      id: seedIds.dayPlanItems.yesterdayOrange,
      position: 8
    },
    {
      amount: 1,
      consumedAmount: 1,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.proteinBar,
      id: seedIds.dayPlanItems.yesterdayProteinBar,
      position: 9
    },
    {
      amount: 4,
      consumedAmount: 4,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.sandwichBread,
      id: seedIds.dayPlanItems.yesterdaySandwichBread,
      position: 10
    },
    {
      amount: 4,
      consumedAmount: 4,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.egg,
      id: seedIds.dayPlanItems.yesterdayEgg,
      position: 11
    },
    {
      amount: 120,
      consumedAmount: 120,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.whiteRice,
      id: seedIds.dayPlanItems.yesterdayWhiteRice,
      position: 12
    },
    {
      amount: 260,
      consumedAmount: 260,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.chickenBreast,
      id: seedIds.dayPlanItems.yesterdayChickenBreast,
      position: 13
    },
    {
      amount: 150,
      consumedAmount: 150,
      dayPlanId: seedIds.dayPlans.yesterday,
      foodId: seedIds.foods.broccoli,
      id: seedIds.dayPlanItems.yesterdayBroccoli,
      position: 14
    },

    {
      amount: 1,
      consumedAmount: 1,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.banana,
      id: seedIds.dayPlanItems.todayBanana,
      position: 3
    },
    {
      amount: 2,
      consumedAmount: 2,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.multigrainSeededBread,
      id: seedIds.dayPlanItems.todayMultigrainSeededBread,
      position: 4
    },
    {
      amount: 30,
      consumedAmount: 20,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.honey,
      id: seedIds.dayPlanItems.todayHoney,
      position: 6
    },
    {
      amount: 30,
      consumedAmount: 30,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.creamCheese,
      id: seedIds.dayPlanItems.todayCreamCheese,
      position: 7
    },
    {
      amount: 1,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.apple,
      id: seedIds.dayPlanItems.todayApple,
      position: 10
    },
    {
      amount: 150,
      consumedAmount: 100,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.tomato,
      id: seedIds.dayPlanItems.todayTomato,
      position: 11
    },
    {
      amount: 4,
      consumedAmount: 4,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.slicedSemiSoftCheese,
      id: seedIds.dayPlanItems.todaySlicedSemiSoftCheese,
      position: 12
    },
    {
      amount: 2,
      consumedAmount: 2,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.pumpkinCornBurger,
      id: seedIds.dayPlanItems.todayPumpkinCornBurger,
      position: 13
    },
    {
      amount: 2,
      consumedAmount: 2,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.hamburgerBun,
      id: seedIds.dayPlanItems.todayHamburgerBun,
      position: 14
    },
    {
      amount: 2,
      consumedAmount: 2,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.egg,
      id: seedIds.dayPlanItems.todayEgg,
      position: 15
    },
    {
      amount: 5,
      consumedAmount: 3,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.cookedHam,
      id: seedIds.dayPlanItems.todayCookedHam,
      position: 16
    },
    {
      amount: 130,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.chickpeas,
      id: seedIds.dayPlanItems.todayChickpeas,
      position: 17
    },
    {
      amount: 260,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.today,
      foodId: seedIds.foods.lentils,
      id: seedIds.dayPlanItems.todayLentils,
      position: 19
    },

    {
      amount: 60,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.cornFlakes,
      id: seedIds.dayPlanItems.tomorrowCornFlakes,
      position: 0
    },
    {
      amount: 1,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.greekYogurtUnsweetened,
      id: seedIds.dayPlanItems.tomorrowGreekYogurt,
      position: 1
    },
    {
      amount: 3,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.lightWheatTortilla,
      id: seedIds.dayPlanItems.tomorrowLightWheatTortilla,
      position: 3
    },
    {
      amount: 300,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.chickenBreast,
      id: seedIds.dayPlanItems.tomorrowChickenBreast,
      position: 4
    },
    {
      amount: 100,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.avocado,
      id: seedIds.dayPlanItems.tomorrowAvocado,
      position: 6
    },
    {
      amount: 100,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.tomato,
      id: seedIds.dayPlanItems.tomorrowTomato,
      position: 7
    },
    {
      amount: 100,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.brownRice,
      id: seedIds.dayPlanItems.tomorrowBrownRice,
      position: 8
    },
    {
      amount: 3,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.egg,
      id: seedIds.dayPlanItems.tomorrowEgg,
      position: 10
    },
    {
      amount: 1,
      consumedAmount: 0,
      dayPlanId: seedIds.dayPlans.tomorrow,
      foodId: seedIds.foods.orange,
      id: seedIds.dayPlanItems.tomorrowOrange,
      position: 13
    }
  ])
] as const
