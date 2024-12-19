'use client'

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
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
      <Paper elevation={4} className="step-form-box">
        <Typography variant="h3" align="center" className="header-text">
          🚀 Welcome to Lobo! 🚀
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          className="subtitle-text"
          gutterBottom
        >
          Answer the following questions to get started!
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
              className={`text-field ${index === 1 || index === 3 ? "large" : ""}`}
              multiline={index === 1 || index === 3}
              rows={index === 1 || index === 3 ? 4 : 1}
            />
          ))}

          <Box className="step-form-actions">
            {activeStep > 0 && (
              <Button
                variant="outlined"
                onClick={handleBack}
                className="back-button"
              >
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              className="next-button"
              color="primary"
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StepForm;
