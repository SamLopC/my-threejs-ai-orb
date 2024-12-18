import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

// Define types for the props
interface StepFormProps {
  steps: { questions: string[] }[]; // Steps contain an array of questions
  onComplete: () => void; // Callback when the form is completed
}

const StepForm: React.FC<StepFormProps> = ({ steps, onComplete }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [currentStepAnswers, setCurrentStepAnswers] = useState<string[]>([]);

  const handleNext = () => {
    setAnswers((prevAnswers) => ({ ...prevAnswers, [activeStep]: currentStepAnswers }));
    setCurrentStepAnswers([]);

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedAnswers = [...currentStepAnswers];
    updatedAnswers[index] = value;
    setCurrentStepAnswers(updatedAnswers);
  };

  return (
    <Box className="step-form-container">
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to Lobo, please answer the following questions for the best experience 🚀
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((_, index) => (
          <Step key={index}>
            <StepLabel>Step {index + 1}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box className="step-form-content">
        {steps[activeStep].questions.map((question, index) => (
          <TextField
            key={index}
            label={question}
            fullWidth
            margin="normal"
            value={currentStepAnswers[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        ))}

        <Box className="step-form-actions">
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default StepForm;
