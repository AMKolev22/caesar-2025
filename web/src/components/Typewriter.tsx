import { useEffect, useState } from "react";

export const Typewriter = ({ text, speed, bold } : {text : string, speed : number, bold: boolean}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
    let intervalId;

  if (currentIndex < text.length) {
    intervalId = setInterval(() => {
      setDisplayText((prevText) => prevText + text[currentIndex]);
      setCurrentIndex((prevIndex) => prevIndex + 1);

      if (currentIndex === text.length - 1) {
        clearInterval(intervalId);
      }
    }, speed);
  }

  return () => clearInterval(intervalId);
}, [currentIndex, text, speed]);
return (
  <>
    {bold && (
      <span id="anim" className="bold">{displayText}</span>
    )}
    {!bold && (
      <span id="anim" className="font-normal">{displayText}</span>
    )}
  </>
);
};