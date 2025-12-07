import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20 min-h-dvh">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
