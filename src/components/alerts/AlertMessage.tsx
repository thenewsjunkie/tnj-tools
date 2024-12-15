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
      className="text-white text-center alert-message-font mt-4 max-w-[800px] mx-auto px-4 break-words"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
      }}
    >
      <span className="text-[#4CDBC4]">{username}</span>
      {restOfMessage && <span className="break-words">{restOfMessage}</span>}
    </div>
  );
};

export default AlertMessage;