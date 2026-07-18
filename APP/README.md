# VentAI React Native Mobile App

This directory contains a complete, cross-platform React Native mobile application matching the features and visual design of the VentAI web application. 

It is built using **Expo**, which is the recommended and easiest way to develop React Native apps. You do not need complex Android or iOS build systems installed on your computer to preview this app—you can test it directly on your own iPhone or Android device!

---

## 🛠️ What We Did

We created a fully functional mobile replica of the VentAI web app inside this folder:
1. **`App.js` (Main Layout & Custom Tab Navigation)**: Set up the overall application framework, safe areas, custom title headers, and a polished bottom tab navigation system that handles switching views.
2. **`config.js` (API Connection Config)**: Concentrated settings to easily configure connection strings for simulators or real physical devices.
3. **`components/PatientForm.js` (Register Patient)**: A scrollable, validated form designed for vital metrics. It calls the backend to register patients and displays the AI recommended values (RR, I:E ratio, BPM) in an elegant, modern card.
4. **`components/PatientList.js` (Patient Directory)**: A high-performance list showing registered patients, built with `FlatList` for speed and memory efficiency. Includes **pull-to-refresh** and **demographics search filtering**.
5. **`components/Recommendation.js` (Doctor Review System)**: A mobile-friendly clinical override workspace. Doctors select a case, view the AI-recommended variables (Mode, VT, PEEP, RR, FiO₂), input overrides, and submit clinical approvals.
6. **`components/Dashboard.js` (System Analytics)**: Shows a 2x2 grid of key statistics (Total Patients, AI Recommendations, Doctor Overrides, and AI Accuracy) alongside a recent logs feed.

## 🔑 Authentication & Role-Based Workspaces

The application features a built-in login mechanism that routes users to custom workspaces depending on their clinical roles:

- **Technician Dashboard**
  - **Credentials**: Username `tech` / Password `tech`
  - **Permissions**: Can **Register Patients** and view the **Patient List**. Cannot review decisions or view dashboard analytics.
- **Physician (Doctor) Dashboard**
  - **Credentials**: Username `doctor` / Password `doctor`
  - **Permissions**: Can access the **Patient List**, review and override AI configurations in the **Review** tab, and view system metrics in the **Dashboard**. Cannot register new patients.

*Note: For testing convenience, "Quick Login" shortcut buttons are provided on the login card to log in with a single tap.*

---

## 🚀 How to Run the App

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Install Dependencies
Open your terminal, navigate to the `APP/` directory, and install the package dependencies:
```bash
cd APP
npm install
```

### 3. Configure the Backend API Connection
Before starting the app, make sure your VentAI backend API is running (`cd backend && npm run dev`).

Open [APP/config.js](file:///c:/Users/shibu/OneDrive/Documents/GitHub/Adaptive-learning-LLM/ventilatorai/APP/config.js) in your editor:
- **If running in iOS Simulator**: You can leave it at `http://localhost:5000`.
- **If running in Android Emulator**: Change `API_BASE_URL` to `http://10.0.2.2:5000` (this is the special loopback IP pointing to your computer host).
- **If running on a Physical Phone**: Find your computer's local Wi-Fi IP address (e.g. `192.168.1.50`) and change the config to `http://192.168.1.50:5000`. Ensure your phone and computer are connected to the same Wi-Fi network.

### 4. Start the Expo Dev Server
Start the development environment by running:
```bash
npm start
```
This will compile the JavaScript and open the Expo Developer Menu, displaying a **QR code** in your terminal.

### 5. Preview on Your Device
- **On Android**: Download the **Expo Go** app from the Google Play Store. Open it and scan the QR code displayed in the terminal.
- **On iOS (iPhone)**: Download the **Expo Go** app from the App Store. Open your iPhone camera app and scan the QR code to open the app inside Expo Go.
- **On Web Browser**: Press `w` in the terminal to view a simulated web rendering.

---

## 📂 Project Structure

```
APP/
├── App.js                 # Main entry, safe area wrapper, header & bottom tab switcher
├── config.js              # Centralized backend URL configuration
├── package.json           # App package dependencies (expo, react-native, axios, expo-linear-gradient)
├── README.md              # Documentation (This file!)
└── components/
    ├── PatientForm.js     # Demographic forms & AI recommendation cards
    ├── PatientList.js     # High performance FlatList patient table with pull-to-refresh
    ├── Recommendation.js  # Doctor review list and clinical parameter overrides
    └── Dashboard.js       # Real-time clinical recommendation metrics dashboard
```

---

## 💡 React Native Key Differences for Beginners

Since you are new to React Native, here are some key differences from React Web developers encounter:
- **No HTML Elements**: Instead of `<div>`, `<p>`, `<h1>`, or `<button>`, React Native uses mobile-native primitives imported from `'react-native'`:
  - `<View>` is like a `<div>` (a layout box).
  - `<Text>` is like a `<p>` or `<span>`. All text *must* be wrapped in a `<Text>` component.
  - `<TextInput>` is like an `<input type="text">`.
  - `<TouchableOpacity>` is the standard button component (it fades in opacity when pressed).
- **Flexbox Layout**: By default, React Native views lay out elements **vertically** (`flexDirection: "column"`), whereas CSS in browsers default layout is horizontal.
- **Styling**: Styles are created using `StyleSheet.create({ ... })`. It supports most CSS properties but writes them in camelCase (e.g. `backgroundColor`, `paddingVertical`, `shadowColor`). Units are in points (pixels), not `rem` or `em`.
- **Keyboard Handling**: On mobile screens, the virtual keyboard can cover inputs. We wrap our form inside a `<KeyboardAvoidingView>` and a scrollable `<ScrollView>` to automatically slide the form up when typing.
- **List Rendering**: In web, we use `.map()` to render tables or long feeds. On mobile, this causes performance lag. We use `<FlatList>` which dynamically renders elements on the screen and recycles off-screen items.
