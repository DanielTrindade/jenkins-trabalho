function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

function fahrenheitToCelsius(value) {
  return roundToTwoDecimals((value - 32) * (4 / 9));
}

function celsiusToFahrenheit(value) {
  return roundToTwoDecimals((value * 9) / 5 + 32);
}

module.exports = {
  fahrenheitToCelsius,
  celsiusToFahrenheit
};
