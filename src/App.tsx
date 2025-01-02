'use client';

import React, { useState } from "react";
import { SceneProvider } from "./context/SceneContext";
import Scene from "./components/Scene";
import "./styles/global.css";
import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import Lottie from "react-lottie";
import unicornAnimation from "./assets/lottie/unicorn.json";
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

/**
 * On-Boarding Steps
 * We'll keep them in an array of objects,
 * each with a single question for clarity.
 */
const onboardingSteps = [
  {
    id: 1,
    question:
      "Has your business idea been entered into Startosphere, and received your AI-generated Lean Business Model Canvas (BMC)?",
  },
  {
    id: 2,
    question: "Do you already have a business idea?",
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

// Define types for the StepForm props
interface StepFormProps {
  onComplete: () => void; // Callback when the entire form is completed
}

const StepForm: React.FC<StepFormProps> = ({ onComplete }) => {
  // Track which step the user is currently on (0-based index)
  const [activeStep, setActiveStep] = useState<number>(0);

  // Store the user's answer for each step in a simple object: { [stepId]: string }
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  // An array of notes about the business specifics; we append to this array as we go
  const [notes, setNotes] = useState<string[]>([]);

  // Current answer selected by user in the radio group
  const [currentAnswer, setCurrentAnswer] = useState<string>("");

  // If user selects "No" on Q1, show a link to Startosphere instead of advancing
  const [showStartoLink, setShowStartoLink] = useState(false);

  /**
   * Helper: Append a new note to the notes array
   */
  const addNote = (newNote: string) => {
    setNotes((prevNotes) => [...prevNotes, newNote]);
  };

  /**
   * Handle advancing to the next step,
   * with special skipping logic for Q4 -> skip Q5,
   * and Q6 -> skip Q7.
   */
  const handleNext = () => {
    const currentStepObject = onboardingSteps[activeStep];
    const currentStepId = currentStepObject.id;
    const answerLower = currentAnswer.trim().toLowerCase();

    // Save the current answer in the overall answers object
    setAnswers((prev) => ({ ...prev, [currentStepId]: currentAnswer }));

    // ---- Special logic for question #1 (BMC Startosphere) ----
    if (currentStepId === 1 && answerLower === "no") {
      setShowStartoLink(true);
      return; // stop here
    }

    // ---- General notes logic ----
    switch (currentStepId) {
      case 2:
        // "Do you already have a business idea?"
        if (answerLower === "no") {
          addNote("Suggest resources for brainstorming or market research.");
        }
        break;
      case 3:
        // "Have you decided on a business structure?"
        if (answerLower === "no") {
          addNote(
            "Provide an overview of different business structures and their legal implications."
          );
        }
        break;
      case 4:
        // "Do you plan to fund the business with personal savings or small loans?"
        if (answerLower === "yes") {
          addNote("Mark this as a small business funded with personal savings/loans.");
        }
        break;
      case 5:
        // "Are you seeking venture capital or angel investment?"
        if (answerLower === "yes") {
          addNote("Make note that this is a venture-backed startup.");
        } else if (answerLower === "no") {
          addNote(
            "Consider other funding options like grants, partnerships, or bootstrapping."
          );
        }
        break;
      case 6:
        // "Have you started selling products or services?"
        if (answerLower === "yes") {
          addNote("Already in business and generating revenue or sales.");
        }
        break;
      case 7:
        // "Are you currently developing a product, prototype, or service?"
        if (answerLower === "no") {
          addNote("Focus on ideation and validation.");
        }
        break;
      case 8:
        // "Does your business rely on unique technology...?"
        if (answerLower === "yes") {
          addNote("Advise on trademarks, patents, or copyrights.");
        } else {
          addNote("Suggest general business registration steps.");
        }
        break;
      case 9:
        // "Have you taken steps to protect your intellectual property?"
        if (answerLower === "no") {
          addNote("Recommend immediate actions to secure IP.");
        }
        break;
      case 10:
        // "Are you working with co-founders or hiring employees?"
        if (answerLower === "yes") {
          addNote("Advise on co-founder agreements or employment contracts.");
        }
        break;
      case 11:
        // "Are you planning to operate locally or expand beyond your region?"
        if (currentAnswer === "Locally") {
          addNote("Suggest localized legal compliance and permits.");
        } else if (currentAnswer === "Expand") {
          addNote("Recommend legal assistance for interstate or international operations.");
        }
        break;
      case 12:
        // "Do you anticipate needing help with contracts, compliance, or legal disputes?"
        if (answerLower === "yes") {
          addNote("Direct to appropriate legal resources or assistance tools.");
        } else {
          addNote("Conclude with general legal best practices.");
        }
        break;
      case 13:
        // "Would you like guidance on scaling your business or preparing for funding rounds?"
        if (answerLower === "yes") {
          addNote("Provide venture startup-focused legal advice.");
        } else {
          addNote("Offer resources for maintaining small business operations.");
        }
        break;
      default:
        break;
    }

    // ---- Handle Skip Logic ----

    // Q4 -> If "Yes", skip Q5 (automatically "No") -> jump to Q6
    if (currentStepId === 4 && answerLower === "yes") {
      // Record question #5 as "No", because we've logically deduced that
      setAnswers((prev) => ({ ...prev, 5: "No" }));
      // Skip question #5's step (index 4) and go to index 5 (Q6)
      setShowStartoLink(false); // just to reset if needed
      setCurrentAnswer("");
      setActiveStep((prev) => prev + 2); // jump 2 steps
      return;
    }

    // Q6 -> If "Yes", skip Q7 -> jump to Q8
    if (currentStepId === 6 && answerLower === "yes") {
      // Mark Q7 as "Skipped" or "N/A"
      setAnswers((prev) => ({ ...prev, 7: "Skipped" }));
      // Jump from index=5 to index=7
      setShowStartoLink(false);
      setCurrentAnswer("");
      setActiveStep((prev) => prev + 2);
      return;
    }

    // ---- If no skipping logic applies, proceed normally ----
    setCurrentAnswer("");
    if (activeStep < onboardingSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // If we're at the last step, call onComplete
      onComplete();
    }
  };

  /**
   * Proceed to next question if user was stuck on Q1 -> "No"
   */
  const handleProceedAfterBMC = () => {
    // Now we can continue to the next step
    setShowStartoLink(false);
    setCurrentAnswer(""); // reset
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      // Also reset the link if user goes back from Q1
      if (activeStep === 1) {
        setShowStartoLink(false);
      }
    }
  };

  /**
   * Determine if the current question has customized options
   * Returns an array of options or null if default "Yes"/"No"
   */
  const getOptionsForCurrentQuestion = (): string[] | null => {
    const currentStepObject = onboardingSteps[activeStep];
    if (
      currentStepObject.question ===
      "Are you planning to operate locally or expand beyond your region?"
    ) {
      return ["Locally", "Expand"];
    }

    if (
      currentStepObject.question ===
      "Would you like guidance on scaling your business or preparing for funding rounds?"
    ) {
      return ["Scaling", "Funding"];
    }

    // Return null to indicate default "Yes"/"No"
    return null;
  };

  // Fetch the options for the current question
  const currentOptions = getOptionsForCurrentQuestion();

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
              <StepLabel>Step {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="step-form-content">
          <Typography variant="h6" gutterBottom>
            {onboardingSteps[activeStep].question}
          </Typography>

          {/* If user answered "No" on question 1, show the Startosphere link and "Proceed" button */}
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
                style={{ fontSize: "1.1rem", display: "inline-block", marginBottom: "1rem" }}
              >
                Go to Startosphere
              </Link>
              <Box>
                <Button variant="contained" color="primary" onClick={handleProceedAfterBMC}>
                  Proceed
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              {/* Conditional RadioGroup: Customized options or default "Yes"/"No" */}
              <RadioGroup
                row
                name={`question-${activeStep}`}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              >
                {currentOptions ? (
                  // Render customized options
                  currentOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio color="primary" />}
                      label={option}
                    />
                  ))
                ) : (
                  // Render default "Yes"/"No" options
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
                  <Button variant="outlined" onClick={handleBack} className="back-button">
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

          {/* Display notes so far (for debugging or user transparency) */}
          {notes.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Notes collected so far:
              </Typography>
              <ul>
                {notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

function App() {
  const [currentView, setCurrentView] = useState<"form" | "loading" | "scene">(
    "form"
  );

  const handleComplete = () => {
    // Once the user finishes the step form, show loading, then show the scene
    setCurrentView("loading");
    setTimeout(() => {
      setCurrentView("scene");
    }, 2000);
  };

  // Lottie animation options
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: unicornAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <SceneProvider>
        {currentView === "scene" && (
          <div className="fade-in">
            <Scene />
          </div>
        )}
        {currentView === "loading" && (
          <div className="loading-screen fade-in-out">
            <Lottie options={defaultOptions} height={200} width={200} />
          </div>
        )}
        {currentView === "form" && (
          <div className="fade-out">
            <StepForm onComplete={handleComplete} />
          </div>
        )}
      </SceneProvider>
    </ThemeProvider>
  );
}

export default App;
