const RESTREAM_CHAT_URL = "https://chat.restream.io/embed?token=2e6e4e85-bd6b-411a-89c1-a8bebf957699";

interface RestreamChatEmbedProps {
  zoom?: number; // percentage, default 100
}

const RestreamChatEmbed = ({ zoom = 100 }: RestreamChatEmbedProps) => {
  const scale = zoom / 100;
  return (
    <div className="w-full h-full min-h-[400px] bg-black overflow-hidden">
      <iframe
        src={RESTREAM_CHAT_URL}
        className="w-full h-full"
        style={{
          border: 0,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }}
        allow="clipboard-write"
      />
    </div>
  );
};

export default RestreamChatEmbed;
