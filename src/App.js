import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Form,
  InputGroup,
  Alert,
  Row,
  Col,
} from 'react-bootstrap';
import { Clipboard, Sun, Moon } from 'lucide-react';

const questions = [
  {
    id: 'importance',
    text: 'How important is this BUG for the customer?',
    options: [
      { value: 'A', label: 'Our localization process is blocked until this issue gets fixed.', score: 20 },
      { value: 'B', label: 'This issue delays our workflow significantly/Or requires a lot of manual effort on our side in order to have a localization workflow active.', score: 15 },
      { value: 'C', label: "It's important to fix this, as soon as possible, but they can wait for a while", score: 10 },
      { value: 'D', label: 'Customer/Transifex found this suddenly and wanted to report it', score: 5 },
    ],
  },
  {
    id: 'workaround',
    text: 'Is there any workaround?',
    options: [
      { value: 'A', label: 'No', score: 5 },
      { value: 'B', label: "Yes, but not very efficient. It's hard to maintain.", score: 4 },
      { value: 'C', label: "Yes, it can work for a while - It's not considered a good long-term solution though.", score: 3 },
      { value: 'D', label: 'No, but we can live with this', score: 2 },
      { value: 'E', label: 'Yes, we are good and can use this instead.', score: 1 },
    ],
  },
  {
    id: 'customerType',
    text: 'What kind of customer is affected?',
    options: [
      { value: 'A', label: 'Enterprise', score: 5 },
      { value: 'B', label: 'Growth', score: 4 },
      { value: 'C', label: 'Starter', score: 3 },
      { value: 'D', label: 'Open-source', score: 2 },
      { value: 'E', label: 'Reported Internally by the Transifex team', score: 1 },
    ],
  },
  {
    id: 'churnRisk',
    text: 'Is this a possible churn customer? CSM will give this info.',
    options: [
      { value: 'A', label: 'High churn risk', score: 20 },
      { value: 'B', label: 'Low churn risk', score: 0 },
    ],
  },
  {
    id: 'waitTime',
    text: 'How long can the customer wait for the fix?',
    options: [
      { value: 'A', label: 'They need it Yesterday', score: 5 },
      { value: 'B', label: 'They can wait for a week', score: 4 },
      { value: 'C', label: 'They can wait for 2 weeks', score: 3 },
      { value: 'D', label: 'They can wait for 1-3 months', score: 2 },
      { value: 'E', label: 'They can wait for 4-6 months', score: 1 },
    ],
  },
];

const BugScoreCalculator = () => {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [plan, setPlan] = useState('');
  const [monthlyARR, setMonthlyARR] = useState('');
  const [intercomURL, setIntercomURL] = useState('');
  const [slackURL, setSlackURL] = useState('');
  const [copyText, setCopyText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const copyTextRef = useRef(null);

  useEffect(() => {
    const handleThemeChange = (e) => {
      setDarkMode(e.matches);
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions first.');
      return;
    }

    const q1Score = questions[0].options.find((opt) => opt.value === answers.importance)?.score || 0;
    const q2Score = questions[1].options.find((opt) => opt.value === answers.workaround)?.score || 0;
    const q3Score = questions[2].options.find((opt) => opt.value === answers.customerType)?.score || 0;
    const q4Score = questions[3].options.find((opt) => opt.value === answers.churnRisk)?.score || 0;
    const q5Score = questions[4].options.find((opt) => opt.value === answers.waitTime)?.score || 0;

    const totalScore = (q1Score + q2Score + q3Score + q4Score) * q5Score;
    setScore(totalScore);

    const annualARR = parseFloat(monthlyARR) * 12;
    const formattedAnswers = Object.values(answers).join('');

    const formattedText = `${customerName}, ${plan}, $${annualARR.toFixed(2)}
Intercom URL: ${intercomURL}
Slack URL: ${slackURL}
Answers: ${formattedAnswers}
Score: ${totalScore}`;

    setCopyText(formattedText);
    setCopySuccess(false);
  };

  const getPriority = (score) => {
    if (score <= 19) return { text: 'Trivial', color: 'info' };
    if (score <= 49) return { text: 'Minor', color: 'warning' };
    if (score <= 99) return { text: 'Major', color: 'danger' };
    return { text: 'Critical/Blocker', color: 'danger' };
  };

  const copyToClipboard = () => {
    if (copyTextRef.current) {
      copyTextRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
    }
  };

  const toggleDarkMode = () => {
    const isDarkMode = !darkMode;
    setDarkMode(isDarkMode);

    // Toggle dark class on the body
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  return (
    <Card className={`w-100 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
      <Card.Header className="d-flex justify-content-between align-items-center text-center">
        <h5 className="flex-grow-1">Bug Score Calculator</h5>
        <Button variant="link" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col>
              <Form.Group controlId="customerName">
                <Form.Label className="font-weight-bold text-center w-100">Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="plan">
                <Form.Label className="font-weight-bold text-center w-100">Plan</Form.Label>
                <Form.Control
                  as="select"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className={darkMode ? 'bg-dark text-light' : ''}
                >
                  <option value="">Select a plan</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="growth">Growth</option>
                  <option value="starter">Starter</option>
                  <option value="open-source">Open-source</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="monthlyARR">
                <Form.Label className="font-weight-bold text-center w-100">Monthly ARR ($)</Form.Label>
                <Form.Control
                  type="number"
                  value={monthlyARR}
                  onChange={(e) => setMonthlyARR(e.target.value)}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="intercomURL">
                <Form.Label className="font-weight-bold text-center w-100">Intercom URL</Form.Label>
                <Form.Control
                  type="text"
                  value={intercomURL}
                  onChange={(e) => setIntercomURL(e.target.value)}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="slackURL">
                <Form.Label className="font-weight-bold text-center w-100">Slack URL</Form.Label>
                <Form.Control
                  type="text"
                  value={slackURL}
                  onChange={(e) => setSlackURL(e.target.value)}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Col>
          </Row>

          {questions.map((question, index) => (
            <Form.Group key={question.id} controlId={question.id} className="mb-2 border-bottom">
              <Form.Label className="font-weight-bold text-left">{question.text}</Form.Label>
              {question.options.map((option) => (
                <Form.Check
                  type="radio"
                  key={option.value}
                  label={option.label}
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                />
              ))}
            </Form.Group>
          ))}

          <Button variant="primary" onClick={calculateScore} className="mt-2">
            Calculate Score
          </Button>
        </Form>

        {score === null && (
          <Alert variant="info" className="mt-3">
            Please answer all questions first.
          </Alert>
        )}

        {score !== null && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className={`p-3 ${darkMode ? 'bg-dark text-light' : 'bg-light'}`}>
              <Alert variant={getPriority(score).color}>
                <h6>Priority: {getPriority(score).text}</h6>
                <p>Score: {score}</p>
              </Alert>

              <InputGroup className="mb-3">
                <Form.Control
                  ref={copyTextRef}
                  as="textarea"
                  value={copyText}
                  readOnly
                  rows={5}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
                <Button onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </InputGroup>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BugScoreCalculator;
