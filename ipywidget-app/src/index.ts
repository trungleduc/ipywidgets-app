// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { PageConfig, URLExt } from '@jupyterlab/coreutils';
(window as any).__webpack_public_path__ = URLExt.join(
  PageConfig.getBaseUrl(),
  'example/'
);

import '../style/index.css';
import { Main } from './main';

export default function getUrl(): {
  BASEURL: string;
} {
  const urlList = window.location.href.split('?')[0].split('/module/');
  let BASEURL = urlList[0];
  if (!BASEURL.endsWith('/')) {
    BASEURL = BASEURL + '/';
  }
  return { BASEURL };
}

/**
 * The main function
 */
async function main(): Promise<void> {
  const { BASEURL } = getUrl();
  console.log('BASEURL', BASEURL);

  let WSURL;
  if (BASEURL.startsWith('https://')) {
    WSURL = BASEURL.replace('https://', 'wss://');
  } else {
    WSURL = BASEURL.replace('http://', 'ws://');
  }

  const app = new Main(BASEURL, WSURL);
  app.connectKernel().then(() => {
    console.log('connected');
    app.startWidget();
  });
}

window.addEventListener('load', main);
