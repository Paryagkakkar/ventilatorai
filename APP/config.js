// Configure your API Base URL here
// - For iOS Simulator: "http://localhost:5000"
// - For Android Emulator: "http://10.0.2.2:5000"
// - For Physical Device (Expo Go): Use your computer's local network IP (e.g., "http://192.168.1.100:5000")

const API_BASE_URL = "http://10.114.16.249:5000";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export { API_BASE_URL };
