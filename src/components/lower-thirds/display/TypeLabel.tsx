interface TypeLabelProps {
  type: string;
  isVisible: boolean;
}

const TypeLabel = ({ type, isVisible }: TypeLabelProps) => {
  return (
    <div className="absolute -top-16 left-0 z-10">
      <div className={`bg-black/85 text-white px-8 py-4 text-xl font-bold uppercase ${isVisible ? 'animate-fade-in' : ''}`}>
        {type}
      </div>
    </div>
  );
};

export default TypeLabel;