'use client';

import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Link,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
} from "@mui/material";

const onboardingSteps = [
  {
    id: 1,
    question:
      "Has your business idea been entered into Startosphere, and received your AI-generated Lean Business Model Canvas (BMC)?",
  },
  {
    id: 2,
    question: "Which business idea do you want to get advised on?",
  },
  {
    id: 3,
    question:
      "Have you decided on a business structure (e.g., sole proprietorship, LLC, corporation)?",
  },
  {
    id: 4,
    question:
      "Do you plan to fund the business with personal savings or small loans?",
  },
  {
    id: 5,
    question: "Are you seeking venture capital or angel investment?",
  },
  {
    id: 6,
    question: "Have you started selling products or services?",
  },
  {
    id: 7,
    question: "Are you currently developing a product, prototype, or service?",
  },
  {
    id: 8,
    question:
      "Does your business rely on unique technology, design, or intellectual property?",
  },
  {
    id: 9,
    question: "Have you taken steps to protect your intellectual property?",
  },
  {
    id: 10,
    question: "Are you working with co-founders or hiring employees?",
  },
  {
    id: 11,
    question:
      "Are you planning to operate locally or expand beyond your region?",
  },
  {
    id: 12,
    question:
      "Do you anticipate needing help with contracts, compliance, or legal disputes?",
  },
  {
    id: 13,
    question:
      "Would you like guidance on scaling your business or preparing for funding rounds?",
  },
];

interface StepFormProps {
  onComplete: (
    answers: Record<number, string>,
    notes: Record<number, string>
  ) => void;
}

const StepForm: React.FC<StepFormProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [manualMode, setManualMode] = useState<Record<number, boolean>>({});
  const [showStartoLink, setShowStartoLink] = useState(false);

  const setNote = (stepId: number, newNote: string) => {
    setNotes((prev) => ({
      ...prev,
      [stepId]: newNote,
    }));
  };

  const removeNote = (stepId: number) => {
    setNotes((prev) => {
      const updated = { ...prev };
      delete updated[stepId];
      return updated;
    });
  };

  const advanceStepLogic = (currentStepId: number, answer: string) => {
    const answerLower = answer.toLowerCase();

    setAnswers((prev) => ({ ...prev, [currentStepId]: answer }));

    if (currentStepId === 1) {
      if (answerLower === "no") {
        setShowStartoLink(true);
        setNote(1, "User needs to complete Lean BMC on Startosphere.");
        return; // Stop here, user must click "Proceed"
      } else {
        removeNote(1);
      }
    }

    // 3) Notes logic
    switch (currentStepId) {
      case 2:
        setNote(2, `Selected business idea: ${answer}`);
        break;
      case 3:
        if (answerLower === "no") {
          setNote(
            3,
            "Business structures and their legal implications."
          );
        } else {
          removeNote(3);
        }
        break;
      case 4:
        if (answerLower === "yes") {
          setNote(
            4,
            "Small business funded with personal savings/loans."
          );
        } else {
          removeNote(4);
        }
        break;
      case 5:
        if (answerLower === "yes") {
          setNote(5, "Venture-backed startup.");
        } else {
          setNote(
            5,
            "Grants, partnerships, or bootstrapping."
          );
        }
        break;
      case 6:
        if (answerLower === "yes") {
          setNote(6, "Already in business and generating revenue or sales.");
        } else {
          removeNote(6);
        }
        break;
      case 7:
        if (answerLower === "no") {
          setNote(7, "Ideation and validation.");
        } else {
          removeNote(7);
        }
        break;
      case 8:
        if (answerLower === "yes") {
          setNote(8, "Trademarks, patents, or copyrights.");
        } else {
          setNote(8, "Suggest general business registration steps.");
        }
        break;
      case 9:
        if (answerLower === "no") {
          setNote(9, "Recommend immediate actions to secure IP.");
        } else {
          removeNote(9);
        }
        break;
      case 10:
        if (answer === "Co-founder") {
          setNote(10, "Co-founder agreements.");
        } else if (answer === "Hiring") {
          setNote(10, "Employment contracts.");
        } else {
          removeNote(10);
        }
        break;
      case 11:
        if (answer === "Locally") {
          setNote(11, "Localized legal compliance and permits.");
        } else if (answer === "Expand") {
          setNote(
            11,
            "Legal assistance for interstate or international operations."
          );
        } else {
          removeNote(11);
        }
        break;
      case 12:
        if (answerLower === "yes") {
          setNote(12, "Direct to appropriate legal resources or assistance tools.");
        } else {
          setNote(12, "Conclude with general legal best practices.");
        }
        break;
      case 13:
        if (answerLower === "yes") {
          setNote(13, "Venture startup-focused legal advice.");
        } else {
          setNote(13, "Maintaining small business operations.");
        }
        break;
      default:
        break;
    }

    // 4) Skip logic
    if (currentStepId === 4 && answerLower === "yes") {
      // Skip Q5
      setAnswers((prev) => ({ ...prev, 5: "No" }));
      // setNote(5, "Skipped seeking venture capital or angel investment.");
      setActiveStep((prev) => Math.min(prev + 2, onboardingSteps.length - 1));
      return;
    }

    if (currentStepId === 6 && answerLower === "yes") {
      // Skip Q7
      setAnswers((prev) => ({ ...prev, 7: "Skipped" }));
      // setNote(7, "Skipped: Currently developing a product, prototype, or service.");
      setActiveStep((prev) => Math.min(prev + 2, onboardingSteps.length - 1));
      return;
    }

    // 5) Move to next step (normal)
    setActiveStep((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
  };

  const onAnswerChange = (stepId: number, selectedValue: string) => {
    // Save the selection in case user changes it multiple times
    setAnswers((prev) => ({
      ...prev,
      [stepId]: selectedValue,
    }));

    // Auto-advance if not in manual mode
    if (!manualMode[stepId]) {
      advanceStepLogic(stepId, selectedValue);
    }
  };

  /**
   * handleContinue is shown when the user is in manual mode on a step.
   * Clicking it applies our standard "advanceStepLogic" with the current answer.
   */
  const handleContinue = (currentStepId: number) => {
    const currentAnswer = answers[currentStepId];
    advanceStepLogic(currentStepId, currentAnswer || "");
    // Turn off manual mode for that step (for future visits)
    setManualMode((prev) => ({ ...prev, [currentStepId]: false }));
  };

  /**
   * Called when user clicks the "Proceed" button on the Startosphere link scenario
   */
  // const handleProceedAfterBMC = () => {
  //   setShowStartoLink(false);
  //   setAnswers((prev) => ({ ...prev, 2: "Skipped" }));
  //   setNote(2, "Skipped: User did not complete Lean BMC on Startosphere.");
  //   setActiveStep((prev) => Math.min(prev + 2, onboardingSteps.length - 1));
  // };

  const handleBack = () => {
    if (activeStep === 0) return;

    if (showStartoLink) {
      setShowStartoLink(false);
      return;
    }

    let nextStep = activeStep - 1;

    const prevStepId = onboardingSteps[nextStep].id;

    if (prevStepId === 5 && answers[5]?.toLowerCase() === "yes") {
      nextStep = nextStep - 1;
    }

    if (prevStepId === 7 && answers[7]?.toLowerCase() === "yes") {
      nextStep = nextStep - 1;
    }

    nextStep = Math.max(nextStep, 0);

    const stepIdGoingTo = onboardingSteps[nextStep].id;
    setManualMode((prev) => ({ ...prev, [stepIdGoingTo]: true }));

    setActiveStep(nextStep);
  };

  const getOptionsForCurrentQuestion = (question: string): string[] | null => {
    if (question === "Which business idea do you want to get advised on?") {
      return ["Idea A", "Idea B", "Idea C"];
    }
    if (
      question ===
      "Are you planning to operate locally or expand beyond your region?"
    ) {
      return ["Locally", "Expand"];
    }
    if (
      question ===
      "Would you like guidance on scaling your business or preparing for funding rounds?"
    ) {
      return ["Scaling", "Funding"];
    }
    if (
      question === "Are you working with co-founders or hiring employees?"
    ) {
      return ["Co-founder", "Hiring"];
    }
    // Default yes/no
    return null;
  };

  if (activeStep >= onboardingSteps.length) {
    return (
      <Box className="step-form-container">
        <Paper elevation={4} className="step-form-box" sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Onboarding Complete!
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Thank you for providing the information.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const currentStepObject = onboardingSteps[activeStep];
  const currentStepId = currentStepObject.id;
  const currentQuestion = currentStepObject.question;
  const currentOptions = getOptionsForCurrentQuestion(currentQuestion);
  const currentAnswer = answers[currentStepId] || "";

  const isLastStep = activeStep === onboardingSteps.length - 1;

  const progress = ((activeStep + 1) / onboardingSteps.length) * 100;

  return (
    <Box className="step-form-container">
      <Paper elevation={4} className="step-form-box" sx={{ p: 3 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Welcome to Lobo
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          We'll ask some questions to understand your business specifics.
        </Typography>

        {/* Linear progress bar */}
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        <Box className="step-form-content" mt={3}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
            flexDirection="column"
          >
            <Typography variant="h6" gutterBottom sx={{ flex: 1, mr: 2 }}>
              {currentQuestion}
            </Typography>

            {/* If user said "No" to Q1 => show Startosphere link below,
                so hide the RadioGroup */}
            {!showStartoLink && (
              <RadioGroup
                row
                name={`question-${activeStep}`}
                value={currentAnswer}
                onChange={(e) =>
                  onAnswerChange(currentStepId, e.target.value)
                }
              >
                {currentOptions ? (
                  currentOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio color="primary" />}
                      label={option}
                    />
                  ))
                ) : (
                  <>
                    <FormControlLabel
                      value="Yes"
                      control={<Radio color="primary" />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="No"
                      control={<Radio color="primary" />}
                      label="No"
                    />
                  </>
                )}
              </RadioGroup>
            )}
          </Box>

          {/* Show Startosphere link if user said "No" on Q1 */}
          {showStartoLink && (
            <Box textAlign="center" mt={3}>
              <Typography variant="body1" gutterBottom>
                Please complete your Lean BMC on Startosphere before proceeding:
              </Typography>
              <Link
                href="https://www.startosphere.io/idea-board"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                style={{
                  fontSize: "1.1rem",
                  display: "inline-block",
                  marginBottom: "1rem",
                }}
              >
                Go to Startosphere
              </Link>
              <Box>
                {/* <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProceedAfterBMC}
                >
                  Proceed
                </Button> */}
              </Box>
            </Box>
          )}

          {/* ACTION BUTTONS: always show Back on the left */}
          {!showStartoLink && (
            <Box
              className="step-form-actions"
              mt={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Back
              </Button>

              {/* If we are in manual mode for this step, show "Continue" button.
                  Otherwise, if it's the last step, show "Submit". Otherwise, show nothing. */}
              <Box>
                {manualMode[currentStepId] && !isLastStep && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!currentAnswer}
                    onClick={() => handleContinue(currentStepId)}
                  >
                    Continue
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!currentAnswer}
                    onClick={() => onComplete(answers, notes)}
                  >
                    Submit
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Show collected notes so far */}
          {/* {Object.keys(notes).length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Notes collected so far:
              </Typography>
              <ul>
                {Object.entries(notes).map(([stepId, note]) => (
                  <li key={stepId}>
                    <strong>Step {stepId}:</strong> {note}
                  </li>
                ))}
              </ul>
            </Box>
          )} */}
        </Box>
      </Paper>
    </Box>
  );
};

export default StepForm;
