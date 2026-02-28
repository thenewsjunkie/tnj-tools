const RESTREAM_CHAT_URL = "https://chat.restream.io/embed?token=2e6e4e85-bd6b-411a-89c1-a8bebf957699";

const RestreamChatEmbed = () => {
  return (
    <div className="w-full h-full min-h-[400px] bg-black">
      <iframe
        src={RESTREAM_CHAT_URL}
        className="w-full h-full"
        style={{ border: 0 }}
        allow="clipboard-write"
      />
    </div>
  );
};

export default RestreamChatEmbed;
