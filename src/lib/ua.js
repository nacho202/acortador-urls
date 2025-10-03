/**
 * Parser de User Agent para extraer información de dispositivo, OS y navegador
 */

const { UAParser } = require('ua-parser-js');

/**
 * Parsear User Agent y extraer información categorizada
 * @param {string} userAgent - User Agent string
 * @returns {object} Información parseada
 */
function parseUA(userAgent) {
  if (!userAgent) {
    return {
      device: 'unknown',
      os: 'unknown',
      browser: 'unknown'
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Categorizar dispositivo
  let device = 'desktop';
  if (result.device.type === 'mobile') {
    device = 'mobile';
  } else if (result.device.type === 'tablet') {
    device = 'tablet';
  }

  // Normalizar OS
  let os = 'unknown';
  if (result.os.name) {
    const osName = result.os.name.toLowerCase();
    if (osName.includes('windows')) {
      os = 'Windows';
    } else if (osName.includes('mac')) {
      os = 'macOS';
    } else if (osName.includes('linux')) {
      os = 'Linux';
    } else if (osName.includes('android')) {
      os = 'Android';
    } else if (osName.includes('ios')) {
      os = 'iOS';
    } else {
      os = result.os.name;
    }
  }

  // Normalizar navegador
  let browser = 'unknown';
  if (result.browser.name) {
    const browserName = result.browser.name.toLowerCase();
    if (browserName.includes('chrome')) {
      browser = 'Chrome';
    } else if (browserName.includes('firefox')) {
      browser = 'Firefox';
    } else if (browserName.includes('safari')) {
      browser = 'Safari';
    } else if (browserName.includes('edge')) {
      browser = 'Edge';
    } else if (browserName.includes('opera')) {
      browser = 'Opera';
    } else {
      browser = result.browser.name;
    }
  }

  return {
    device,
    os,
    browser
  };
}

module.exports = {
  parseUA
};
