/**
 * Sehatra Health Monitor - Bangle.js App
 * 
 * Custom app untuk mengirim data kesehatan real-time ke platform Sehatra
 * Install app ini di Bangle.js Anda untuk integrasi penuh
 * 
 * Fitur:
 * - Real-time heart rate monitoring
 * - Step counter tracking
 * - Battery level monitoring
 * - Auto-sync via Web Bluetooth
 */

// Configuration
const CONFIG = {
  UPDATE_INTERVAL: 3000, 
  SHOW_UI: true,
  AUTO_START_HRM: true
};

// Global state
let heartRate = 0;
let steps = 0;
let battery = 0;
let isMonitoring = false;
let updateTimer = null;

/**
 * Initialize display
 */
function initDisplay() {
  g.clear();
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0, 0);
  
  // Header
  g.setColor(1, 1, 1);
  g.drawString("SEHATRA", g.getWidth() / 2, 30);
  
  g.setFont("6x8", 1);
  g.drawString("Health Monitor", g.getWidth() / 2, 50);
  
  // Draw initial metrics
  updateDisplay();
}

/**
 * Update display with current metrics
 */
function updateDisplay() {
  // Clear metrics area
  g.setColor(0, 0, 0);
  g.fillRect(0, 70, g.getWidth(), g.getHeight() - 40);
  
  g.setColor(1, 1, 1);
  g.setFont("6x8", 1);
  
  // Heart Rate
  g.setFontAlign(-1, 0, 0);
  g.drawString("Heart Rate:", 10, 85);
  g.setFont("6x8", 2);
  g.drawString(heartRate > 0 ? heartRate + " bpm" : "-- bpm", 10, 105);
  
  // Steps
  g.setFont("6x8", 1);
  g.drawString("Steps:", 10, 135);
  g.setFont("6x8", 2);
  g.drawString(steps + " steps", 10, 155);
  
  // Battery
  g.setFont("6x8", 1);
  g.drawString("Battery:", 10, 185);
  g.setFont("6x8", 2);
  g.drawString(battery + "%", 10, 205);
  
  // Status indicator
  g.setFont("6x8", 1);
  g.setFontAlign(0, 0, 0);
  
  if (isMonitoring) {
    g.setColor(0, 1, 0); // Green
    g.fillCircle(g.getWidth() - 20, 20, 8);
    g.setColor(1, 1, 1);
    g.drawString("LIVE", g.getWidth() / 2, g.getHeight() - 20);
  } else {
    g.setColor(1, 0, 0); // Red
    g.fillCircle(g.getWidth() - 20, 20, 8);
    g.setColor(1, 1, 1);
    g.drawString("PAUSED", g.getWidth() / 2, g.getHeight() - 20);
  }
}

/**
 * Start heart rate monitoring
 */
function startHeartRateMonitor() {
  if (Bangle.isHRMOn && Bangle.isHRMOn()) {
    console.log("HRM already on");
    return;
  }
  
  Bangle.setHRMPower(1, "sehatra");
  
  Bangle.on('HRM', function(hrm) {
    if (hrm.confidence > 50) { // Only use confident readings
      heartRate = hrm.bpm;
      console.log("Heart Rate:", heartRate);
      updateDisplay();
    }
  });
  
  console.log("HRM started");
}

/**
 * Stop heart rate monitoring
 */
function stopHeartRateMonitor() {
  Bangle.setHRMPower(0, "sehatra");
  Bangle.removeAllListeners('HRM');
  console.log("HRM stopped");
}

/**
 * Get step count
 */
function updateStepCount() {
  // Bangle.js 2 has built-in step counter
  if (Bangle.getStepCount) {
    steps = Bangle.getStepCount();
  } else {
    // Fallback for Bangle.js 1
    steps = 0;
  }
  console.log("Steps:", steps);
}

/**
 * Get battery level
 */
function updateBatteryLevel() {
  if (E.getBattery) {
    battery = Math.round(E.getBattery());
  } else {
    battery = 0;
  }
  console.log("Battery:", battery + "%");
}

/**
 * Update all metrics
 */
function updateAllMetrics() {
  updateStepCount();
  updateBatteryLevel();
  updateDisplay();
}

/**
 * Start monitoring
 */
function startMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  
  // Start HRM
  if (CONFIG.AUTO_START_HRM) {
    startHeartRateMonitor();
  }
  
  // Initial update
  updateAllMetrics();
  
  // Set update interval
  updateTimer = setInterval(() => {
    updateAllMetrics();
  }, CONFIG.UPDATE_INTERVAL);
  
  // Vibrate to confirm
  Bangle.buzz(100);
  
  console.log("Monitoring started");
  updateDisplay();
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
  if (!isMonitoring) return;
  
  isMonitoring = false;
  
  // Stop HRM
  stopHeartRateMonitor();
  
  // Clear interval
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
  
  // Vibrate to confirm
  Bangle.buzz(100);
  Bangle.buzz(100);
  
  console.log("Monitoring stopped");
  updateDisplay();
}

/**
 * Handle button press
 */
function handleButton() {
  if (isMonitoring) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
}

/**
 * Setup button handlers
 */
function setupButtons() {
  // BTN1 = toggle monitoring
  setWatch(handleButton, BTN1, { edge: "rising", debounce: 50, repeat: true });
  
  // BTN2 = force refresh (if available on Bangle.js 2)
  if (BTN2) {
    setWatch(() => {
      updateAllMetrics();
      Bangle.buzz(50);
    }, BTN2, { edge: "rising", debounce: 50, repeat: true });
  }
  
  // BTN3 = exit app (if available)
  if (BTN3) {
    setWatch(() => {
      stopMonitoring();
      load(); // Return to launcher
    }, BTN3, { edge: "rising", debounce: 50, repeat: true });
  }
}

/**
 * Cleanup on exit
 */
function cleanup() {
  stopMonitoring();
  g.clear();
  console.log("Sehatra app exited");
}

/**
 * Main initialization
 */
function main() {
  // Clear screen
  g.clear();
  
  // Show loading
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0, 0);
  g.drawString("Loading...", g.getWidth() / 2, g.getHeight() / 2);
  
  // Initialize after short delay
  setTimeout(() => {
    initDisplay();
    setupButtons();
    
    // Auto-start monitoring
    if (CONFIG.AUTO_START_HRM) {
      startMonitoring();
    }
    
    // Show instructions
    setTimeout(() => {
      g.setFont("6x8", 1);
      g.setColor(1, 1, 1);
      g.setFontAlign(0, 0, 0);
      g.drawString("BTN1: Start/Stop", g.getWidth() / 2, g.getHeight() - 40);
    }, 2000);
  }, 500);
}

// Run main
main();
