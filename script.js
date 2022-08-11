/* .js files add interaction to your website */
var factList = [
  "Consumption of healthy and sustainable diets presents major opportunities for reducing emissions from food systems and improving health outcomes, including through lower consumption of energy- and land-intensive animal-sourced foods.",/*0*/
  "Climate action is not a budget buster or economy-wrecker. Shifting to a green economy could yield a direct economic gain of $26 trillion through 2030 compared with business-as-usual. This could produce over 65 million new low-carbon jobs.",/*1*/
  "Many people think climate change mainly means warmer temperatures. But temperature rise is only the beginning of the story. Because the Earth is a system, where everything is connected, changes in one area can influence changes in all others. The consequences of climate change now include, among others, intense droughts, water scarcity, severe fires, rising sea levels, flooding, melting polar ice, catastrophic storms and declining biodiversity.",/*2*/
  "Every increase in global warming matters. In a 2018 report, thousands of scientists and government reviewers agreed that limiting global temperature rise to no more than 1.5°C would help us avoid the worst climate impacts and maintain a livable climate. Yet the current path of carbon dioxide emissions could increase global temperature by as much as 4.4°C by the end of the century.", /*3*/
  "2015-2019 were the five warmest years on record while 2010-2019 was the warmest decade on record.",
  "Without adaptive measures, the number of people who lack sufficient water for at least one month per year will soar from 3.6 billion today to more than 5 billion by 2050." /*4*/];


var fact = document.getElementById("fact");
var myButton = document.getElementById("myButton");
var count = 0;

myButton.addEventListener("click", displayFact);

function displayFact(){
  fact.innerHTML = factList[count];
  count++;
  if (count == factList.length){
    count = 0;
  }
}
