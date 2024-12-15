interface AlertMessageProps {
  message: string;
  fontSize?: number;
}

const AlertMessage = ({ message, fontSize = 24 }: AlertMessageProps) => {
  return (
    <div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      }}
    >
      {message}
    </div>
  );
};

export default AlertMessage;