import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { 
  CheckCircle, XCircle, ArrowRight, ArrowLeft, BookOpen
} from 'lucide-react';
import api from '../../lib/api';

export default function SSDIEducation() {
  const navigate = useNavigate();
  const { ssdiId } = useParams();
  
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEducationContent();
  }, [ssdiId]);

  const fetchEducationContent = async () => {
    try {
      const response = await api.get(`/ssdi/education/${ssdiId}`);
      if (response.data.success) {
        setModules(response.data.modules);
      }
    } catch (err) {
      setError('Failed to load education content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (moduleId, answer) => {
    setAnswers({ ...answers, [moduleId]: answer });
    setShowResult(true);
  };

  const goToNextModule = () => {
    setShowResult(false);
    if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  };

  const completeEducation = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/ssdi/education/complete', {
        ssdi_application_id: ssdiId,
        quiz_answers: answers
      });
      
      if (response.data.success) {
        navigate(`/ssdi/${ssdiId}/consent`);
      } else {
        setError(response.data.error || 'Please answer all questions correctly');
      }
    } catch (err) {
      setError('Failed to complete education');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const module = modules[currentModule];
  const progress = ((currentModule + 1) / modules.length) * 100;
  const isCorrect = module && answers[module.id] === module.quiz_answer;
  const allAnswered = modules.every(m => answers[m.id] !== undefined);
  const allCorrect = modules.every(m => answers[m.id] === m.quiz_answer);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">SSDI Education</h1>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-sm text-gray-600">
            {currentModule + 1} of {modules.length}
          </span>
        </div>
      </div>

      {module && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{module.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none mb-6">
              <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-lg">
                {module.content.trim()}
              </pre>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Confirm Your Understanding:
              </h4>
              <p className="text-gray-700 mb-4">{module.quiz_question}</p>
              
              {!showResult ? (
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => handleAnswer(module.id, true)}
                    className="flex-1"
                  >
                    Yes / True
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleAnswer(module.id, false)}
                    className="flex-1"
                  >
                    No / False
                  </Button>
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Correct!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">
                          Not quite. The correct answer is: {module.quiz_answer ? 'Yes/True' : 'No/False'}
                        </span>
                      </>
                    )}
                  </div>
                  {!isCorrect && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-700"
                      onClick={() => {
                        setAnswers({ ...answers, [module.id]: undefined });
                        setShowResult(false);
                      }}
                    >
                      Try again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            setShowResult(false);
            setCurrentModule(Math.max(0, currentModule - 1));
          }}
          disabled={currentModule === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {currentModule < modules.length - 1 ? (
          <Button 
            onClick={goToNextModule}
            disabled={!showResult || !isCorrect}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={completeEducation}
            disabled={!allAnswered || !allCorrect || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Completing...
              </>
            ) : (
              <>
                Continue to Consents
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
