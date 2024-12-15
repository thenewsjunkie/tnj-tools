interface AlertMessageProps {
  message: string;
  fontSize?: number;
}

const AlertMessage = ({ message, fontSize = 24 }: AlertMessageProps) => {
  // Find the username by looking for the word that comes before "just subscribed"
  const subscribedIndex = message.indexOf(' just');
  const username = subscribedIndex === -1 ? message : message.slice(0, subscribedIndex);
  const restOfMessage = subscribedIndex === -1 ? '' : message.slice(subscribedIndex);

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 text-white text-center alert-message-font mt-4"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
      }}
    >
      <span className="text-[#4CDBC4]">{username}</span>
      {restOfMessage && <span>{restOfMessage}</span>}
    </div>
  );
};

export default AlertMessage;