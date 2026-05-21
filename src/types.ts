/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MessageEntry {
  id: string;
  name: string;
  subject: string;
  message: string;
  date: string;
}

export interface ClientInfo {
  ip: string;
  city: string;
  country: string;
  region: string;
  isp: string;
  battery: string;
  connType: string;
  rtt: string;
  downlink: string;
  cores: string | number;
  ramGB: string | number;
  browser: string;
  ua: string;
  screenRes: string;
  darkMode: string;
  languages: string;
  tz: string;
  time: string;
  platform: string;
}

export interface FormValues {
  name: string;
  subject: string;
  message: string;
  captchaAnswer: string;
}

export interface FormErrors {
  name?: string;
  subject?: string;
  message?: string;
  captcha?: string;
}
