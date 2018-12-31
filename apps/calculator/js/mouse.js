/*jshint esversion: 6*/
/*globals $, chrome, document, console, SKUF, setTimeout, console, window, log*/
"use strict";

const numbers = document.querySelectorAll('.numbers > button');
const operators = document.querySelectorAll('.operators > button');

numbers.forEach(numBtn => {
  numBtn.onclick = function() {
    screen.value += this.textContent;
  };
});