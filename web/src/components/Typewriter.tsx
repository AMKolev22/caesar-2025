import { useEffect, useState } from "react";

export const Typewriter = ({ text, speed, bold }: { text: string, speed: number, bold: boolean }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, speed);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={bold ? "font-bold" : "font-normal"}>
      {displayText}
    </span>
  );
};