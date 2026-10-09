// Real page renders, in print order, with real facts only (no invented stats).
// Imported through astro:assets so every <Image> gets width/height and
// optimized formats automatically (fixes HANDOFF.md problem: "images have no
// width/height").
import bCover from '../assets/products/adhd-planner-bundle/cover.png';
import bWeekly from '../assets/products/adhd-planner-bundle/weekly-planner.png';
import bDaily from '../assets/products/adhd-planner-bundle/daily-planner.png';
import bMonthly from '../assets/products/adhd-planner-bundle/monthly-overview.png';
import bBrainDump from '../assets/products/adhd-planner-bundle/brain-dump.png';
import bHabit from '../assets/products/adhd-planner-bundle/habit-tracker.png';
import bPriority from '../assets/products/adhd-planner-bundle/priority-matrix.png';
import bReminder from '../assets/products/adhd-planner-bundle/reminder-tracker.png';
import bMeal from '../assets/products/adhd-planner-bundle/meal-planner.png';
import bGoal from '../assets/products/adhd-planner-bundle/goal-breakdown.png';
import bSelfcare from '../assets/products/adhd-planner-bundle/selfcare-checkin.png';
import bChore from '../assets/products/adhd-planner-bundle/chore-checklist.png';
import bBill from '../assets/products/adhd-planner-bundle/bill-tracker.png';

import gCover from '../assets/products/budget-planner/cover.png';
import gMonthly from '../assets/products/budget-planner/monthly-overview.png';
import gWeekly from '../assets/products/budget-planner/weekly-spending.png';
import gBill from '../assets/products/budget-planner/bill-tracker.png';
import gSavings from '../assets/products/budget-planner/savings-goal.png';
import gDebt from '../assets/products/budget-planner/debt-payoff.png';
import gSubs from '../assets/products/budget-planner/subscriptions.png';
import gCategory from '../assets/products/budget-planner/spending-by-category.png';
import gNetWorth from '../assets/products/budget-planner/net-worth.png';

export interface ProductPage {
  id: string;
  name: string;
  img: ImageMetadata;
  alt: string;
  caption: string;
}

export interface Product {
  slug: string;
  title: string;
  shortName: string;
  price: number;
  pageCount: number;
  gumroad: string;
  payhip: string;
  pages: ProductPage[];
}

export const adhdPlannerBundle: Product = {
  slug: 'adhd-planner-bundle',
  title: 'ADHD Planner Bundle',
  shortName: 'Bundle',
  price: 17.99,
  pageCount: 13,
  gumroad: 'https://cooperhawk64.gumroad.com/l/abqkkx',
  payhip: 'https://payhip.com/b/su2J3',
  pages: [
    { id: 'cover', name: 'Cover', img: bCover, alt: 'Cover page of the ADHD Planner Bundle listing all thirteen pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'weekly-planner', name: 'Weekly Planner', img: bWeekly, alt: "Weekly Planner page: this week's top 3 in numbered circles, then Monday to Sunday in morning, afternoon and evening blocks, with a brain dump strip underneath", caption: "This week's top 3, seven days in morning, afternoon and evening blocks, and a brain dump strip." },
    { id: 'daily-planner', name: 'Daily Planner', img: bDaily, alt: "Daily Planner page: today's big 3, an energy and water check-in, then morning, afternoon and evening blocks and a notes block", caption: "Today's big 3, an energy and water check-in, three chunks, notes." },
    { id: 'monthly-overview', name: 'Monthly Overview', img: bMonthly, alt: "Monthly Overview page: this month's focus line and a five-week grid of day boxes, Monday to Sunday", caption: 'One focus for the month and a box per day. The shape of a month, not another daily planner.' },
    { id: 'brain-dump', name: 'Brain Dump', img: bBrainDump, alt: 'Brain Dump page with four ruled blocks for tasks, ideas, worries and random', caption: 'Tasks, ideas, worries, random. Out of your head and onto the page.' },
    { id: 'habit-tracker', name: 'Habit Tracker', img: bHabit, alt: 'Habit Tracker page: eight habit rows with seven check-off circles each, Monday to Sunday, and no streak column', caption: 'Eight habits, seven circles each. No streak column anywhere on the page.' },
    { id: 'priority-matrix', name: 'Priority Matrix', img: bPriority, alt: 'Priority Matrix page: four blocks labelled do first, plan for, quick wins and let go', caption: 'Do first, plan for, quick wins, let go. The fourth pile is allowed to be large.' },
    { id: 'reminder-tracker', name: 'Reminder Tracker', img: bReminder, alt: 'Reminder Tracker page: six rows with what, time, and seven daily check-off circles', caption: 'What, when, and seven circles. A memory backup, not advice.' },
    { id: 'meal-planner', name: 'Meal Planner', img: bMeal, alt: 'Meal Planner page: a row per day Monday to Sunday and a grocery list column with checkboxes', caption: 'Seven days of meals with the grocery list right beside them.' },
    { id: 'goal-breakdown', name: 'Goal Breakdown', img: bGoal, alt: 'Goal Breakdown page: four stacked blocks, the big goal, this month, this week, and today', caption: 'The big goal, this month, this week, then one small step today.' },
    { id: 'self-care-checkin', name: 'Self-Care Check-In', img: bSelfcare, alt: 'Self-Care Check-In page: sleep hours, movement, five mood circles, glasses of water, and one good thing today', caption: 'Sleep, movement, mood, water, and one good thing today. No score.' },
    { id: 'chore-checklist', name: 'Chore Checklist', img: bChore, alt: 'Chore Checklist page: three columns, daily, weekly and monthly, each with six checkbox lines', caption: 'Daily, weekly, monthly. Keep the daily list small.' },
    { id: 'bill-tracker', name: 'Bill Tracker', img: bBill, alt: 'Bill Tracker page: twelve rows with bill, amount, due date and a paid circle', caption: 'Bill, amount, due date, and a paid circle. Twelve rows a month.' },
  ],
};

export const budgetPlanner: Product = {
  slug: 'budget-planner',
  title: 'ADHD-Friendly Budget Planner',
  shortName: 'Budget',
  price: 17.99,
  pageCount: 9,
  gumroad: 'https://cooperhawk64.gumroad.com/l/cuykdzl',
  payhip: 'https://payhip.com/b/Z5EI4',
  pages: [
    { id: 'cover', name: 'Cover', img: gCover, alt: 'Cover page of the ADHD-Friendly Budget Planner listing all nine pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'monthly-overview', name: 'Monthly Overview', img: gMonthly, alt: 'Monthly budget overview page with income, fixed expenses, variable expenses and left-to-spend sections', caption: 'Income, fixed, variable. The subtraction is done for you on paper.' },
    { id: 'weekly-spending', name: 'Weekly Spending', img: gWeekly, alt: 'Weekly spending tracker page with one row per day and a total row', caption: 'One row a day, a total row. No formulas to get wrong.' },
    { id: 'bill-tracker', name: 'Bill Tracker', img: gBill, alt: 'Bill payment tracker page with amount, due date and a paid check circle', caption: 'Amount, due date, a paid circle. Every bill in one place.' },
    { id: 'savings-goal', name: 'Savings Goal', img: gSavings, alt: 'Savings goal tracker page with thirty fill-in circles and no deadline', caption: 'Thirty circles, filled in whenever money gets set aside. No deadline.' },
    { id: 'debt-payoff', name: 'Debt Payoff', img: gDebt, alt: 'Debt payoff tracker page with balance, minimum payment and extra paid columns', caption: 'Balance, minimum payment, extra paid. Progress stays visible.' },
    { id: 'subscriptions', name: 'Subscriptions', img: gSubs, alt: 'Subscription tracker page with cost, billing date and keep or cancel column', caption: 'Cost, billing date, keep or cancel. The page that catches forgotten signups.' },
    { id: 'spending-by-category', name: 'Spending by Category', img: gCategory, alt: 'Spending by category page with six boxes for groceries, transport, eating out, fun, subscriptions and other', caption: 'Six honest buckets, not twelve categories to maintain.' },
    { id: 'net-worth', name: 'Net Worth', img: gNetWorth, alt: 'Net worth snapshot page with assets and liabilities columns and a final net worth box', caption: 'Assets, liabilities, and one final number.' },
  ],
};

export const products: Record<string, Product> = {
  'adhd-planner-bundle': adhdPlannerBundle,
  'budget-planner': budgetPlanner,
};

export function findPage(product: Product, id: string): ProductPage | undefined {
  return product.pages.find((p) => p.id === id);
}
