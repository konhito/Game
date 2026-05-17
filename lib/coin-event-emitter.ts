/**
 * Coin Event Emitter
 * Provides a way to emit and listen for coin/point updates across components
 * This enables the navbar to update in real-time when coins are earned or rewards are claimed
 */

type CoinUpdateListener = (data: {
  pineCoins: number;
  weeklyPoints: number;
  totalPoints: number;
}) => void;

class CoinEventEmitter {
  private listeners: Set<CoinUpdateListener> = new Set();

  /**
   * Emit a coin update event
   * Call this after any action that might have updated the user's coins or points
   */
  emitCoinUpdate(data: {
    pineCoins: number;
    weeklyPoints: number;
    totalPoints: number;
  }) {
    // Emit via custom event for cross-tab communication
    const event = new CustomEvent('coinUpdate', { detail: data });
    window.dispatchEvent(event);

    // Also notify local listeners
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Subscribe to coin update events
   * Returns an unsubscribe function
   */
  onCoinUpdate(listener: CoinUpdateListener): () => void {
    this.listeners.add(listener);

    // Also listen for custom events
    const handleCoinUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      listener(customEvent.detail);
    };

    window.addEventListener('coinUpdate', handleCoinUpdate);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
      window.removeEventListener('coinUpdate', handleCoinUpdate);
    };
  }
}

// Export singleton instance
export const coinEventEmitter = new CoinEventEmitter();
