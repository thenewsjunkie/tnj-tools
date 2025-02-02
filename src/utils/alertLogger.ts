// Centralized logging utility for alerts
export const alertLogger = {
  queueData: (message: string, data?: any) => {
    console.log(`[useQueueData] ${message}`, data || '');
  },
  
  queueState: (message: string, data?: any) => {
    console.log(`[useQueueState] ${message}`, data || '');
  },
  
  alertDisplay: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AlertDisplay] ${message}`, data || '');
    }
  },
  
  videoAlert: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[VideoAlert] ${message}`, data || '');
    }
  }
};