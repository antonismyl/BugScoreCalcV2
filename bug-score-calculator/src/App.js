import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
      { value: 'D', label: 'Opensource', score: 2 },
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
  const [darkMode, setDarkMode] = useState(false);
  const copyTextRef = useRef(null);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const calculateScore = () => {
    const q1Score = questions[0].options.find(opt => opt.value === answers.importance)?.score || 0;
    const q2Score = questions[1].options.find(opt => opt.value === answers.workaround)?.score || 0;
    const q3Score = questions[2].options.find(opt => opt.value === answers.customerType)?.score || 0;
    const q4Score = questions[3].options.find(opt => opt.value === answers.churnRisk)?.score || 0;
    const q5Score = questions[4].options.find(opt => opt.value === answers.waitTime)?.score || 0;

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
  };

  const getPriority = (score) => {
    if (score <= 19) return { text: 'Trivial', color: 'bg-blue-200 dark:bg-blue-800' };
    if (score <= 49) return { text: 'Minor', color: 'bg-yellow-200 dark:bg-yellow-800' };
    if (score <= 99) return { text: 'Major', color: 'bg-orange-200 dark:bg-orange-800' };
    return { text: 'Critical/Blocker', color: 'bg-red-200 dark:bg-red-800' };
  };

  const copyToClipboard = () => {
    if (copyTextRef.current) {
      copyTextRef.current.select();
      document.execCommand('copy');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Card className={`w-[500px] max-h-[800px] overflow-y-auto ${darkMode ? 'dark' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bug Score Calculator</CardTitle>
        <div className="flex items-center space-x-2">
          <Sun className="h-4 w-4" />
          <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          <Moon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="plan">Plan</Label>
            <Select onValueChange={setPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open-source">Open-source</SelectItem>
                <SelectItem value="Starter">Starter</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Enterprise+">Enterprise+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="monthlyARR">Monthly ARR ($)</Label>
            <Input id="monthlyARR" type="number" value={monthlyARR} onChange={(e) => setMonthlyARR(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="intercomURL">Intercom URL</Label>
            <Input id="intercomURL" value={intercomURL} onChange={(e) => setIntercomURL(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="slackURL">Slack URL</Label>
            <Input id="slackURL" value={slackURL} onChange={(e) => setSlackURL(e.target.value)} />
          </div>
        </div>
        {questions.map((question) => (
          <div key={question.id} className="mb-6">
            <Label className="text-base font-semibold">{question.text}</Label>
            <RadioGroup
              onValueChange={(value) => handleAnswer(question.id, value)}
              className="mt-2 space-y-1"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="text-sm">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
        <Button onClick={calculateScore} className="w-full mt-4">Calculate Score</Button>
        {score !== null && (
          <div className="mt-4">
            <div className={`p-2 rounded-md text-center mb-4 ${getPriority(score).color}`}>
              <p className="text-lg font-semibold">Priority: {getPriority(score).text}</p>
              <p className="text-md font-medium">Score: {score}</p>
            </div>
            <div className="relative">
              <textarea
                ref={copyTextRef}
                readOnly
                value={copyText}
                className="w-full h-36 p-2 text-sm border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2"
                size="sm"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BugScoreCalculator;