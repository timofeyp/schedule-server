const Webdriver = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');
const { path } = require('chromedriver');
const {
  portalUrl, eventsUrl, portalLogin, portalPass,
} = require('src/managers/events/constants');
const { Options } = chromeDriver;
const { By, until } = Webdriver;
const log = require('src/utils/log')(module);
const { jar } = require('src/managers/events/requestData');

const options = new Options();
options.addArguments('start-maximized'); // open Browser in maximized mode
options.addArguments('disable-infobars'); // disabling infobars
options.addArguments('--disable-extensions'); // disabling extensions
options.addArguments('--disable-gpu'); // applicable to windows os only
options.addArguments('--disable-dev-shm-usage'); // overcome limited resource problems
options.addArguments('--no-sandbox'); // Bypass OS security model
options.addArguments('--headless'); // No window

const service = new chromeDriver.ServiceBuilder(path).build();
chromeDriver.setDefaultService(service);

const setCookies = async () => {
  const driver = await new Webdriver.Builder()
    .withCapabilities(Webdriver.Capabilities.chrome())
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  await driver.get(portalUrl);
  const loginElem = await driver.wait(until.elementLocated(By.css('*[id="logonuidfield"]')));
  loginElem.sendKeys(portalLogin);
  const passElem = await driver.wait(until.elementLocated(By.css('*[id="logonpassfield"]')));
  passElem.sendKeys(portalPass);
  const buttonElem = await driver.wait(until.elementLocated(By.css('*[name="uidPasswordLogon"]')));
  buttonElem.click();
  await driver.wait(until.elementLocated(By.css('*[id="contentAreaFrame"]')));
  const cookies = await driver.manage().getCookies();
  await driver.quit();
  cookies.forEach((el) => {
    jar.setCookie(`${el.name}=${el.value}`, eventsUrl);
  });
  log.info('cookies set');
};

module.exports = setCookies;
