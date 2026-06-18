/**
 * Bangle.js Web Bluetooth Connector
 * Handles real-time connection and data streaming from Bangle.js smartwatch
 */

export interface BangleJSMetrics {
  heartRate: number | null;
  steps: number | null;
  battery: number | null;
  temperature: number | null;
}

export interface BangleJSConfig {
  onHeartRateChange?: (value: number) => void;
  onStepsChange?: (value: number) => void;
  onBatteryChange?: (value: number) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class BangleJSConnector {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private config: BangleJSConfig = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(config?: BangleJSConfig) {
    this.config = config || {};
  }

  /**
   * Check if Web Bluetooth API is supported
   */
  static isSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'bluetooth' in navigator;
  }

  /**
   * Connect to Bangle.js device via Web Bluetooth
   */
  async connect(): Promise<boolean> {
    try {
      if (!BangleJSConnector.isSupported()) {
        throw new Error('Web Bluetooth tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera.');
      }

      console.log('Mencari smartwatch dengan Heart Rate service...');

      // Request device with Heart Rate service filter
      // This allows ANY device with standard BLE Heart Rate Service:
      // - Bangle.js (1 & 2)
      // - Polar H10, Polar Verity Sense
      // - Wahoo TICKR, TICKR FIT, TICKR X
      // - Garmin HRM-Pro
      // - CooSpo, Magene, and other BLE HRM sensors
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] }  // Standard Heart Rate Service (0x180D)
        ],
        optionalServices: [
          'battery_service',      // 0x180F (for battery level)
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e' // Nordic UART Service (for Bangle.js custom commands)
        ]
      });

      if (!this.device) {
        throw new Error('Tidak ada perangkat yang dipilih');
      }

      console.log('Perangkat ditemukan:', this.device.name);

      // Connect to GATT server
      this.server = await this.device.gatt!.connect();
      console.log('🔗 Terhubung ke GATT server');

      // Setup disconnect handler
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      // Subscribe to services
      await this.subscribeToServices();

      this.isConnected = true;
      this.reconnectAttempts = 0;

      return true;
    } catch (error) {
      console.error('❌ Koneksi gagal:', error);
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Subscribe to heart rate and other services
   */
  private async subscribeToServices(): Promise<void> {
    if (!this.server) return;

    try {
      // Subscribe to Heart Rate Service
      const heartRateService = await this.server.getPrimaryService('heart_rate');
      this.heartRateCharacteristic = await heartRateService.getCharacteristic('heart_rate_measurement');
      
      await this.heartRateCharacteristic.startNotifications();
      this.heartRateCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          const heartRate = this.parseHeartRate(value);
          console.log('❤️ Heart Rate:', heartRate, 'bpm');
          this.config.onHeartRateChange?.(heartRate);
        }
      });
      console.log('✅ Heart Rate service subscribed');
    } catch (error) {
      console.warn('⚠️ Heart Rate service tidak tersedia:', error);
    }

    try {
      // Subscribe to Battery Service
      const batteryService = await this.server.getPrimaryService('battery_service');
      const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
      
      await batteryCharacteristic.startNotifications();
      batteryCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        const value = target.value;
        if (value) {
          const battery = value.getUint8(0);
          console.log('🔋 Battery:', battery, '%');
          this.config.onBatteryChange?.(battery);
        }
      });
      console.log('✅ Battery service subscribed');
    } catch (error) {
      console.warn('⚠️ Battery service tidak tersedia:', error);
    }
  }

  /**
   * Parse heart rate from BLE characteristic value
   * Based on Bluetooth Heart Rate Measurement specification
   */
  private parseHeartRate(value: DataView): number {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x1;
    let heartRate: number;

    if (rate16Bits) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }

    return heartRate;
  }

  /**
   * Get current heart rate (one-time read)
   */
  async getHeartRate(): Promise<number | null> {
    try {
      if (!this.heartRateCharacteristic) {
        console.warn('Heart rate characteristic not available');
        return null;
      }

      const value = await this.heartRateCharacteristic.readValue();
      return this.parseHeartRate(value);
    } catch (error) {
      console.error('Failed to read heart rate:', error);
      return null;
    }
  }

  /**
   * Get battery level
   */
  async getBatteryLevel(): Promise<number | null> {
    try {
      if (!this.server) return null;

      const batteryService = await this.server.getPrimaryService('battery_service');
      const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
      const value = await batteryCharacteristic.readValue();
      
      return value.getUint8(0);
    } catch (error) {
      console.error('Failed to read battery:', error);
      return null;
    }
  }

  /**
   * Send command to Bangle.js via Nordic UART Service
   * This allows custom JavaScript execution on the watch
   */
  async sendCommand(command: string): Promise<void> {
    try {
      if (!this.server) {
        throw new Error('Not connected to device');
      }

      const uartService = await this.server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
      const txCharacteristic = await uartService.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
      
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      
      await txCharacteristic.writeValue(data);
      console.log('📤 Command sent:', command);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  /**
   * Request step count from Bangle.js
   */
  async getStepCount(): Promise<number | null> {
    try {
      // Send command to Bangle.js to get step count
      // This requires the watch to have step counting enabled
      await this.sendCommand('Bangle.getStepCount()');
      
      // In real implementation, you'd listen for response via UART RX
      // For now, return null as placeholder
      return null;
    } catch (error) {
      console.error('Failed to get step count:', error);
      return null;
    }
  }

  /**
   * Handle disconnection
   */
  private onDisconnected(): void {
    console.log('🔌 Perangkat terputus');
    this.isConnected = false;
    this.config.onDisconnect?.();

    // Auto-reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Mencoba reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.reconnect();
      }, 3000);
    }
  }

  /**
   * Attempt to reconnect
   */
  private async reconnect(): Promise<void> {
    try {
      if (this.device && this.device.gatt) {
        this.server = await this.device.gatt.connect();
        await this.subscribeToServices();
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Reconnected successfully');
      }
    } catch (error) {
      console.error('Reconnect failed:', error);
      this.onDisconnected();
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    try {
      if (this.device && this.device.gatt && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
        console.log(' Disconnected from device');
      }
      
      this.device = null;
      this.server = null;
      this.heartRateCharacteristic = null;
      this.isConnected = false;
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected && this.device?.gatt?.connected === true;
  }

  /**
   * Get device info
   */
  getDeviceInfo(): { name: string; id: string } | null {
    if (!this.device) return null;
    
    return {
      name: this.device.name || 'Unknown',
      id: this.device.id
    };
  }
}
