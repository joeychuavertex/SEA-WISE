import html2pdf from 'html2pdf.js'
import type { HealthData } from './GoogleFitService'

export interface PDFExportOptions {
  filename?: string
  format?: 'A4' | 'A3' | 'Letter'
  orientation?: 'portrait' | 'landscape'
  margin?: number | number[]
}

export class PDFExportService {
  private defaultOptions: PDFExportOptions = {
    filename: 'health-report.pdf',
    format: 'A4',
    orientation: 'portrait',
    margin: [10, 10, 10, 10]
  }

  /**
   * Export health data as PDF
   */
  async exportHealthData(healthData: HealthData, options: Partial<PDFExportOptions> = {}): Promise<void> {
    const exportOptions = { ...this.defaultOptions, ...options }
    
    // Generate HTML content for the PDF
    const htmlContent = this.generateHealthReportHTML(healthData)
    
    // Create a temporary element to hold the content
    const element = document.createElement('div')
    element.innerHTML = htmlContent
    element.style.position = 'absolute'
    element.style.left = '-9999px'
    element.style.top = '-9999px'
    document.body.appendChild(element)

    try {
      // Configure html2pdf options
      const opt = {
        margin: exportOptions.margin,
        filename: exportOptions.filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: exportOptions.format, 
          orientation: exportOptions.orientation 
        }
      }

      // Generate and download PDF
      await html2pdf().set(opt).from(element).save()
    } finally {
      // Clean up temporary element
      document.body.removeChild(element)
    }
  }

  /**
   * Export current page as PDF
   */
  async exportPage(options: Partial<PDFExportOptions> = {}): Promise<void> {
    const exportOptions = { ...this.defaultOptions, ...options }
    
    // Get the main content element
    const element = document.querySelector('.health-connector') as HTMLElement
    if (!element) {
      throw new Error('Health data content not found')
    }

    // Configure html2pdf options
    const opt = {
      margin: exportOptions.margin,
      filename: exportOptions.filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: exportOptions.format, 
        orientation: exportOptions.orientation 
      }
    }

    // Generate and download PDF
    await html2pdf().set(opt).from(element).save()
  }

  /**
   * Generate HTML content for health report
   */
  private generateHealthReportHTML(healthData: HealthData): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Health Report - ${currentDate}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            color: #6b7280;
            margin: 10px 0 0 0;
            font-size: 16px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section h2 {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .metric-card h3 {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
          }
          .chart-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .chart-title {
            text-align: center;
            margin-bottom: 15px;
            color: #374151;
            font-weight: 600;
          }
          .hourly-chart {
            display: flex;
            align-items: flex-end;
            height: 120px;
            gap: 2px;
            background: #fff;
            padding: 10px;
            border-radius: 6px;
          }
          .hourly-bar {
            flex: 1;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            border-radius: 2px;
            min-height: 10px;
            position: relative;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SEA-WISE Health Report</h1>
          <p>Generated on ${currentDate}</p>
        </div>

        <div class="section">
          <h2>📊 Today's Activity</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Steps</h3>
              <p class="metric-value">${healthData.steps || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Calories Burned</h3>
              <p class="metric-value">${healthData.calories || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Active Minutes</h3>
              <p class="metric-value">${healthData.activeMinutes || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Heart Rate</h3>
              <p class="metric-value">${healthData.heartRate || '--'} BPM</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>😴 Sleep Data</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Sleep Records</h3>
              <p class="metric-value">${healthData.totalSleepRecords || '0'}</p>
            </div>
            <div class="metric-card">
              <h3>Time Asleep</h3>
              <p class="metric-value">${this.formatTime(healthData.totalMinutesAsleep || 0)}</p>
            </div>
            <div class="metric-card">
              <h3>Time in Bed</h3>
              <p class="metric-value">${this.formatTime(healthData.totalTimeInBed || 0)}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>⚖️ Body Metrics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Weight (kg)</h3>
              <p class="metric-value">${(healthData.weightKg || 0).toFixed(1)}</p>
            </div>
            <div class="metric-card">
              <h3>Weight (lbs)</h3>
              <p class="metric-value">${(healthData.weightPounds || 0).toFixed(1)}</p>
            </div>
            <div class="metric-card">
              <h3>Body Fat %</h3>
              <p class="metric-value">${(healthData.fat || 0).toFixed(1)}%</p>
            </div>
            <div class="metric-card">
              <h3>BMI</h3>
              <p class="metric-value">${(healthData.bmi || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🛣️ Distance & Movement</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Total Distance</h3>
              <p class="metric-value">${(healthData.totalDistance || 0).toFixed(2)} km</p>
            </div>
            <div class="metric-card">
              <h3>Very Active</h3>
              <p class="metric-value">${(healthData.veryActiveDistance || 0).toFixed(2)} km</p>
            </div>
            <div class="metric-card">
              <h3>Moderate</h3>
              <p class="metric-value">${(healthData.moderatelyActiveDistance || 0).toFixed(2)} km</p>
            </div>
            <div class="metric-card">
              <h3>Light Activity</h3>
              <p class="metric-value">${(healthData.lightActiveDistance || 0).toFixed(2)} km</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>⏱️ Activity Minutes Breakdown</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Very Active</h3>
              <p class="metric-value">${healthData.veryActiveMinutes || '0'} min</p>
            </div>
            <div class="metric-card">
              <h3>Fairly Active</h3>
              <p class="metric-value">${healthData.fairlyActiveMinutes || '0'} min</p>
            </div>
            <div class="metric-card">
              <h3>Lightly Active</h3>
              <p class="metric-value">${healthData.lightlyActiveMinutes || '0'} min</p>
            </div>
            <div class="metric-card">
              <h3>Sedentary</h3>
              <p class="metric-value">${healthData.sedentaryMinutes || '0'} min</p>
            </div>
          </div>
        </div>

        ${healthData.hourlySteps && healthData.hourlySteps.length > 0 ? `
        <div class="section">
          <h2>📈 Hourly Activity Pattern</h2>
          <div class="chart-section">
            <div class="chart-title">Steps per Hour (24-hour view)</div>
            <div class="hourly-chart">
              ${this.generateHourlyChartHTML(healthData.hourlySteps)}
            </div>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>This report was generated by SEA-WISE Health Connector</p>
          <p>For more information, visit your health dashboard</p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Generate HTML for hourly chart
   */
  private generateHourlyChartHTML(hourlySteps: Array<{ hour: string; steps: number }>): string {
    const maxSteps = Math.max(...hourlySteps.map(h => h.steps))
    
    return hourlySteps.slice(0, 24).map(hourData => {
      const height = maxSteps > 0 ? (hourData.steps / maxSteps) * 100 : 0
      return `<div class="hourly-bar" style="height: ${height}%"></div>`
    }).join('')
  }

  /**
   * Format time in minutes to HH:MM format
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`
  }
}
