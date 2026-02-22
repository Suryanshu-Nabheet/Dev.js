import * as babel from '@babel/core';
import puppeteer from 'puppeteer';
// @ts-ignore
import * as babelPresetTypescript from '@babel/preset-typescript';
// @ts-ignore
import * as babelPresetEnv from '@babel/preset-env';
// @ts-ignore
import * as babelPresetDevjs from '@babel/preset-devjs';

type PerformanceResults = {
  renderTime: number[];
  webVitals: {
    cls: number[];
    lcp: number[];
    inp: number[];
    fid: number[];
    ttfb: number[];
  };
  devjsProfiler: {
    id: number[];
    phase: number[];
    actualDuration: number[];
    baseDuration: number[];
    startTime: number[];
    commitTime: number[];
  };
  error: Error | null;
};

type EvaluationResults = {
  renderTime: number | null;
  webVitals: {
    cls: number | null;
    lcp: number | null;
    inp: number | null;
    fid: number | null;
    ttfb: number | null;
  };
  devjsProfiler: {
    id: number | null;
    phase: number | null;
    actualDuration: number | null;
    baseDuration: number | null;
    startTime: number | null;
    commitTime: number | null;
  };
  error: Error | null;
};

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export async function measurePerformance(
  code: string,
  iterations: number,
): Promise<PerformanceResults> {
  const babelOptions: babel.TransformOptions = {
    filename: 'anonymous.tsx',
    configFile: false,
    babelrc: false,
    presets: [babelPresetTypescript, babelPresetEnv, babelPresetDevjs],
  };

  const parsed = await babel.parseAsync(code, babelOptions);
  if (!parsed) {
    throw new Error('Failed to parse code');
  }

  const transformResult = await babel.transformFromAstAsync(parsed, undefined, {
    ...babelOptions,
    plugins: [
      () => ({
        visitor: {
          ImportDeclaration(
            path: babel.NodePath<babel.types.ImportDeclaration>,
          ) {
            const value = path.node.source.value;
            if (value === 'devjs' || value === 'devjs-dom') {
              path.remove();
            }
          },
        },
      }),
    ],
  });

  const transpiled = transformResult?.code || undefined;
  if (!transpiled) {
    throw new Error('Failed to transpile code');
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({width: 1280, height: 720});
  const html = buildHtml(transpiled);

  let performanceResults: PerformanceResults = {
    renderTime: [],
    webVitals: {
      cls: [],
      lcp: [],
      inp: [],
      fid: [],
      ttfb: [],
    },
    devjsProfiler: {
      id: [],
      phase: [],
      actualDuration: [],
      baseDuration: [],
      startTime: [],
      commitTime: [],
    },
    error: null,
  };

  for (let ii = 0; ii < iterations; ii++) {
    await page.setContent(html, {waitUntil: 'networkidle0'});
    await page.waitForFunction(
      'window.__RESULT__ !== undefined && (window.__RESULT__.renderTime !== null || window.__RESULT__.error !== null)',
    );

    // ui chaos monkey
    const selectors = await page.evaluate(() => {
      window.__INTERACTABLE_SELECTORS__ = [];
      const elements = Array.from(document.querySelectorAll('a')).concat(
        Array.from(document.querySelectorAll('button')),
      );
      for (const el of elements) {
        window.__INTERACTABLE_SELECTORS__.push(el.tagName.toLowerCase());
      }
      return window.__INTERACTABLE_SELECTORS__;
    });

    await Promise.all(
      selectors.map(async (selector: string) => {
        try {
          await page.click(selector);
        } catch (e) {
          console.log(`warning: Could not click ${selector}: ${e.message}`);
        }
      }),
    );
    await delay(500);

    // Visit a new page for 1s to background the current page so that WebVitals can finish being calculated
    const tempPage = await browser.newPage();
    await tempPage.evaluate(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    });
    await tempPage.close();

    const evaluationResult: EvaluationResults = await page.evaluate(() => {
      return (window as any).__RESULT__;
    });

    if (evaluationResult.renderTime !== null) {
      performanceResults.renderTime.push(evaluationResult.renderTime);
    }

    const webVitalMetrics = ['cls', 'lcp', 'inp', 'fid', 'ttfb'] as const;
    for (const metric of webVitalMetrics) {
      if (evaluationResult.webVitals[metric] !== null) {
        performanceResults.webVitals[metric].push(
          evaluationResult.webVitals[metric],
        );
      }
    }

    const profilerMetrics = [
      'id',
      'phase',
      'actualDuration',
      'baseDuration',
      'startTime',
      'commitTime',
    ] as const;
    for (const metric of profilerMetrics) {
      if (evaluationResult.devjsProfiler[metric] !== null) {
        performanceResults.devjsProfiler[metric].push(
          evaluationResult.devjsProfiler[metric],
        );
      }
    }

    performanceResults.error = evaluationResult.error;
  }

  await browser.close();

  return performanceResults;
}

function buildHtml(transpiled: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Devjs Performance Test</title>
  <script crossorigin src="https://unpkg.com/devjs@18/umd/devjs.development.js"></script>
  <script crossorigin src="https://unpkg.com/devjs-dom@18/umd/devjs-dom.development.js"></script>
  <script src="https://unpkg.com/web-vitals@3.0.0/dist/web-vitals.iife.js"></script>
  <style>
    body { margin: 0; }
    #root { padding: 20px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.__RESULT__ = {
      renderTime: null,
      webVitals: {},
      devjsProfiler: {},
      error: null,
    };

    webVitals.onCLS(({value}) => { window.__RESULT__.webVitals.cls = value; });
    webVitals.onLCP(({value}) => { window.__RESULT__.webVitals.lcp = value; });
    webVitals.onINP(({value}) => { window.__RESULT__.webVitals.inp = value; });
    webVitals.onFID(({value}) => { window.__RESULT__.webVitals.fid = value; });
    webVitals.onTTFB(({value}) => { window.__RESULT__.webVitals.ttfb = value; });

    try {
      ${transpiled}

      window.App = App;

      // Render the component to the DOM with profiling
      const AppComponent = window.App || (() => Devjs.createElement('div', null, 'No App component exported'));

      const root = DevjsDOM.createRoot(document.getElementById('root'), {
        onUncaughtError: (error, errorInfo) => {
          window.__RESULT__.error = error;
        }
      });

      const renderStart = performance.now()

      root.render(
        Devjs.createElement(Devjs.Profiler, {
          id: 'App',
          onRender: (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
            window.__RESULT__.devjsProfiler.id = id;
            window.__RESULT__.devjsProfiler.phase = phase;
            window.__RESULT__.devjsProfiler.actualDuration = actualDuration;
            window.__RESULT__.devjsProfiler.baseDuration = baseDuration;
            window.__RESULT__.devjsProfiler.startTime = startTime;
            window.__RESULT__.devjsProfiler.commitTime = commitTime;
          }
        }, Devjs.createElement(AppComponent))
      );

      const renderEnd = performance.now();

      window.__RESULT__.renderTime = renderEnd - renderStart;
    } catch (error) {
      console.error('Error rendering component:', error);
      window.__RESULT__.error = error;
    }
  </script>
  <script>
    window.onerror = function(message, url, lineNumber) {
      const formattedMessage = message + '@' + lineNumber;
      if (window.__RESULT__.error && window.__RESULT__.error.message != null) {
        window.__RESULT__.error = window.__RESULT__.error + '\n\n' + formattedMessage;
      } else {
        window.__RESULT__.error = message + formattedMessage;
      }
    };
  </script>
</body>
</html>
`;

  return html;
}
