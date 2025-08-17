export interface HealthInsight {
  metric: string
  value: number
  unit: string
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
  fitnessStandard: string
  culturalSuggestions: string[]
  generalRecommendations: string[]
  context: string
}

export interface CulturalHealthContext {
  region: string
  traditionalPractices: string[]
  modernAdaptations: string[]
  culturalValues: string[]
}

export class HealthInsightsService {
  
  /**
   * Get comprehensive health insights for a metric
   */
  getHealthInsight(metric: string, value: number, additionalData?: any): HealthInsight {
    switch (metric) {
      case 'steps':
        return this.getStepsInsight(value, additionalData)
      case 'calories':
        return this.getCaloriesInsight(value, additionalData)
      case 'sleep':
        return this.getSleepInsight(value, additionalData)
      case 'heartRate':
        return this.getHeartRateInsight(value, additionalData)
      case 'weight':
        return this.getWeightInsight(value, additionalData)
      case 'activity':
        return this.getActivityInsight(value, additionalData)
      case 'bmi':
        return this.getBMIInsight(value, additionalData)
      default:
        return this.getDefaultInsight(metric, value)
    }
  }

  /**
   * Get steps insights with cultural context
   */
  private getStepsInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value >= 10000) {
      healthStatus = 'excellent'
      fitnessStandard = 'Meets WHO daily recommendation (10,000+ steps)'
      context = 'You\'re meeting the global standard for daily physical activity!'
    } else if (value >= 7500) {
      healthStatus = 'good'
      fitnessStandard = 'Good activity level (7,500-9,999 steps)'
      context = 'You\'re maintaining a healthy activity level.'
    } else if (value >= 5000) {
      healthStatus = 'fair'
      fitnessStandard = 'Moderate activity (5,000-7,499 steps)'
      context = 'You\'re getting some activity, but could benefit from more movement.'
    } else if (value >= 2500) {
      healthStatus = 'poor'
      fitnessStandard = 'Low activity (2,500-4,999 steps)'
      context = 'Your activity level is below recommended levels.'
    } else {
      healthStatus = 'needs_attention'
      fitnessStandard = 'Very low activity (<2,500 steps)'
      context = 'Your activity level needs immediate attention.'
    }

    return {
      metric: 'steps',
      value,
      unit: 'steps',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalStepsSuggestions(value),
      generalRecommendations: this.getStepsRecommendations(value),
      context
    }
  }

  /**
   * Get calories insights
   */
  private getCaloriesInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value >= 500) {
      healthStatus = 'excellent'
      fitnessStandard = 'High energy expenditure (500+ calories)'
      context = 'Excellent calorie burn through physical activity!'
    } else if (value >= 300) {
      healthStatus = 'good'
      fitnessStandard = 'Good energy expenditure (300-499 calories)'
      context = 'Good calorie burn, maintaining healthy energy balance.'
    } else if (value >= 150) {
      healthStatus = 'fair'
      fitnessStandard = 'Moderate energy expenditure (150-299 calories)'
      context = 'Moderate activity level, room for improvement.'
    } else {
      healthStatus = 'poor'
      fitnessStandard = 'Low energy expenditure (<150 calories)'
      context = 'Low activity level, consider increasing movement.'
    }

    return {
      metric: 'calories',
      value,
      unit: 'calories',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalCaloriesSuggestions(value),
      generalRecommendations: this.getCaloriesRecommendations(value),
      context
    }
  }

  /**
   * Get sleep insights
   */
  private getSleepInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value >= 8) {
      healthStatus = 'excellent'
      fitnessStandard = 'Optimal sleep duration (8+ hours)'
      context = 'Perfect sleep duration for optimal health and recovery!'
    } else if (value >= 7) {
      healthStatus = 'good'
      fitnessStandard = 'Good sleep duration (7-7.9 hours)'
      context = 'Good sleep duration, within healthy range.'
    } else if (value >= 6) {
      healthStatus = 'fair'
      fitnessStandard = 'Adequate sleep (6-6.9 hours)'
      context = 'Adequate sleep, but could benefit from more rest.'
    } else {
      healthStatus = 'poor'
      fitnessStandard = 'Insufficient sleep (<6 hours)'
      context = 'Sleep duration is below recommended levels.'
    }

    return {
      metric: 'sleep',
      value,
      unit: 'hours',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalSleepSuggestions(value),
      generalRecommendations: this.getSleepRecommendations(value),
      context
    }
  }

  /**
   * Get heart rate insights
   */
  private getHeartRateInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value < 60) {
      healthStatus = 'excellent'
      fitnessStandard = 'Athletic heart rate (<60 BPM)'
      context = 'Excellent cardiovascular fitness, typical of athletes!'
    } else if (value < 100) {
      healthStatus = 'good'
      fitnessStandard = 'Normal resting heart rate (60-99 BPM)'
      context = 'Normal resting heart rate, good cardiovascular health.'
    } else if (value < 120) {
      healthStatus = 'fair'
      fitnessStandard = 'Elevated heart rate (100-119 BPM)'
      context = 'Elevated heart rate, possibly due to recent activity or stress.'
    } else {
      healthStatus = 'needs_attention'
      fitnessStandard = 'High heart rate (120+ BPM)'
      context = 'High heart rate, consider consulting healthcare provider.'
    }

    return {
      metric: 'heartRate',
      value,
      unit: 'BPM',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalHeartRateSuggestions(value),
      generalRecommendations: this.getHeartRateRecommendations(value),
      context
    }
  }

  /**
   * Get weight insights
   */
  private getWeightInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    // This is a simplified example - in practice, weight should be considered with height, age, gender
    if (additionalData?.bmi) {
      const bmi = additionalData.bmi
      if (bmi >= 18.5 && bmi < 25) {
        healthStatus = 'excellent'
        fitnessStandard = 'Healthy BMI range (18.5-24.9)'
        context = 'Your BMI indicates a healthy weight range.'
      } else if (bmi >= 25 && bmi < 30) {
        healthStatus = 'fair'
        fitnessStandard = 'Overweight BMI (25-29.9)'
        context = 'Your BMI indicates overweight, focus on healthy lifestyle changes.'
      } else if (bmi >= 30) {
        healthStatus = 'needs_attention'
        fitnessStandard = 'Obese BMI (30+)'
        context = 'Your BMI indicates obesity, consider professional guidance.'
      } else {
        healthStatus = 'needs_attention'
        fitnessStandard = 'Underweight BMI (<18.5)'
        context = 'Your BMI indicates underweight, consider nutrition consultation.'
      }
    } else {
      healthStatus = 'fair'
      fitnessStandard = 'Weight monitoring recommended'
      context = 'Consider tracking BMI for better health assessment.'
    }

    return {
      metric: 'weight',
      value,
      unit: 'kg',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalWeightSuggestions(value, additionalData),
      generalRecommendations: this.getWeightRecommendations(value, additionalData),
      context
    }
  }

  /**
   * Get activity insights
   */
  private getActivityInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value >= 60) {
      healthStatus = 'excellent'
      fitnessStandard = 'Meets WHO daily activity goal (60+ minutes)'
      context = 'Excellent! You\'re meeting the daily physical activity recommendation.'
    } else if (value >= 30) {
      healthStatus = 'good'
      fitnessStandard = 'Good activity level (30-59 minutes)'
      context = 'Good activity level, close to daily recommendations.'
    } else if (value >= 15) {
      healthStatus = 'fair'
      fitnessStandard = 'Moderate activity (15-29 minutes)'
      context = 'Moderate activity, room for improvement.'
    } else {
      healthStatus = 'poor'
      fitnessStandard = 'Low activity (<15 minutes)'
      context = 'Low activity level, consider increasing movement.'
    }

    return {
      metric: 'activity',
      value,
      unit: 'minutes',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalActivitySuggestions(value),
      generalRecommendations: this.getActivityRecommendations(value),
      context
    }
  }

  /**
   * Get BMI insights
   */
  private getBMIInsight(value: number, additionalData?: any): HealthInsight {
    let healthStatus: HealthInsight['healthStatus']
    let fitnessStandard: string
    let context: string

    if (value >= 18.5 && value < 25) {
      healthStatus = 'excellent'
      fitnessStandard = 'Healthy BMI range (18.5-24.9)'
      context = 'Your BMI indicates a healthy weight range.'
    } else if (value >= 25 && value < 30) {
      healthStatus = 'fair'
      fitnessStandard = 'Overweight BMI (25-29.9)'
      context = 'Your BMI indicates overweight, focus on healthy lifestyle changes.'
    } else if (value >= 30) {
      healthStatus = 'needs_attention'
      fitnessStandard = 'Obese BMI (30+)'
      context = 'Your BMI indicates obesity, consider professional guidance.'
    } else {
      healthStatus = 'needs_attention'
      fitnessStandard = 'Underweight BMI (<18.5)'
      context = 'Your BMI indicates underweight, consider nutrition consultation.'
    }

    return {
      metric: 'bmi',
      value,
      unit: '',
      healthStatus,
      fitnessStandard,
      culturalSuggestions: this.getCulturalBMISuggestions(value),
      generalRecommendations: this.getBMIRecommendations(value),
      context
    }
  }

  /**
   * Get default insight for unknown metrics
   */
  private getDefaultInsight(metric: string, value: number): HealthInsight {
    return {
      metric,
      value,
      unit: '',
      healthStatus: 'fair',
      fitnessStandard: 'Metric monitoring recommended',
      culturalSuggestions: ['Consider consulting local health guidelines'],
      generalRecommendations: ['Monitor this metric regularly'],
      context: 'This metric should be monitored for health awareness.'
    }
  }

  // Cultural suggestions for different metrics
  private getCulturalStepsSuggestions(steps: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🏮 Morning tai chi or qigong for gentle movement')
    suggestions.push('🍃 Evening walking in nature (shinrin-yoku forest bathing)')
    suggestions.push('🚶‍♀️ Family walking traditions after meals')
    
    // Mediterranean cultural practices
    suggestions.push('🌅 Evening passeggiata (leisurely stroll)')
    suggestions.push('🏃‍♂️ Morning jogging along coastal paths')
    suggestions.push('🚶‍♂️ Walking to local markets and cafes')
    
    // Nordic cultural practices
    suggestions.push('❄️ Winter walking in nature (friluftsliv)')
    suggestions.push('🌲 Forest hiking and outdoor activities')
    suggestions.push('🚶‍♀️ Walking to work regardless of weather')
    
    // Latin American cultural practices
    suggestions.push('💃 Dance-based activities (salsa, merengue)')
    suggestions.push('⚽ Family soccer or sports activities')
    suggestions.push('🚶‍♂️ Walking to visit neighbors and family')
    
    return suggestions
  }

  private getCulturalCaloriesSuggestions(calories: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🧘‍♀️ Traditional yoga or martial arts')
    suggestions.push('🏮 Tai chi in the park for gentle exercise')
    suggestions.push('🍃 Morning qigong exercises')
    
    // Mediterranean cultural practices
    suggestions.push('🏊‍♂️ Swimming in local pools or beaches')
    suggestions.push('🚴‍♂️ Cycling through scenic routes')
    suggestions.push('🏃‍♀️ Group running clubs')
    
    // Nordic cultural practices
    suggestions.push('⛷️ Cross-country skiing in winter')
    suggestions.push('🚣‍♀️ Kayaking or canoeing in summer')
    suggestions.push('🏃‍♂️ Trail running in forests')
    
    return suggestions
  }

  private getCulturalSleepSuggestions(hours: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍵 Evening herbal tea rituals (chamomile, lavender)')
    suggestions.push('🧘‍♀️ Pre-sleep meditation or mindfulness')
    suggestions.push('🛁 Warm bath with essential oils')
    
    // Mediterranean cultural practices
    suggestions.push('🍷 Evening wine and conversation (moderation)')
    suggestions.push('🌅 Siesta culture for afternoon rest')
    suggestions.push('🕯️ Relaxing evening routines')
    
    // Nordic cultural practices
    suggestions.push('🕯️ Hygge evening atmosphere with candles')
    suggestions.push('📚 Evening reading in cozy settings')
    suggestions.push('🌲 Nature sounds for relaxation')
    
    return suggestions
  }

  private getCulturalHeartRateSuggestions(bpm: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🧘‍♀️ Deep breathing exercises (pranayama)')
    suggestions.push('🍵 Green tea for heart health')
    suggestions.push('🏮 Tai chi for stress reduction')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Olive oil and heart-healthy diet')
    suggestions.push('🍷 Moderate red wine consumption')
    suggestions.push('🌅 Relaxing sunset walks')
    
    // Nordic cultural practices
    suggestions.push('❄️ Cold exposure therapy (sauna + cold plunge)')
    suggestions.push('🌲 Forest therapy for stress reduction')
    suggestions.push('🏃‍♂️ Moderate outdoor exercise')
    
    return suggestions
  }

  private getCulturalWeightSuggestions(weight: number, additionalData?: any): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍚 Balanced rice and vegetable meals')
    suggestions.push('🍵 Green tea for metabolism')
    suggestions.push('🧘‍♀️ Mindful eating practices')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Mediterranean diet principles')
    suggestions.push('🍷 Social dining experiences')
    suggestions.push('🌅 Active lifestyle integration')
    
    // Nordic cultural practices
    suggestions.push('🐟 Omega-3 rich fish consumption')
    suggestions.push('🌾 Whole grain and berry focus')
    suggestions.push('🏃‍♂️ Outdoor activity emphasis')
    
    return suggestions
  }

  private getCulturalActivitySuggestions(minutes: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🏮 Morning tai chi in the park')
    suggestions.push('🍃 Evening walking meditation')
    suggestions.push('🧘‍♀️ Yoga classes with community')
    
    // Mediterranean cultural practices
    suggestions.push('🌅 Morning beach walks')
    suggestions.push('🏊‍♂️ Swimming in local pools')
    suggestions.push('🚴‍♂️ Cycling through scenic routes')
    
    // Nordic cultural practices
    suggestions.push('❄️ Winter sports and activities')
    suggestions.push('🌲 Forest hiking and exploration')
    suggestions.push('🚣‍♀️ Summer water activities')
    
    return suggestions
  }

  private getCulturalBMISuggestions(bmi: number): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍚 Traditional balanced meal planning')
    suggestions.push('🧘‍♀️ Mindful eating and portion control')
    suggestions.push('🏮 Regular tai chi or qigong practice')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Mediterranean diet principles')
    suggestions.push('🍷 Social and enjoyable eating')
    suggestions.push('🌅 Active lifestyle integration')
    
    // Nordic cultural practices
    suggestions.push('🐟 Healthy fish and lean protein')
    suggestions.push('🌾 Whole grain and vegetable focus')
    suggestions.push('🏃‍♂️ Regular outdoor activities')
    
    return suggestions
  }

  // General recommendations for different metrics
  private getStepsRecommendations(steps: number): string[] {
    const recommendations = []
    
    if (steps < 5000) {
      recommendations.push('Start with short 10-minute walks')
      recommendations.push('Take the stairs instead of elevators')
      recommendations.push('Park further from destinations')
    } else if (steps < 7500) {
      recommendations.push('Add a 15-minute evening walk')
      recommendations.push('Take walking breaks during work')
      recommendations.push('Join a walking group or club')
    } else if (steps < 10000) {
      recommendations.push('Add 5-10 minute walking sessions')
      recommendations.push('Try power walking for intensity')
      recommendations.push('Explore new walking routes')
    }
    
    return recommendations
  }

  private getCaloriesRecommendations(calories: number): string[] {
    const recommendations = []
    
    if (calories < 150) {
      recommendations.push('Start with 10-minute exercise sessions')
      recommendations.push('Take regular movement breaks')
      recommendations.push('Try gentle yoga or stretching')
    } else if (calories < 300) {
      recommendations.push('Add moderate-intensity activities')
      recommendations.push('Try brisk walking or cycling')
      recommendations.push('Incorporate strength training')
    } else if (calories < 500) {
      recommendations.push('Maintain current activity level')
      recommendations.push('Add variety to your routine')
      recommendations.push('Consider high-intensity intervals')
    }
    
    return recommendations
  }

  private getSleepRecommendations(hours: number): string[] {
    const recommendations = []
    
    if (hours < 6) {
      recommendations.push('Establish consistent bedtime routine')
      recommendations.push('Limit screen time before bed')
      recommendations.push('Create a dark, quiet sleep environment')
    } else if (hours < 7) {
      recommendations.push('Go to bed 30 minutes earlier')
      recommendations.push('Practice relaxation techniques')
      recommendations.push('Avoid caffeine after 2 PM')
    } else if (hours < 8) {
      recommendations.push('Maintain good sleep hygiene')
      recommendations.push('Consider adding 15-30 minutes')
      recommendations.push('Monitor sleep quality')
    }
    
    return recommendations
  }

  private getHeartRateRecommendations(bpm: number): string[] {
    const recommendations = []
    
    if (bpm >= 120) {
      recommendations.push('Practice deep breathing exercises')
      recommendations.push('Consider stress management techniques')
      recommendations.push('Consult healthcare provider if persistent')
    } else if (bpm >= 100) {
      recommendations.push('Engage in relaxation activities')
      recommendations.push('Monitor stress levels')
      recommendations.push('Practice mindfulness techniques')
    } else if (bpm < 60) {
      recommendations.push('Excellent cardiovascular fitness')
      recommendations.push('Maintain current activity level')
      recommendations.push('Regular health checkups')
    }
    
    return recommendations
  }

  private getWeightRecommendations(weight: number, additionalData?: any): string[] {
    const recommendations = []
    
    if (additionalData?.bmi) {
      const bmi = additionalData.bmi
      if (bmi >= 25) {
        recommendations.push('Focus on balanced nutrition')
        recommendations.push('Increase physical activity gradually')
        recommendations.push('Consider professional guidance')
      } else if (bmi < 18.5) {
        recommendations.push('Focus on nutrient-dense foods')
        recommendations.push('Gradual strength training')
        recommendations.push('Consult nutrition professional')
      } else {
        recommendations.push('Maintain healthy lifestyle')
        recommendations.push('Regular health monitoring')
        recommendations.push('Balanced diet and exercise')
      }
    }
    
    return recommendations
  }

  private getActivityRecommendations(minutes: number): string[] {
    const recommendations = []
    
    if (minutes < 15) {
      recommendations.push('Start with 5-minute activity sessions')
      recommendations.push('Take regular movement breaks')
      recommendations.push('Try gentle stretching exercises')
    } else if (minutes < 30) {
      recommendations.push('Add 10-minute exercise sessions')
      recommendations.push('Incorporate daily walking')
      recommendations.push('Try beginner fitness classes')
    } else if (minutes < 60) {
      recommendations.push('Add moderate-intensity activities')
      recommendations.push('Try strength training')
      recommendations.push('Increase workout duration')
    }
    
    return recommendations
  }

  private getBMIRecommendations(bmi: number): string[] {
    const recommendations = []
    
    if (bmi >= 30) {
      recommendations.push('Consult healthcare provider')
      recommendations.push('Focus on lifestyle changes')
      recommendations.push('Consider professional support')
    } else if (bmi >= 25) {
      recommendations.push('Balanced diet and exercise')
      recommendations.push('Gradual weight management')
      recommendations.push('Regular health monitoring')
    } else if (bmi < 18.5) {
      recommendations.push('Focus on healthy weight gain')
      recommendations.push('Nutrient-dense nutrition')
      recommendations.push('Professional guidance recommended')
    } else {
      recommendations.push('Maintain healthy lifestyle')
      recommendations.push('Regular health checkups')
      recommendations.push('Balanced nutrition and activity')
    }
    
    return recommendations
  }

  /**
   * Get cultural health context for different regions
   */
  getCulturalHealthContext(region: string): CulturalHealthContext {
    const contexts: Record<string, CulturalHealthContext> = {
      'asian': {
        region: 'Asian',
        traditionalPractices: [
          'Traditional Chinese Medicine (TCM)',
          'Ayurvedic practices',
          'Mind-body exercises (Tai Chi, Qigong)',
          'Herbal medicine traditions',
          'Acupuncture and acupressure'
        ],
        modernAdaptations: [
          'Integrating traditional and modern medicine',
          'Mindfulness and meditation apps',
          'Community-based health programs',
          'Traditional diet with modern nutrition science'
        ],
        culturalValues: [
          'Balance and harmony (yin-yang)',
          'Prevention over treatment',
          'Family and community health',
          'Holistic wellness approach'
        ]
      },
      'mediterranean': {
        region: 'Mediterranean',
        traditionalPractices: [
          'Mediterranean diet',
          'Social dining and family meals',
          'Outdoor activities and walking',
          'Wine culture in moderation',
          'Seasonal and local food focus'
        ],
        modernAdaptations: [
          'Mediterranean diet research and guidelines',
          'Social fitness and wellness programs',
          'Sustainable and local food movements',
          'Community health initiatives'
        ],
        culturalValues: [
          'Social connection and community',
          'Enjoyment of food and life',
          'Balance and moderation',
          'Connection to nature and seasons'
        ]
      },
      'nordic': {
        region: 'Nordic',
        traditionalPractices: [
          'Friluftsliv (outdoor life)',
          'Sauna culture',
          'Cold exposure therapy',
          'Forest bathing and nature connection',
          'Seasonal outdoor activities'
        ],
        modernAdaptations: [
          'Forest therapy and ecotherapy',
          'Cold exposure research and practices',
          'Outdoor education programs',
          'Sustainable living practices'
        ],
        culturalValues: [
          'Connection to nature',
          'Resilience and adaptability',
          'Sustainability and environmental care',
          'Community and social responsibility'
        ]
      },
      'latin_american': {
        region: 'Latin American',
        traditionalPractices: [
          'Traditional healing practices',
          'Family and community health',
          'Dance and movement traditions',
          'Herbal medicine and natural remedies',
          'Social and cultural celebrations'
        ],
        modernAdaptations: [
          'Community health programs',
          'Dance fitness and movement classes',
          'Traditional medicine integration',
          'Cultural health awareness'
        ],
        culturalValues: [
          'Family and community bonds',
          'Joy and celebration of life',
          'Connection to cultural heritage',
          'Natural and holistic approaches'
        ]
      }
    }
    
    return contexts[region] || contexts['asian'] // Default to Asian context
  }
}
