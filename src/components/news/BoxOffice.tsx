interface BoxOfficeMovie {
  title: string;
  earnings: number;
}

interface BoxOfficeProps {
  movies: BoxOfficeMovie[];
}

const BoxOffice = ({ movies }: BoxOfficeProps) => {
  if (!movies || movies.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Box Office Numbers</h3>
      <div className="space-y-2 text-left">
        {movies.map((movie, index) => (
          <p key={index} className="leading-relaxed flex justify-between items-center">
            <span className="font-medium">{movie.title}</span>
            <span className="text-muted-foreground">
              ${movie.earnings.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default BoxOffice;