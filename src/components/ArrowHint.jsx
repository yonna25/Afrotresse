import { useEffect, useState } from "react";

export default function ArrowHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000); // disparaît après 4s
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute -top-8 animate-bounce text-4xl">
      ➤
    </div>
  );
}
