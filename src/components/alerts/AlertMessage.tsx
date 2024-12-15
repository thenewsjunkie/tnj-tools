interface AlertMessageProps {
  message: string;
  fontSize?: number;
}

const AlertMessage = ({ message, fontSize = 24 }: AlertMessageProps) => {
  // Find the last occurrence of a username mention (handles multi-word usernames)
  const lastSpaceIndex = message.lastIndexOf(' ');
  const username = lastSpaceIndex === -1 ? message : message.slice(0, lastSpaceIndex);
  const restOfMessage = lastSpaceIndex === -1 ? '' : message.slice(lastSpaceIndex);

  return (
    <div 
      className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center alert-message-font"
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