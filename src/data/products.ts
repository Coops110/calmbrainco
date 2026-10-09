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

import hCover from '../assets/products/adhd-home-reset-planner/cover.png';
import hZoneMap from '../assets/products/adhd-home-reset-planner/zone-map.png';
import hWeeklyReset from '../assets/products/adhd-home-reset-planner/weekly-reset.png';
import hTenMinute from '../assets/products/adhd-home-reset-planner/ten-minute-reset.png';
import hDeepClean from '../assets/products/adhd-home-reset-planner/deep-clean-rotation.png';
import hOneShelf from '../assets/products/adhd-home-reset-planner/one-shelf.png';
import hLaundry from '../assets/products/adhd-home-reset-planner/laundry-loop.png';
import hKitchen from '../assets/products/adhd-home-reset-planner/kitchen-reset.png';
import hBodyDoubling from '../assets/products/adhd-home-reset-planner/body-doubling-log.png';
import hGuestReady from '../assets/products/adhd-home-reset-planner/guest-ready.png';
import hLettingGo from '../assets/products/adhd-home-reset-planner/letting-go.png';

import sCover from '../assets/products/adhd-student-planner/cover.png';
import sClassSchedule from '../assets/products/adhd-student-planner/class-schedule.png';
import sAssignmentTracker from '../assets/products/adhd-student-planner/assignment-tracker.png';
import sProjectBreakdown from '../assets/products/adhd-student-planner/project-breakdown.png';
import sStudySession from '../assets/products/adhd-student-planner/study-session.png';
import sExamCountdown from '../assets/products/adhd-student-planner/exam-countdown.png';
import sWeeklyPlanner from '../assets/products/adhd-student-planner/weekly-planner.png';
import sReadingTracker from '../assets/products/adhd-student-planner/reading-tracker.png';
import sFocusCheckin from '../assets/products/adhd-student-planner/focus-checkin.png';
import sWeekReset from '../assets/products/adhd-student-planner/week-reset.png';

import wCover from '../assets/products/adhd-work-focus-planner/cover.png';
import wWorkdayTop3 from '../assets/products/adhd-work-focus-planner/workday-top-3.png';
import wTaskBreakdown from '../assets/products/adhd-work-focus-planner/task-breakdown.png';
import wFocusSession from '../assets/products/adhd-work-focus-planner/focus-session-tracker.png';
import wEmailTriage from '../assets/products/adhd-work-focus-planner/email-triage.png';
import wMeetingNotes from '../assets/products/adhd-work-focus-planner/meeting-notes.png';
import wContextSwitch from '../assets/products/adhd-work-focus-planner/context-switch-reset.png';
import wWaitingOn from '../assets/products/adhd-work-focus-planner/waiting-on-tracker.png';
import wEndOfDay from '../assets/products/adhd-work-focus-planner/end-of-day-shutdown.png';
import wWeeklyReview from '../assets/products/adhd-work-focus-planner/weekly-work-review.png';

import fCover from '../assets/products/adhd-family-household-planner/cover.png';
import fWeekGlance from '../assets/products/adhd-family-household-planner/week-at-a-glance.png';
import fMentalLoad from '../assets/products/adhd-family-household-planner/mental-load-dump.png';
import fKidRoutine from '../assets/products/adhd-family-household-planner/kid-routine-cards.png';
import fChoreRotation from '../assets/products/adhd-family-household-planner/chore-rotation.png';
import fSchoolPaperwork from '../assets/products/adhd-family-household-planner/school-paperwork.png';
import fContactInfo from '../assets/products/adhd-family-household-planner/contact-info-sheet.png';
import fCaregiverHandoff from '../assets/products/adhd-family-household-planner/caregiver-handoff.png';
import fMealRotation from '../assets/products/adhd-family-household-planner/meal-rotation.png';
import fOneThing from '../assets/products/adhd-family-household-planner/one-thing-for-me.png';

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
  // Which other product's listing this one cross-sells on its own page
  // (the "which other product does this pair with" pattern). A slug key
  // into `products`, resolved lazily so products can reference each other
  // regardless of declaration order.
  pairsWithSlug: string;
}

export const adhdPlannerBundle: Product = {
  slug: 'adhd-planner-bundle',
  title: 'ADHD Planner Bundle',
  shortName: 'Bundle',
  price: 17.99,
  pageCount: 13,
  gumroad: 'https://cooperhawk64.gumroad.com/l/abqkkx',
  payhip: 'https://payhip.com/b/su2J3',
  pairsWithSlug: 'budget-planner',
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
  pairsWithSlug: 'adhd-planner-bundle',
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

export const homeResetPlanner: Product = {
  slug: 'adhd-home-reset-planner',
  title: 'ADHD Home Reset Planner',
  shortName: 'Home Reset',
  price: 17.99,
  pageCount: 11,
  gumroad: 'https://cooperhawk64.gumroad.com/l/adhd-home-reset-planner',
  payhip: 'https://payhip.com/b/adhd-home-reset-planner',
  pairsWithSlug: 'adhd-planner-bundle',
  pages: [
    { id: 'cover', name: 'Cover', img: hCover, alt: 'Cover page of the ADHD Home Reset Planner listing all eleven pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'zone-map', name: 'Zone Map', img: hZoneMap, alt: 'Zone Map page: six blank zone cards to name a home zone and list what is in it, plus a seven-day row to assign a zone to each day of the week', caption: 'Name your own zones, then assign them to days as the week actually goes.' },
    { id: 'weekly-reset', name: 'Weekly Reset Checklist', img: hWeeklyReset, alt: 'Weekly Reset Checklist page: a single list of blank checkbox lines for the handful of things that keep a home functional, done in any order on any day', caption: 'The handful of things that keep a home functional. Any order, any day.' },
    { id: 'ten-minute-reset', name: 'The 10-Minute Reset', img: hTenMinute, alt: 'The 10-Minute Reset page: three numbered blank lines to pick three small tasks, with a printed reference list of ten-minute task ideas underneath', caption: 'No timer printed on the page. Pick three things, not ten.' },
    { id: 'deep-clean-rotation', name: 'Deep Clean Rotation', img: hDeepClean, alt: 'Deep Clean Rotation page: a table with columns for task, area, last done and a done circle, eight undated rows for monthly and seasonal tasks', caption: 'Monthly and seasonal tasks, spread out and undated. Checked off whenever they get done.' },
    { id: 'one-shelf', name: 'One Shelf at a Time', img: hOneShelf, alt: 'One Shelf at a Time page: a single declutter prompt with a blank line for the one spot being decluttered today, and keep, toss and unsure tally lines', caption: 'One small declutter prompt. Not a dated 30-day challenge.' },
    { id: 'laundry-loop', name: 'Laundry Loop Tracker', img: hLaundry, alt: 'Laundry Loop Tracker page: a table with four stage columns, washed, dried, folded and put away, each with a circle to mark, across six load rows', caption: 'Wash, dry, fold, put away as four separate stages, so a load is never lost halfway.' },
    { id: 'kitchen-reset', name: 'Kitchen Reset', img: hKitchen, alt: 'Kitchen Reset page: three columns of checkbox lines for dishes, counters and surfaces, and trash, recycling and fridge check', caption: 'Dishes, counters, trash and recycling, a fridge check. The three things that make a kitchen feel done.' },
    { id: 'body-doubling-log', name: 'Body-Doubling Chore Log', img: hBodyDoubling, alt: 'Body-Doubling Chore Log page: a table with columns for who, room, how long and how it went, across six session rows', caption: 'Who you did it with, which room, how long, how it went.' },
    { id: 'guest-ready', name: 'Guest-Ready Checklist', img: hGuestReady, alt: 'Guest-Ready Checklist page: a single list of blank checkbox lines, the fast version of a reset for when someone is coming over in an hour', caption: 'The fast version. Someone is coming over in an hour.' },
    { id: 'letting-go', name: "What I'm Letting Go This Week", img: hLettingGo, alt: "What I'm Letting Go This Week page: a permission page with one blank line to name the thing not getting done this week on purpose, and a line for what happened instead", caption: 'A permission page. Naming the one thing not getting done, on purpose.' },
  ],
};

export const studentPlanner: Product = {
  slug: 'adhd-student-planner',
  title: 'ADHD Student Planner',
  shortName: 'Student',
  price: 17.99,
  pageCount: 10,
  gumroad: 'https://cooperhawk64.gumroad.com/l/adhd-student-planner',
  payhip: 'https://payhip.com/b/adhd-student-planner',
  pairsWithSlug: 'adhd-planner-bundle',
  pages: [
    { id: 'cover', name: 'Cover', img: sCover, alt: 'Cover page of the ADHD Student Planner listing all ten pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'class-schedule', name: 'Class Schedule & Contacts', img: sClassSchedule, alt: 'Class Schedule and Contacts page: a table with columns for class, instructor, contact and office hours, six rows', caption: 'Every class and how to reach whoever teaches it, in one place.' },
    { id: 'assignment-tracker', name: 'Assignment & Project Tracker', img: sAssignmentTracker, alt: 'Assignment and Project Tracker page: a table with columns for assignment, class, due in days and a done circle, eight rows', caption: 'Due in blank days, not a calendar date. The page stays undated.' },
    { id: 'project-breakdown', name: 'Big Project Breakdown', img: sProjectBreakdown, alt: 'Big Project Breakdown page: four stacked blocks, the project, this month, this week, and the next tiny step', caption: 'The project, this month, this week, then one next tiny step.' },
    { id: 'study-session', name: 'Study Session', img: sStudySession, alt: 'Study Session page: subject and task lines, a body-doubling slot line, and a distraction parking lot checklist', caption: 'Subject, who you studied with, and somewhere to park distractions.' },
    { id: 'exam-countdown', name: 'Exam Prep Countdown', img: sExamCountdown, alt: 'Exam Prep Countdown page: ten blank countdown cards, each with a days-left line and a review task line, no semester dates printed', caption: 'Your own countdown, not a semester date baked into the page.' },
    { id: 'weekly-planner', name: 'Weekly Study & Class Planner', img: sWeeklyPlanner, alt: 'Weekly Study and Class Planner page: three stacked rows for class, study and life, each with seven blank day columns, Monday to Sunday', caption: 'Class, study, life. Three blocks a day, not an hourly grid.' },
    { id: 'reading-tracker', name: 'Reading & Notes Tracker', img: sReadingTracker, alt: 'Reading and Notes Tracker page: a table with columns for reading, how far, and a one-line takeaway, seven rows', caption: 'What to read, how far you got, and one line to remember it by.' },
    { id: 'focus-checkin', name: 'Focus-Time Check-In', img: sFocusCheckin, alt: 'Focus-Time Check-In page: four time-of-day blocks, morning, afternoon, evening and night, each with a circle to mark and a notes line', caption: 'Noticing when focus tends to come easier. Self-observation, not a claim.' },
    { id: 'week-reset', name: 'End-of-Week Reset', img: sWeekReset, alt: "End-of-Week Reset page: a done-this-week checklist, a rolls-to-next-week lines block, and a weekend brain dump lines block", caption: "What's actually done, what rolls over, and a brain dump for the weekend." },
  ],
};

export const workFocusPlanner: Product = {
  slug: 'adhd-work-focus-planner',
  title: 'ADHD Work and Focus Planner',
  shortName: 'Work and Focus',
  price: 17.99,
  pageCount: 10,
  gumroad: 'https://cooperhawk64.gumroad.com/l/adhd-work-focus-planner',
  payhip: 'https://payhip.com/b/adhd-work-focus-planner',
  pairsWithSlug: 'adhd-planner-bundle',
  pages: [
    { id: 'cover', name: 'Cover', img: wCover, alt: 'Cover page of the ADHD Work and Focus Planner listing all ten pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'workday-top-3', name: 'Workday Top 3', img: wWorkdayTop3, alt: 'Workday Top 3 page: three numbered blank lines for the real priorities of the day', caption: 'Three real priorities. Not a task list of twenty.' },
    { id: 'task-breakdown', name: 'Task Breakdown', img: wTaskBreakdown, alt: 'Task Breakdown page: a big task line, four blank steps to get there, and a highlighted next tiny step line', caption: 'The big task, broken into steps, then one next tiny step. Pebble, not mountain.' },
    { id: 'focus-session-tracker', name: 'Focus Session Tracker', img: wFocusSession, alt: 'Focus Session Tracker page: a task line, a body-doubling partner line, and a distraction parking lot checklist', caption: 'Task, a body-doubling slot, a distraction parking lot. No clock time printed.' },
    { id: 'email-triage', name: 'Email and Message Triage', img: wEmailTriage, alt: 'Email and Message Triage page: three columns of checkboxes labeled reply now, reply later and ignore', caption: 'Three buckets only. Reply now, reply later, ignore.' },
    { id: 'meeting-notes', name: 'Meeting Notes Capture', img: wMeetingNotes, alt: 'Meeting Notes Capture page: meeting name and attendee lines, a decisions made section, and a my action items checklist', caption: 'Decisions made, my action items. Nothing else.' },
    { id: 'context-switch-reset', name: 'Context-Switch Reset', img: wContextSwitch, alt: 'Context-Switch Reset page: three short prompts for what you were doing, what pulled you away, and the next step back in', caption: "Thirty seconds, used between tasks, so the thread isn't lost." },
    { id: 'waiting-on-tracker', name: 'Waiting-On Tracker', img: wWaitingOn, alt: 'Waiting-On Tracker page: a table with columns for who, what I need, asked on, and a done circle, across rows', caption: "Blocked on someone else's reply or action, so it doesn't quietly vanish." },
    { id: 'end-of-day-shutdown', name: 'End-of-Day Shutdown Ritual', img: wEndOfDay, alt: 'End-of-Day Shutdown Ritual page: a what got done checklist, a what did not get done section, and a one line for tomorrow prompt', caption: "What got done, what didn't, one line for tomorrow. Then the laptop closes." },
    { id: 'weekly-work-review', name: 'Weekly Work Review', img: wWeeklyReview, alt: 'Weekly Work Review page: a what worked this week section and a what to drop next week section, with no score attached', caption: 'What worked, what to drop. No score attached.' },
  ],
};

export const familyHouseholdPlanner: Product = {
  slug: 'adhd-family-household-planner',
  title: 'ADHD Family and Household Planner',
  shortName: 'Family',
  price: 17.99,
  pageCount: 10,
  gumroad: 'https://cooperhawk64.gumroad.com/l/adhd-family-household-planner',
  payhip: 'https://payhip.com/b/adhd-family-household-planner',
  pairsWithSlug: 'adhd-home-reset-planner',
  pages: [
    { id: 'cover', name: 'Cover', img: fCover, alt: 'Cover page of the ADHD Family and Household Planner listing all ten pages', caption: 'The first sheet, if you keep the set in a folder.' },
    { id: 'week-at-a-glance', name: 'Family Week at a Glance', img: fWeekGlance, alt: 'Family Week at a Glance page: a seven-day grid, Monday to Sunday, with each day split into morning, afternoon and evening lines to write who needs to be where', caption: 'Where everyone needs to be, visible to the whole household, not just the planner-keeper.' },
    { id: 'mental-load-dump', name: 'Mental Load Dump', img: fMentalLoad, alt: "Mental Load Dump page: two columns of blank lines, one for everything being carried and one for what needs to go on someone else's radar too", caption: 'The invisible-labor page. Everything being carried that nobody else can see.' },
    { id: 'kid-routine-cards', name: 'Kid Routine Cards', img: fKidRoutine, alt: 'Kid Routine Cards page: two numbered sequences, morning and bedtime, each with six blank numbered steps written once and reused every day', caption: 'Morning and bedtime sequences, written plainly, reusable every day without rewriting.' },
    { id: 'chore-rotation', name: 'Household Chore Rotation', img: fChoreRotation, alt: 'Household Chore Rotation page: a table with columns for chore, who has it this week, and a done circle, across eight rows', caption: 'Who does what this week, for the whole family, re-assigned weekly rather than fixed forever.' },
    { id: 'school-paperwork', name: 'School Paperwork Tracker', img: fSchoolPaperwork, alt: 'School Paperwork Tracker page: a table with columns for item, due in how many days, and a done circle, across eight rows', caption: 'Permission slips, forms, things due back. Written as "due in," not a calendar date.' },
    { id: 'contact-info-sheet', name: 'Contact and Info Sheet', img: fContactInfo, alt: 'Contact and Info Sheet page: a single list of labeled blank lines for school, pediatrician, dentist, emergency contact, neighbor, sitter and allergy or medical notes', caption: 'School, doctor, emergency numbers, sitter. One page instead of five apps.' },
    { id: 'caregiver-handoff', name: 'Caregiver Handoff Notes', img: fCaregiverHandoff, alt: 'Caregiver Handoff Notes page: two blocks of blank lines, what is happening this week and what a partner, co-parent or sitter needs to know', caption: 'What a partner, co-parent, or sitter needs to know this week, in one place.' },
    { id: 'meal-rotation', name: 'Family Meal Rotation', img: fMealRotation, alt: 'Family Meal Rotation page: a table with columns for meal, groceries needed, and a make-again circle, across eight rows', caption: 'A short list of repeatable, kid-tolerated meals, not a new plan every single day.' },
    { id: 'one-thing-for-me', name: 'One Thing for Me', img: fOneThing, alt: 'One Thing for Me page: a single blank line for one small thing the parent does for themselves this week', caption: 'A single, deliberately small self-care line for the parent. Not a full page, so it never feels like one more thing.' },
  ],
};

export const products: Record<string, Product> = {
  'adhd-planner-bundle': adhdPlannerBundle,
  'budget-planner': budgetPlanner,
  'adhd-home-reset-planner': homeResetPlanner,
  'adhd-student-planner': studentPlanner,
  'adhd-work-focus-planner': workFocusPlanner,
  'adhd-family-household-planner': familyHouseholdPlanner,
};

export function findPage(product: Product, id: string): ProductPage | undefined {
  return product.pages.find((p) => p.id === id);
}

// The "which other product does this pair with" lookup used on every
// product page's cross-sell section. Falls back to the first other product
// in the catalog if a pairing slug is ever missing or stale.
export function pairedProduct(product: Product): Product {
  return products[product.pairsWithSlug] ?? Object.values(products).find((p) => p.slug !== product.slug)!;
}
