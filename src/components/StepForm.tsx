'use client';

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Link,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

const onboardingSteps = [
  {
    id: 1,
    question:
      "Has your business idea been entered into Startosphere, and received your AI-generated Lean Business Model Canvas (BMC)?",
  },
  {
    id: 2,
    question: "Which business idea do you want to get advised on?", // NEW STEP
  },
  // Removed Step ID 3: "Do you already have a business idea?"
  {
    id: 4,
    question:
      "Have you decided on a business structure (e.g., sole proprietorship, LLC, corporation)?",
  },
  {
    id: 5,
    question:
      "Do you plan to fund the business with personal savings or small loans?",
  },
  {
    id: 6,
    question: "Are you seeking venture capital or angel investment?",
  },
  {
    id: 7,
    question: "Have you started selling products or services?",
  },
  {
    id: 8,
    question: "Are you currently developing a product, prototype, or service?",
  },
  {
    id: 9,
    question:
      "Does your business rely on unique technology, design, or intellectual property?",
  },
  {
    id: 10,
    question: "Have you taken steps to protect your intellectual property?",
  },
  {
    id: 11,
    question: "Are you working with co-founders or hiring employees?",
  },
  {
    id: 12,
    question:
      "Are you planning to operate locally or expand beyond your region?",
  },
  {
    id: 13,
    question:
      "Do you anticipate needing help with contracts, compliance, or legal disputes?",
  },
  {
    id: 14,
    question:
      "Would you like guidance on scaling your business or preparing for funding rounds?",
  },
];

// Define types for the StepForm props
interface StepFormProps {
  onComplete: () => void; // Callback when the entire form is completed
}

const StepForm: React.FC<StepFormProps> = ({ onComplete }) => {
  // Track which step the user is currently on (0-based index)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Store the user's answer for each step in a simple object: { [stepId]: string }
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  // Store notes as a mapping from stepId to note
  const [notes, setNotes] = useState<{ [key: number]: string }>({});

  // Current answer selected by user in the radio group or selection
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  // If user selects "No" on Q1, show a link to Startosphere instead of advancing
  const [showStartoLink, setShowStartoLink] = useState(false);

  /**
   * Helper: Set or update a note for a specific step
   */
  const setNote = (stepId: number, newNote: string) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [stepId]: newNote,
    }));
  };

  /**
   * Helper: Remove a note for a specific step
   */
  const removeNote = (stepId: number) => {
    setNotes((prevNotes) => {
      const updatedNotes = { ...prevNotes };
      delete updatedNotes[stepId];
      return updatedNotes;
    });
  };

  /**
   * Handle advancing to the next step,
   * with special skipping logic for Q4-> skip Q5,
   * and Q6-> skip Q7,
   * plus new logic for Q1-> skip Q2 if user says "No".
   */
  const handleNext = () => {
    const currentStepObject = onboardingSteps[activeStep];
    const currentStepId = currentStepObject.id;
    const answer = currentAnswer.trim();

    const answerLower = answer.toLowerCase();

    // Save the current answer in the overall answers object
    setAnswers((prev) => ({ ...prev, [currentStepId]: answer }));

    // ---- Special logic for question #1 (BMC Startosphere) ----
    if (currentStepId === 1) {
      if (answerLower === "no") {
        // Show link to Startosphere, then skip Q2 and go to Q3 (which is removed)
        setShowStartoLink(true);
        setNote(1, "User needs to complete Lean BMC on Startosphere.");
        return;
      } else if (answerLower === "yes") {
        // Remove any previous note if user changes answer to "Yes"
        removeNote(1);
      }
    }

    // ---- General notes logic ----
    switch (currentStepId) {
      case 2:
        // "Which business idea do you want to get advised on?"
        setNote(2, `Selected business idea: ${answer}`);
        break;
      // Removed case 3 as the question is deleted
      case 4:
        // "Have you decided on a business structure?"
        if (answerLower === "no") {
          setNote(
            4,
            "Provide an overview of different business structures and their legal implications."
          );
        } else if (answerLower === "yes") {
          removeNote(4);
        }
        break;
      case 5:
        // "Do you plan to fund the business with personal savings or small loans?"
        if (answerLower === "yes") {
          setNote(
            5,
            "Mark this as a small business funded with personal savings/loans."
          );
        } else if (answerLower === "no") {
          removeNote(5);
        }
        break;
      case 6:
        // "Are you seeking venture capital or angel investment?"
        if (answerLower === "yes") {
          setNote(6, "Make note that this is a venture-backed startup.");
        } else if (answerLower === "no") {
          setNote(
            6,
            "Consider other funding options like grants, partnerships, or bootstrapping."
          );
        }
        break;
      case 7:
        // "Have you started selling products or services?"
        if (answerLower === "yes") {
          setNote(7, "Already in business and generating revenue or sales.");
        } else if (answerLower === "no") {
          removeNote(7);
        }
        break;
      case 8:
        // "Are you currently developing a product, prototype, or service?"
        if (answerLower === "no") {
          setNote(8, "Focus on ideation and validation.");
        } else if (answerLower === "yes") {
          removeNote(8);
        }
        break;
      case 9:
        // "Does your business rely on unique technology...?"
        if (answerLower === "yes") {
          setNote(9, "Advise on trademarks, patents, or copyrights.");
        } else if (answerLower === "no") {
          setNote(9, "Suggest general business registration steps.");
        }
        break;
      case 10:
        // "Have you taken steps to protect your intellectual property?"
        if (answerLower === "no") {
          setNote(10, "Recommend immediate actions to secure IP.");
        } else if (answerLower === "yes") {
          removeNote(10);
        }
        break;
      case 11:
        // "Are you working with co-founders or hiring employees?"
        if (answer === "Co-founder") {
          setNote(11, "Advise on co-founder agreements.");
        } else if (answer === "Hiring") {
          setNote(11, "Advise on employment contracts.");
        } else {
          removeNote(11);
        }
        break;
      case 12:
        // "Are you planning to operate locally or expand beyond your region?"
        if (answer === "Locally") {
          setNote(12, "Suggest localized legal compliance and permits.");
        } else if (answer === "Expand") {
          setNote(12, "Recommend legal assistance for interstate or international operations.");
        } else {
          removeNote(12);
        }
        break;
      case 13:
        // "Do you anticipate needing help with contracts, compliance, or legal disputes?"
        if (answerLower === "yes") {
          setNote(13, "Direct to appropriate legal resources or assistance tools.");
        } else if (answerLower === "no") {
          setNote(13, "Conclude with general legal best practices.");
        }
        break;
      case 14:
        // "Would you like guidance on scaling your business or preparing for funding rounds?"
        if (answerLower === "yes") {
          setNote(14, "Provide venture startup-focused legal advice.");
        } else if (answerLower === "no") {
          setNote(14, "Offer resources for maintaining small business operations.");
        }
        break;
      default:
        break;
    }

    // ---- Handle Skip Logic ----

    // Q1 -> If "No", skip Q2 and go to Q3 (which is removed)
    if (currentStepId === 1 && answerLower === "no") {
      // Already handled above by showing Startosphere link
      return;
    }

    // Q5 -> If "Yes", skip Q6 and go to Q7
    if (currentStepId === 5 && answerLower === "yes") {
      // Record question #6 (ID=6) as "No"
      setAnswers((prev) => ({ ...prev, 6: "No" }));
      setNote(6, "Skipped seeking venture capital or angel investment.");
      setCurrentAnswer("");
      setActiveStep((prev) => prev + 2); // jump to Q7 (index +2)
      return;
    }

    // Q7 -> If "Yes", skip Q8 and go to Q9
    if (currentStepId === 7 && answerLower === "yes") {
      // Record question #8 (ID=8) as "Skipped"
      setAnswers((prev) => ({ ...prev, 8: "Skipped" }));
      setNote(8, "Skipped: Currently developing a product, prototype, or service.");
      setCurrentAnswer("");
      setActiveStep((prev) => prev + 2); // jump to Q9 (index +2)
      return;
    }

    // If no special skip logic, proceed normally
    setCurrentAnswer("");
    if (activeStep < onboardingSteps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      // If we're at the last step, call onComplete
      onComplete();
    }
  };

  /**
   * If user answered "No" to Q1, they see the Startosphere link. 
   * Once they click "Proceed," we skip Q2 and go to Q3 (which is removed).
   */
  const handleProceedAfterBMC = () => {
    // Hide the link
    setShowStartoLink(false);

    // Mark Q2 as "Skipped" since user did not complete BMC
    setAnswers((prev) => ({ ...prev, 2: "Skipped" }));
    setNote(2, "Skipped: User did not complete Lean BMC on Startosphere.");

    // Move from Q1 (index 0) directly to Q3 (index 2, which is removed, so to Q4)
    setActiveStep((prev) => prev + 2);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);

      // If we are going back from Q2, remove its note
      const previousStepId = onboardingSteps[activeStep - 1].id;
      if (previousStepId === 1 && answers[1]?.toLowerCase() === "no") {
        setShowStartoLink(false);
        removeNote(2); // Remove skipped Q2 note
      }

      // If we are going back from a skipped step, adjust the active step
      if (
        (activeStep === 5 && answers[5]?.toLowerCase() === "yes") ||
        (activeStep === 7 && answers[7]?.toLowerCase() === "yes")
      ) {
        setActiveStep((prev) => prev - 1);
      }
    }
  };

  /**
   * Determine if the current question has customized options
   * Returns an array of options or null if default "Yes"/"No"
   */
  const getOptionsForCurrentQuestion = (): string[] | null => {
    const currentStepObject = onboardingSteps[activeStep];
    const q = currentStepObject.question;

    // Step #2: "Which business idea do you want to get advised on?"
    if (q === "Which business idea do you want to get advised on?") {
      // Replace these options with actual business ideas as needed
      return ["Idea A", "Idea B", "Idea C"];
    }

    if (q === "Are you planning to operate locally or expand beyond your region?") {
      return ["Locally", "Expand"];
    }

    if (
      currentStepObject.question ===
      "Would you like guidance on scaling your business or preparing for funding rounds?"
    ) {
      return ["Scaling", "Funding"];
    }

    if (q === "Are you working with co-founders or hiring employees?") {
      return ["Co-founder", "Hiring"];
    }

    // Return null to indicate default "Yes"/"No"
    return null;
  };

  // Fetch the options for the current question
  const currentOptions = getOptionsForCurrentQuestion();

  /**
   * Populate currentAnswer when navigating back to a previous step
   */
  useEffect(() => {
    const currentStepId = onboardingSteps[activeStep].id;
    const savedAnswer = answers[currentStepId];
    if (savedAnswer && savedAnswer !== "Skipped") {
      setCurrentAnswer(savedAnswer);
    } else {
      setCurrentAnswer("");
    }
  }, [activeStep, answers]);

  return (
    <Box className="step-form-container">
      <Paper elevation={4} className="step-form-box">
        <Typography variant="h3" align="center" className="header-text">
          Welcome to Lobo
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          We'll ask some questions to understand your business specifics.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel>
          {onboardingSteps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel>{`Step ${index + 1}`}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="step-form-content">
          <Typography variant="h6" gutterBottom>
            {onboardingSteps[activeStep].question}
          </Typography>

          {/* If user answered "No" on question #1 (BMC), show the Startosphere link */}
          {showStartoLink ? (
            <Box textAlign="center" mt={3}>
              <Typography variant="body1" gutterBottom>
                Please complete your Lean BMC on Startosphere before proceeding:
              </Typography>
              <Link
                href="https://www.startosphere.io/"
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProceedAfterBMC}
                >
                  Proceed
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Conditional RadioGroup: Use customized options if found, else default "Yes"/"No" */}
              <RadioGroup
                row
                name={`question-${activeStep}`}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
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

              <Box className="step-form-actions" mt={2}>
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
                  disabled={!currentAnswer} // disable if no choice
                >
                  {activeStep === onboardingSteps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Box>
            </>
          )}

          {/* Display notes so far (for user transparency) */}
          {Object.keys(notes).length > 0 && (
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
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default StepForm;
