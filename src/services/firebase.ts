import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC4qHKfiFzEdY4pmhPfRVLfRw43mTP3Q_8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seawise-d9093.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seawise-d9093",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seawise-d9093.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1041429172849",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1041429172849:web:bdf63920641254a4b501d0",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-51FLF9CWPJ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)

// Connect to emulators in development (optional)
if (import.meta.env.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectFirestoreEmulator(db, 'localhost', 8080)
  // connectAuthEmulator(auth, 'http://localhost:9099')
}

export default app
