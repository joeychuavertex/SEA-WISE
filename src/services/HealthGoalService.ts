import type { HealthData } from './GoogleFitService'
import { SeaLionService, type SeaLionMessage } from './SeaLionService'

export class HealthGoalService {
  private seaLionService: SeaLionService

  constructor() {
    this.seaLionService = new SeaLionService()
  }

  async generatePersonalizedPlan(goal: string, healthData: HealthData): Promise<any> {
    try {
      // Try to use SEALION LLM if available
      if (this.seaLionService.isConfigured()) {
        return await this.generatePlanWithSeaLion(goal, healthData)
      } else {
        console.warn('SEALION service not configured, using fallback plan')
        return this.generateFallbackPlan(goal, healthData)
      }
    } catch (error) {
      console.error('Error generating health plan:', error)
      return this.generateFallbackPlan(goal, healthData)
    }
  }

  private async generatePlanWithSeaLion(goal: string, healthData: HealthData): Promise<any> {
    const healthDataContext = this.buildHealthDataContext(healthData)
    
    const messages: SeaLionMessage[] = [
      {
        role: 'system',
        content: `You are a professional health and fitness coach specializing in creating highly detailed, specific, and actionable health plans. Based on the user's goal and health data, generate a comprehensive health plan with EXACT numbers, specific exercises, precise timing, and detailed daily routines.

Respond with a JSON object containing:
{
  "overview": "Brief overview of the plan and approach with specific targets and timeline",
  "dailyRoutine": {
    "title": "Daily Routine (every single day for the entire duration, no breaks)",
    "exercises": [
      {"exercise": "Push-ups", "reps": "100", "sets": "1", "timing": "Morning", "notes": "Perfect form, no cheating"},
      {"exercise": "Sit-ups", "reps": "100", "sets": "1", "timing": "Morning", "notes": "Full range of motion"},
      {"exercise": "Squats", "reps": "100", "sets": "1", "timing": "Morning", "notes": "Deep squats, thighs parallel to ground"},
      {"exercise": "Running", "distance": "10 km", "timing": "Evening", "notes": "~6.2 miles, maintain steady pace"}
    ],
    "lifestyle": [
      "No air conditioning or heating (to build mental toughness)",
      "Eat three meals a day, but only a banana for breakfast",
      "Never skip a day, no matter what",
      "Sleep exactly 8 hours per night"
    ],
    "duration": "3 years minimum",
    "commitment": "Every single day, no exceptions, no breaks"
  },
  "weeklyPlan": [
    {
      "day": "Monday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Tuesday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Wednesday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Thursday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Friday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Saturday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    },
    {
      "day": "Sunday", 
      "activities": "Morning: 100 push-ups, 100 sit-ups, 100 squats (30 minutes). Afternoon: 10km run (45-60 minutes). Evening: Banana breakfast, balanced lunch, light dinner. No AC/heating.",
      "timing": "6:00 AM - 8:00 PM",
      "calories": "Target: 2000-2500 kcal"
    }
  ],
  "nutrition": {
    "breakfast": "1 banana only (105 calories)",
    "lunch": "Balanced meal: 300g chicken breast, 200g brown rice, 150g vegetables (600-700 calories)",
    "dinner": "Light meal: 200g fish, 100g quinoa, 100g salad (400-500 calories)",
    "hydration": "3-4 liters of water daily",
    "supplements": "Multivitamin, Omega-3, Protein powder if needed"
  },
  "milestones": [
    {"title": "Week 1", "description": "Complete all daily exercises without missing a single day", "timeline": "7 days", "measurement": "100% completion rate"},
    {"title": "Month 1", "description": "Improve exercise form and increase running pace by 10%", "timeline": "30 days", "measurement": "Time improvement and form quality"},
    {"title": "Month 3", "description": "Complete all exercises in under 2 hours total daily", "timeline": "90 days", "measurement": "Total daily workout time"},
    {"title": "Month 6", "description": "Increase running distance to 15km daily", "timeline": "180 days", "measurement": "Distance progression"},
    {"title": "Year 1", "description": "Complete 365 consecutive days without missing a single day", "timeline": "365 days", "measurement": "Perfect attendance record"},
    {"title": "Year 3", "description": "Master the routine and consider advanced variations", "timeline": "1095 days", "measurement": "Consistency and mastery"}
  ],
  "tips": [
    "Track every single day - use a calendar or app to mark completion",
    "Start each exercise session with proper warm-up (5 minutes)",
    "Focus on perfect form over speed - quality matters more than quantity",
    "If you miss a day, start over from day 1 - no exceptions",
    "Listen to your body but push through mental barriers",
    "Prepare your workout space the night before",
    "Set multiple alarms to ensure you never forget",
    "Celebrate every week of perfect completion"
  ],
  "warnings": [
    "This is an extremely demanding routine - ensure you're physically capable",
    "Consult a doctor before starting this intense program",
    "Start gradually if you're not already very fit",
    "Listen to your body and adjust if you experience pain or injury",
    "This routine requires immense mental discipline and commitment"
  ]
}

Make the plan extremely specific with exact numbers, precise timing, and detailed instructions. The plan should be so detailed that someone could follow it exactly without any guesswork. Include specific measurements, exact repetitions, precise timing, and clear daily routines that must be followed every single day without exception.`
      },
      {
        role: 'user',
        content: `My health goal: "${goal}"

My current health data:
${healthDataContext}

Please create a personalized health plan to help me achieve this goal.`
      }
    ]

    const response = await this.seaLionService.sendMessage(messages, 0.7)
    
    try {
      // Parse the JSON response from SEALION
      const plan = JSON.parse(response.content)
      
      // Validate the response structure
      if (!plan.overview || !plan.recommendations || !plan.weeklyPlan) {
        throw new Error('Invalid response structure from SEALION')
      }
      
      return plan
    } catch (parseError) {
      console.error('Failed to parse SEALION response:', parseError)
      // Fallback to a structured response based on the raw content
      return this.parseUnstructuredResponse(response.content, goal)
    }
  }

  private buildHealthDataContext(healthData: HealthData): string {
    if (!healthData) {
      return 'No current health data available'
    }

    const context = []
    
    if (healthData.steps) {
      context.push(`Daily steps: ${healthData.steps} steps`)
    }
    
    if (healthData.calories) {
      context.push(`Calories burned: ${healthData.calories} kcal`)
    }
    
    if (healthData.heartRate) {
      context.push(`Average heart rate: ${healthData.heartRate} bpm`)
    }
    
    if (healthData.totalMinutesAsleep) {
      context.push(`Sleep duration: ${Math.round(healthData.totalMinutesAsleep / 60 * 10) / 10} hours`)
    }
    
    if (healthData.weightKg) {
      context.push(`Current weight: ${healthData.weightKg} kg`)
    }
    
    if (healthData.activeMinutes) {
      context.push(`Active minutes: ${healthData.activeMinutes} minutes`)
    }

    return context.length > 0 ? context.join(', ') : 'Limited health data available'
  }

  private parseUnstructuredResponse(content: string, goal: string): any {
    // Fallback parser for when SEALION returns unstructured content
    
    return {
      overview: `Based on your goal "${goal}", here's a personalized health plan generated by our AI coach.`,
      dailyRoutine: {
        title: "Daily Routine (every single day for the entire duration, no breaks)",
        exercises: [
          { exercise: "Push-ups", reps: "50", sets: "2", timing: "Morning", notes: "Perfect form, no cheating" },
          { exercise: "Sit-ups", reps: "50", sets: "2", timing: "Morning", notes: "Full range of motion" },
          { exercise: "Squats", reps: "50", sets: "2", timing: "Morning", notes: "Deep squats, thighs parallel to ground" },
          { exercise: "Running", distance: "5 km", timing: "Evening", notes: "~3.1 miles, maintain steady pace" }
        ],
        lifestyle: [
          "Eat three balanced meals a day",
          "Stay hydrated with 2-3 liters of water daily",
          "Never skip a day, no matter what",
          "Sleep exactly 8 hours per night"
        ],
        duration: "3 months minimum",
        commitment: "Every single day, no exceptions, no breaks"
      },
      weeklyPlan: [
        { 
          day: 'Monday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Tuesday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Wednesday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Thursday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Friday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Saturday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Sunday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        }
      ],
      nutrition: {
        breakfast: "Balanced breakfast: 2 eggs, 1 slice whole grain toast, 1 banana (400 calories)",
        lunch: "Balanced meal: 200g chicken breast, 150g brown rice, 100g vegetables (500-600 calories)",
        dinner: "Light meal: 150g fish, 100g quinoa, 100g salad (350-450 calories)",
        hydration: "2-3 liters of water daily",
        supplements: "Multivitamin recommended"
      },
      milestones: [
        {
          title: 'Week 1',
          description: 'Complete all daily exercises without missing a single day',
          timeline: '7 days',
          measurement: '100% completion rate'
        },
        {
          title: 'Month 1',
          description: 'Improve exercise form and increase running pace by 10%',
          timeline: '30 days',
          measurement: 'Time improvement and form quality'
        },
        {
          title: 'Month 3',
          description: 'Complete all exercises in under 1.5 hours total daily',
          timeline: '90 days',
          measurement: 'Total daily workout time'
        }
      ],
      tips: [
        'Track every single day - use a calendar or app to mark completion',
        'Start each exercise session with proper warm-up (5 minutes)',
        'Focus on perfect form over speed - quality matters more than quantity',
        'If you miss a day, start over from day 1 - no exceptions',
        'Listen to your body and adjust if you experience pain or injury',
        'Prepare your workout space the night before',
        'Set multiple alarms to ensure you never forget',
        'Celebrate every week of perfect completion'
      ],
      warnings: [
        'This is a demanding routine - ensure you\'re physically capable',
        'Consult a doctor before starting this program',
        'Start gradually if you\'re not already fit',
        'Listen to your body and adjust if you experience pain or injury',
        'This routine requires discipline and commitment'
      ],
      aiResponse: content // Include the raw AI response for reference
    }
  }

  private generateFallbackPlan(goal: string, healthData: HealthData): any {
    const dataSummary = healthData ? `Your current health metrics show various data points` : 'No current health data available'
    
    return {
      overview: `Based on your goal "${goal}" and current health data, here's your personalized plan. ${dataSummary}`,
      dailyRoutine: {
        title: "Daily Routine (every single day for the entire duration, no breaks)",
        exercises: [
          { exercise: "Push-ups", reps: "50", sets: "2", timing: "Morning", notes: "Perfect form, no cheating" },
          { exercise: "Sit-ups", reps: "50", sets: "2", timing: "Morning", notes: "Full range of motion" },
          { exercise: "Squats", reps: "50", sets: "2", timing: "Morning", notes: "Deep squats, thighs parallel to ground" },
          { exercise: "Running", distance: "5 km", timing: "Evening", notes: "~3.1 miles, maintain steady pace" }
        ],
        lifestyle: [
          "Eat three balanced meals a day",
          "Stay hydrated with 2-3 liters of water daily",
          "Never skip a day, no matter what",
          "Sleep exactly 8 hours per night"
        ],
        duration: "3 months minimum",
        commitment: "Every single day, no exceptions, no breaks"
      },
      weeklyPlan: [
        { 
          day: 'Monday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Tuesday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Wednesday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Thursday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Friday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Saturday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        },
        { 
          day: 'Sunday', 
          activities: 'Morning: 50 push-ups, 50 sit-ups, 50 squats (20 minutes). Afternoon: 5km run (30-40 minutes). Evening: Balanced meals throughout the day.',
          timing: '6:00 AM - 8:00 PM',
          calories: 'Target: 1800-2200 kcal'
        }
      ],
      nutrition: {
        breakfast: "Balanced breakfast: 2 eggs, 1 slice whole grain toast, 1 banana (400 calories)",
        lunch: "Balanced meal: 200g chicken breast, 150g brown rice, 100g vegetables (500-600 calories)",
        dinner: "Light meal: 150g fish, 100g quinoa, 100g salad (350-450 calories)",
        hydration: "2-3 liters of water daily",
        supplements: "Multivitamin recommended"
      },
      milestones: [
        {
          title: 'Week 1',
          description: 'Complete all daily exercises without missing a single day',
          timeline: '7 days',
          measurement: '100% completion rate'
        },
        {
          title: 'Month 1',
          description: 'Improve exercise form and increase running pace by 10%',
          timeline: '30 days',
          measurement: 'Time improvement and form quality'
        },
        {
          title: 'Month 3',
          description: 'Complete all exercises in under 1.5 hours total daily',
          timeline: '90 days',
          measurement: 'Total daily workout time'
        }
      ],
      tips: [
        'Track every single day - use a calendar or app to mark completion',
        'Start each exercise session with proper warm-up (5 minutes)',
        'Focus on perfect form over speed - quality matters more than quantity',
        'If you miss a day, start over from day 1 - no exceptions',
        'Listen to your body and adjust if you experience pain or injury',
        'Prepare your workout space the night before',
        'Set multiple alarms to ensure you never forget',
        'Celebrate every week of perfect completion'
      ],
      warnings: [
        'This is a demanding routine - ensure you\'re physically capable',
        'Consult a doctor before starting this program',
        'Start gradually if you\'re not already fit',
        'Listen to your body and adjust if you experience pain or injury',
        'This routine requires discipline and commitment'
      ]
    }
  }

  async savePlan(plan: any): Promise<void> {
    // Mock implementation - replace with actual storage
    localStorage.setItem('savedHealthPlan', JSON.stringify(plan))
  }
}