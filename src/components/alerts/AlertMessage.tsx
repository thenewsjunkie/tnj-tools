interface AlertMessageProps {
  message: string;
  fontSize?: number;
}

const AlertMessage = ({ message, fontSize = 24 }: AlertMessageProps) => {
  // Split the message into username and rest of the message if it contains a space
  const parts = message.split(' ');
  const username = parts[0];
  const restOfMessage = parts.slice(1).join(' ');

  return (
    <div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center alert-message-font"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      }}
    >
      <span className="text-[#4CDBC4]">{username}</span>
      {restOfMessage && <span> {restOfMessage}</span>}
    </div>
  );
};

export default AlertMessage;