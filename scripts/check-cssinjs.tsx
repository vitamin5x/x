import {
  NaNLinter,
  StyleProvider,
  legacyNotSelectorLinter,
  logicalPropertiesLinter,
  parentSelectorLinter,
} from '@ant-design/cssinjs';
import chalk from 'chalk';
/* eslint-disable no-console */
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { XProvider } from '../components';
import { generateCssinjs } from './generate-cssinjs';

console.log(chalk.green(`🔥 Checking CSS-in-JS...`));

let errorCount = 0;
const originError = console.error;
console.error = (msg: any) => {
  if (msg.includes('Warning: [Ant Design CSS-in-JS]')) {
    errorCount += 1;
    console.log(chalk.red(`❌ `), msg.slice(msg.indexOf('Error in')).replace(/\s+/g, ' '));
  } else {
    originError(msg);
  }
};

async function checkCSSVar() {
  await generateCssinjs({
    key: 'check',
    render(Component: any) {
      ReactDOMServer.renderToString(
        <StyleProvider linters={[NaNLinter]}>
          <XProvider theme={{ cssVar: true, hashed: false }}>
            <Component />
          </XProvider>
        </StyleProvider>,
      );
    },
  });
}

(async () => {
  await generateCssinjs({
    key: 'check',
    render(Component: any) {
      ReactDOMServer.renderToString(
        <StyleProvider
          linters={[logicalPropertiesLinter, legacyNotSelectorLinter, parentSelectorLinter]}
        >
          <Component />
        </StyleProvider>,
      );
    },
  });

  await checkCSSVar();

  if (errorCount > 0) {
    console.log(chalk.red(`❌  CSS-in-JS check failed with ${errorCount} errors.`));
    process.exit(1);
  } else {
    console.log(chalk.green(`✅  CSS-in-JS check passed.`));
  }
})();
