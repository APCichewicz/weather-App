export default interface hourlyForecast {
  time: string,
  temp_c: number,
  temp_f: number,
  icon: string,
  conditionText: string,
  wind: number,
  windDir: string,
  precip: number,
  humidity: number,
  feelsLike: number,
  uv: number,
  gust: number
}
