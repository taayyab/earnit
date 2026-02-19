import React, { useState } from 'react';
import { CheckCircle, ChevronRight, Award, AlertTriangle, Lightbulb, FileText, Scale } from 'lucide-react';
import drillAvatarImg from '../assets/robot_drill_avatar.webp';

const DRILL_TEXT = "Listen up, soldier! A VA disability claim is YOUR way of getting the benefits you EARNED through your service. The VA owes you - but they won't hand it over unless you file properly. That's where I come in.";

export default function CourseExample() {
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (answer) => {
    setQuizAnswer(answer);
    setShowResult(true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-olive-900 overflow-hidden">
      <div className="h-full flex flex-col p-2 md:p-3">
        <div className="bg-gradient-to-r from-olive-700 to-olive-600 px-4 py-2 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-olive-800 rounded text-olive-200 text-xs font-medium">Lesson 1 of 8</span>
            <h1 className="text-base md:text-lg font-bold text-white">What is a VA Disability Claim?</h1>
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8].map((num) => (
              <div key={num} className={`w-2 h-2 rounded-full ${num === 1 ? 'bg-white' : 'bg-olive-800'}`} />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-b-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="lg:col-span-2 p-3 md:p-4 flex flex-col overflow-y-auto border-r border-gray-100">
            <div className="flex gap-3 items-start mb-4">
              <div className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 border-[#1B3A5F] bg-slate-100">
                <img src={drillAvatarImg} alt="Drill" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="bg-olive-50 rounded-lg p-3 flex-1 relative">
                <div className="absolute -left-2 top-3 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-6 border-r-olive-50"></div>
                <p className="text-olive-900 text-sm leading-snug font-medium">"{DRILL_TEXT}"</p>
                <span className="text-olive-600 text-xs mt-1 block">— Drill, Your Claims Coach</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Compensation, Not Charity</p>
                  <p className="text-gray-600 text-xs">You earned these benefits through your service to our country.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                <Scale className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Original Claims = FREE</p>
                  <p className="text-gray-600 text-xs">Federal law prohibits fees for filing original claims.</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <FileText className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Evidence is Everything</p>
                  <p className="text-gray-600 text-xs">Strong documentation increases approval chances.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  <h3 className="font-bold text-amber-900 text-sm">Common Mistakes to Avoid</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Waiting too long after service to file</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Not connecting condition to service events</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Submitting incomplete medical records</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>Missing C&P exam appointments</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  <h3 className="font-bold text-teal-900 text-sm">Pro Tips from Drill</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">✓</span>
                    <span>Start gathering records NOW - don't wait</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">✓</span>
                    <span>Get a nexus letter from your doctor</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">✓</span>
                    <span>Document how symptoms affect daily life</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-teal-500 font-bold">✓</span>
                    <span>File for ALL conditions, not just obvious ones</span>
                  </li>
                </ul>
              </div>

              <div className="md:col-span-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-3 text-white">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded text-xs">KEY TERM</span>
                  Service Connection
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Service connection</strong> means proving your condition is related to your military service. 
                  This is the foundation of every VA claim. You need: (1) a current diagnosis, (2) an in-service event or injury, 
                  and (3) a medical nexus linking them together. Without all three, claims are denied.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-amber-50 to-orange-50 p-3 md:p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <h3 className="font-bold text-amber-900 text-sm">Knowledge Check</h3>
            </div>
            
            <p className="text-gray-800 mb-3 text-sm font-medium leading-snug">
              Can someone legally charge you a fee to help file your <strong>ORIGINAL</strong> VA disability claim?
            </p>

            <div className="space-y-2 flex-1">
              <button
                onClick={() => handleAnswer('yes')}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                  showResult && quizAnswer === 'yes'
                    ? 'border-red-400 bg-red-50'
                    : 'border-amber-200 hover:border-amber-400 bg-white hover:bg-amber-50'
                }`}
              >
                A) Yes, if they're a licensed attorney
              </button>
              
              <button
                onClick={() => handleAnswer('no')}
                disabled={showResult}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                  showResult && quizAnswer === 'no'
                    ? 'border-green-400 bg-green-50'
                    : 'border-amber-200 hover:border-amber-400 bg-white hover:bg-amber-50'
                }`}
              >
                B) No, it's prohibited by federal law
              </button>

              {showResult && (
                <div className={`p-3 rounded-lg text-sm ${quizAnswer === 'no' ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                  {quizAnswer === 'no' ? (
                    <div>
                      <p className="text-green-800 font-bold mb-1">Correct!</p>
                      <p className="text-green-700 text-xs">38 CFR 14.636 prohibits charging fees for original claims. Only appeals and supplemental claims can have regulated fees.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-red-800 font-bold mb-1">Not quite.</p>
                      <p className="text-red-700 text-xs">Federal law (38 CFR 14.636) prohibits anyone from charging fees for original VA claims, regardless of credentials.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-amber-200">
              <div className="bg-white rounded-lg p-2 mb-3 border border-amber-200">
                <p className="text-xs text-gray-600 font-medium">Next Up:</p>
                <p className="text-sm text-gray-900 font-semibold">Lesson 2: Types of VA Claims</p>
                <p className="text-xs text-gray-500">Learn about original, supplemental, and appeal claims</p>
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-olive-600 text-white rounded-lg hover:bg-olive-700 text-sm font-semibold transition-colors">
                Continue to Next Lesson
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
