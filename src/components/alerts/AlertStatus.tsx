interface AlertStatusProps {
  isPaused: boolean;
  totalAlertsSent: number;
}

const AlertStatus = ({ isPaused, totalAlertsSent }: AlertStatusProps) => {
  return (
    <>
      <div className="absolute bottom-3 left-4 text-xs text-muted-foreground">
        Queue Status: {isPaused ? 'Paused' : 'Playing'}
      </div>
      <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
        Total Alerts Sent: {totalAlertsSent}
      </div>
    </>
  );
};

export default AlertStatus;