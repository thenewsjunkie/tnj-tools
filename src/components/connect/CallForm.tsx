import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CallFormProps {
  name: string;
  setName: (name: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
}

const CallForm = ({ name, setName, topic, setTopic }: CallFormProps) => {
  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Call Topic</Label>
        <Textarea
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What would you like to discuss?"
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default CallForm;