<template>
  <aside class="personal-info-panel" role="complementary" aria-label="Personal Information">
    <div class="panel-header">
      <h2>Personal Information</h2>
      <div class="header-actions">
        <button 
          @click="generateMockData" 
          class="generate-btn"
          aria-label="Generate new mock data"
        >
          Generate Data
        </button>
        <button 
          @click="toggleEdit" 
          class="edit-btn"
          :aria-label="isEditing ? 'Save changes' : 'Edit personal information'"
        >
          {{ isEditing ? 'Save' : 'Edit' }}
        </button>
      </div>
    </div>
    
    <div class="panel-content">
      <div v-if="!isEditing" class="info-display">
        <div class="info-section">
          <h3>Basic Information</h3>
          <div class="info-item">
            <label>Name:</label>
            <span>{{ personalInfo.name || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Age:</label>
            <span>{{ personalInfo.age || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Gender:</label>
            <span>{{ personalInfo.gender || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Height:</label>
            <span>{{ personalInfo.height ? `${personalInfo.height} cm` : 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Weight:</label>
            <span>{{ personalInfo.weight ? `${personalInfo.weight} kg` : 'Not provided' }}</span>
          </div>
        </div>
        
        <div class="info-section">
          <h3>Health Conditions</h3>
          <div class="info-item">
            <label>Medical Conditions:</label>
            <span>{{ personalInfo.medicalConditions.length > 0 ? personalInfo.medicalConditions.join(', ') : 'None reported' }}</span>
          </div>
          <div class="info-item">
            <label>Allergies:</label>
            <span>{{ personalInfo.allergies.length > 0 ? personalInfo.allergies.join(', ') : 'None reported' }}</span>
          </div>
          <div class="info-item">
            <label>Medications:</label>
            <span>{{ personalInfo.medications.length > 0 ? personalInfo.medications.join(', ') : 'None reported' }}</span>
          </div>
        </div>
        
        <div class="info-section">
          <h3>Emergency Contact</h3>
          <div class="info-item">
            <label>Contact Name:</label>
            <span>{{ personalInfo.emergencyContact.name || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Phone:</label>
            <span>{{ personalInfo.emergencyContact.phone || 'Not provided' }}</span>
          </div>
          <div class="info-item">
            <label>Relationship:</label>
            <span>{{ personalInfo.emergencyContact.relationship || 'Not provided' }}</span>
          </div>
        </div>
      </div>
      
      <form v-else @submit.prevent="saveInfo" class="info-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input 
              id="name"
              v-model="editForm.name" 
              type="text" 
              required
              placeholder="Enter your full name"
            />
          </div>
          <div class="form-group">
            <label for="age">Age</label>
            <input 
              id="age"
              v-model.number="editForm.age" 
              type="number" 
              min="1" 
              max="120"
              placeholder="Enter your age"
            />
          </div>
          <div class="form-group">
            <label for="gender">Gender</label>
            <select id="gender" v-model="editForm.gender">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
          <div class="form-group">
            <label for="height">Height (cm)</label>
            <input 
              id="height"
              v-model.number="editForm.height" 
              type="number" 
              min="50" 
              max="250"
              placeholder="Enter height in cm"
            />
          </div>
          <div class="form-group">
            <label for="weight">Weight (kg)</label>
            <input 
              id="weight"
              v-model.number="editForm.weight" 
              type="number" 
              min="20" 
              max="300"
              placeholder="Enter weight in kg"
            />
          </div>
        </div>
        
        <div class="form-section">
          <h3>Health Conditions</h3>
          <div class="form-group">
            <label for="medical-conditions">Medical Conditions</label>
            <textarea 
              id="medical-conditions"
              v-model="medicalConditionsText" 
              placeholder="Enter medical conditions separated by commas"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="allergies">Allergies</label>
            <textarea 
              id="allergies"
              v-model="allergiesText" 
              placeholder="Enter allergies separated by commas"
              rows="2"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="medications">Current Medications</label>
            <textarea 
              id="medications"
              v-model="medicationsText" 
              placeholder="Enter current medications separated by commas"
              rows="2"
            ></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Emergency Contact</h3>
          <div class="form-group">
            <label for="emergency-name">Contact Name</label>
            <input 
              id="emergency-name"
              v-model="editForm.emergencyContact.name" 
              type="text" 
              placeholder="Enter emergency contact name"
            />
          </div>
          <div class="form-group">
            <label for="emergency-phone">Phone Number</label>
            <input 
              id="emergency-phone"
              v-model="editForm.emergencyContact.phone" 
              type="tel" 
              placeholder="Enter phone number"
            />
          </div>
          <div class="form-group">
            <label for="emergency-relationship">Relationship</label>
            <input 
              id="emergency-relationship"
              v-model="editForm.emergencyContact.relationship" 
              type="text" 
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="cancelEdit" class="cancel-btn">Cancel</button>
          <button type="submit" class="save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface PersonalInfo {
  name: string
  age: number | null
  gender: string
  height: number | null
  weight: number | null
  medicalConditions: string[]
  allergies: string[]
  medications: string[]
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

// Default personal information with Singaporean mock data
const personalInfo = ref<PersonalInfo>({
  name: 'Lim Jia Hui',
  age: 34,
  gender: 'female',
  height: 165,
  weight: 58,
  medicalConditions: ['Type 2 Diabetes', 'Hypertension', 'Allergic Rhinitis'],
  allergies: ['Dust Mites', 'Shellfish', 'Prawns'],
  medications: ['Metformin 500mg', 'Amlodipine 5mg', 'Cetirizine 10mg'],
  emergencyContact: {
    name: 'Tan Wei Ming',
    phone: '+65 9123 4567',
    relationship: 'Spouse'
  }
})

// Edit state
const isEditing = ref(false)
const editForm = reactive<PersonalInfo>({
  name: '',
  age: null,
  gender: '',
  height: null,
  weight: null,
  medicalConditions: [],
  allergies: [],
  medications: [],
  emergencyContact: {
    name: '',
    phone: '',
    relationship: ''
  }
})

// Computed properties for textarea values
const medicalConditionsText = computed({
  get: () => personalInfo.value.medicalConditions.join(', '),
  set: (value: string) => {
    editForm.medicalConditions = value.split(',').map(item => item.trim()).filter(item => item)
  }
})

const allergiesText = computed({
  get: () => personalInfo.value.allergies.join(', '),
  set: (value: string) => {
    editForm.allergies = value.split(',').map(item => item.trim()).filter(item => item)
  }
})

const medicationsText = computed({
  get: () => personalInfo.value.medications.join(', '),
  set: (value: string) => {
    editForm.medications = value.split(',').map(item => item.trim()).filter(item => item)
  }
})

// Methods
const toggleEdit = () => {
  if (isEditing.value) {
    saveInfo()
  } else {
    startEdit()
  }
}

const startEdit = () => {
  // Copy current data to edit form
  Object.assign(editForm, JSON.parse(JSON.stringify(personalInfo.value)))
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  // Reset edit form to current data
  Object.assign(editForm, JSON.parse(JSON.stringify(personalInfo.value)))
}

const saveInfo = () => {
  // Validate required fields
  if (!editForm.name.trim()) {
    alert('Name is required')
    return
  }
  
  // Update personal info
  Object.assign(personalInfo.value, JSON.parse(JSON.stringify(editForm)))
  
  // Save to localStorage
  localStorage.setItem('personalInfo', JSON.stringify(personalInfo.value))
  
  isEditing.value = false
}

const loadPersonalInfo = () => {
  const saved = localStorage.getItem('personalInfo')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(personalInfo.value, parsed)
    } catch (error) {
      console.error('Error loading personal info:', error)
    }
  }
}

const generateMockData = () => {
  const mockData = {
    names: [
      'Tan Wei Ming', 'Lim Jia Hui', 'Ng Kai Leong', 'Chua Mei Ling', 'Ooi Zhi Hao',
      'Wong Siew Choo', 'Goh Boon Kiat', 'Lee Xin Yi', 'Teo Jia Wei', 'Koh Pei Shan',
      'Ang Ming Hui', 'Yeo Jia En', 'Chew Wei Jie', 'Tay Jia Min', 'Sim Kai Xuan',
      'Loh Pei Ting', 'Chong Wei Ming', 'Ho Jia Qi', 'Pang Kai En', 'Quek Siew Hui'
    ],
    genders: ['male', 'female', 'other'],
    medicalConditions: [
      ['Type 2 Diabetes', 'Hypertension'],
      ['Asthma', 'Allergic Rhinitis'],
      ['High Cholesterol', 'Osteoarthritis'],
      ['Migraine', 'Anxiety Disorder'],
      ['None'],
      ['Diabetes', 'Ischemic Heart Disease', 'High Blood Pressure'],
      ['Gout', 'GERD'],
      ['Depression', 'Sleep Apnea']
    ],
    allergies: [
      ['Peanuts', 'Shellfish'],
      ['Dust Mites', 'Pollen'],
      ['Penicillin', 'Latex'],
      ['None'],
      ['Nuts', 'Dairy', 'Soy'],
      ['Seafood', 'Eggs'],
      ['Prawns', 'Crab']
    ],
    medications: [
      ['Metformin 500mg', 'Amlodipine 5mg'],
      ['Salbutamol inhaler', 'Cetirizine 10mg'],
      ['Atorvastatin 20mg', 'Paracetamol 500mg'],
      ['None'],
      ['Insulin', 'Metoprolol 25mg', 'Omeprazole 20mg'],
      ['Gliclazide 80mg', 'Losartan 50mg'],
      ['Montelukast 10mg', 'Fluticasone nasal spray']
    ],
    emergencyContacts: [
      { name: 'Tan Wei Ming', phone: '+65 9123 4567', relationship: 'Spouse' },
      { name: 'Lim Jia Hui', phone: '+65 8234 5678', relationship: 'Sister' },
      { name: 'Ng Kai Leong', phone: '+65 9345 6789', relationship: 'Brother' },
      { name: 'Chua Mei Ling', phone: '+65 8456 7890', relationship: 'Mother' },
      { name: 'Ooi Zhi Hao', phone: '+65 9567 8901', relationship: 'Father' },
      { name: 'Wong Siew Choo', phone: '+65 8678 9012', relationship: 'Daughter' },
      { name: 'Goh Boon Kiat', phone: '+65 9789 0123', relationship: 'Son' }
    ]
  }

  const randomName = mockData.names[Math.floor(Math.random() * mockData.names.length)]
  const randomGender = mockData.genders[Math.floor(Math.random() * mockData.genders.length)]
  const randomConditions = mockData.medicalConditions[Math.floor(Math.random() * mockData.medicalConditions.length)]
  const randomAllergies = mockData.allergies[Math.floor(Math.random() * mockData.allergies.length)]
  const randomMedications = mockData.medications[Math.floor(Math.random() * mockData.medications.length)]
  const randomContact = mockData.emergencyContacts[Math.floor(Math.random() * mockData.emergencyContacts.length)]

  personalInfo.value = {
    name: randomName,
    age: Math.floor(Math.random() * 50) + 20, // Age between 20-70
    gender: randomGender,
    height: Math.floor(Math.random() * 40) + 150, // Height between 150-190 cm
    weight: Math.floor(Math.random() * 40) + 50, // Weight between 50-90 kg
    medicalConditions: randomConditions,
    allergies: randomAllergies,
    medications: randomMedications,
    emergencyContact: randomContact
  }

  // Save to localStorage
  localStorage.setItem('personalInfo', JSON.stringify(personalInfo.value))
}

// Load data on mount
onMounted(() => {
  loadPersonalInfo()
})
</script>

<style scoped>
.personal-info-panel {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  height: fit-content;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  position: sticky;
  top: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid #e5e7eb;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.generate-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

.edit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.info-section {
  margin-bottom: var(--spacing-lg);
}

.info-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: var(--spacing-sm);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid #f9fafb;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-item label {
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
}

.info-item span {
  color: #111827;
  text-align: right;
  word-break: break-word;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: var(--spacing-md);
  background: #f9fafb;
}

.form-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-md);
  border-top: 1px solid #e5e7eb;
}

.cancel-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.save-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .personal-info-panel {
    position: static;
    max-height: none;
    margin-bottom: var(--spacing-lg);
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .generate-btn,
  .edit-btn {
    flex: 1;
    margin: 0 var(--spacing-xs);
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .info-item label {
    min-width: auto;
    margin-right: 0;
  }
  
  .info-item span {
    text-align: left;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .save-btn {
    width: 100%;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .personal-info-panel {
    border-width: 2px;
    border-color: #000000;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: 3px solid #0000ff;
    border-color: #000000;
  }
}
</style>
