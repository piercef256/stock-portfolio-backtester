import React, { useState } from "react";

interface TutorialProps {
  onDone: () => void;
}

function Tutorial({ onDone }: TutorialProps) {
  const [step, setStep] = useState(1);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <p>
            Step 1: Add a stock by selecting one from the &quot;Select a
            stock&quot; dropdown, or by entering your own stock ticker into the
            textbox, then clicking the &quot;Add stock&quot; button.
          </p>
          <button onClick={handleNextStep}>Next</button>
          <button onClick={onDone}>Done</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <p>
            Step 2: When you have added the stocks that you want to analyze,
            click the &quot;Show Graph&quot; button, and dive into the stock
            data!
          </p>
          <button onClick={onDone}>Done</button>
        </div>
      )}
    </div>
  );
}

export default Tutorial;
