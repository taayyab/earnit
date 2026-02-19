import React from 'react';

let axe = null;
let ReactDOM = null;

export async function initializeAccessibilityTesting() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const axeCore = await import('@axe-core/react');
    const reactDom = await import('react-dom');
    
    axe = axeCore.default;
    ReactDOM = reactDom.default;

    if (axe && ReactDOM) {
      axe(React, ReactDOM, 1000, {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'label', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'document-title', enabled: true },
          { id: 'html-has-lang', enabled: true },
          { id: 'landmark-one-main', enabled: true },
          { id: 'page-has-heading-one', enabled: true },
          { id: 'region', enabled: true },
          { id: 'focus-trap', enabled: true },
          { id: 'tabindex', enabled: true },
          { id: 'focus-visible', enabled: true },
          { id: 'bypass', enabled: true },
          { id: 'target-size', enabled: true },
        ],
      });
      console.log('[A11y] Accessibility testing initialized');
    }
  } catch (error) {
    console.warn('[A11y] Could not initialize accessibility testing:', error.message);
  }
}

export async function runAccessibilityAudit(context = document) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const axeCore = await import('axe-core');
    const results = await axeCore.default.run(context, {
      rules: {
        'color-contrast': { enabled: true },
        'button-name': { enabled: true },
        'image-alt': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
        'target-size': { enabled: true },
      }
    });

    const summary = {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    };

    if (results.violations.length > 0) {
      console.group('[A11y] Accessibility Violations Found');
      results.violations.forEach((violation) => {
        console.group(`%c${violation.id} - ${violation.impact}`, getImpactStyle(violation.impact));
        console.log('Description:', violation.description);
        console.log('Help:', violation.help);
        console.log('Help URL:', violation.helpUrl);
        console.log('Affected Elements:', violation.nodes.length);
        violation.nodes.forEach((node, i) => {
          console.log(`  ${i + 1}. ${node.target.join(' > ')}`);
          if (node.failureSummary) {
            console.log(`     Fix: ${node.failureSummary}`);
          }
        });
        console.groupEnd();
      });
      console.groupEnd();
    } else {
      console.log('%c[A11y] No accessibility violations found!', 'color: green; font-weight: bold');
    }

    return results;
  } catch (error) {
    console.warn('[A11y] Error running accessibility audit:', error.message);
    return null;
  }
}

function getImpactStyle(impact) {
  switch (impact) {
    case 'critical':
      return 'color: red; font-weight: bold';
    case 'serious':
      return 'color: orange; font-weight: bold';
    case 'moderate':
      return 'color: #DAA520; font-weight: bold';
    case 'minor':
      return 'color: blue';
    default:
      return 'color: gray';
  }
}

export function AccessibilityReportButton() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const [isRunning, setIsRunning] = React.useState(false);
  const [lastResults, setLastResults] = React.useState(null);

  const handleRunAudit = async () => {
    setIsRunning(true);
    const results = await runAccessibilityAudit();
    setLastResults(results);
    setIsRunning(false);
  };

  return (
    <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2">
      <button
        onClick={handleRunAudit}
        disabled={isRunning}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
        aria-label="Run accessibility audit"
      >
        {isRunning ? (
          <>
            <span className="animate-spin">⚙</span>
            Running...
          </>
        ) : (
          <>
            <span>♿</span>
            A11y Audit
          </>
        )}
      </button>
      {lastResults && (
        <div className="bg-white rounded-lg shadow-lg p-3 text-sm border">
          <div className="font-medium mb-2">Last Audit Results</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className={lastResults.violations.length > 0 ? 'text-red-600' : 'text-green-600'}>
              Violations: {lastResults.violations.length}
            </div>
            <div className="text-green-600">
              Passes: {lastResults.passes.length}
            </div>
            <div className="text-yellow-600">
              Incomplete: {lastResults.incomplete.length}
            </div>
            <div className="text-gray-500">
              N/A: {lastResults.inapplicable.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default { initializeAccessibilityTesting, runAccessibilityAudit, AccessibilityReportButton };
