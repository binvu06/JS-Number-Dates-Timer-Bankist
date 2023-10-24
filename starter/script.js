'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-09-27T16:33:06.386Z',
    '2023-08-10T14:43:26.374Z',
    '2023-09-20T18:49:59.371Z',
    '2023-09-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };
  // Set time to 5 minutes
  let time = 30;

  // Call the timer every second
  tick();
  const timers = setInterval(tick, 1000);
  return timers;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    // Experimenting API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // 2-digit, numeric
      year: 'numeric',
      // weekday: 'long', // short, narrow
    };

    // const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer); //1: false
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(0.1 + 0.2 === 0.3);
// console.log(0.1 + 0.2);

// console.log(+'23');
// console.log(+'23');

// console.log(Number.parseInt('0px', 2));
// console.log(Number.parseInt('100px', 10));

/*
console.log(parseFloat('2.3rem'));
console.log(parseInt('23px'));

console.log(isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20px'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23.1));

console.log(Number.parseFloat('    23.1px     ')); // 23.1

console.log(Number.parseFloat('    px23     ')); // NaN
*/

/*
console.log(Math.sqrt(25));
console.log(4 ** 0.5);

// Max
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

// Min
console.log(Math.min(5, 18, 23, 11, 2));
console.log(Math.min(5, 18, '23', 11, 2));
console.log(Math.min(5, 18, '23px', 11, 2));

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
console.log(randomInt(10, 20));

console.log(Math.round(3.4)); // 3
console.log(Math.round(3.5)); // 4

console.log(Math.ceil(3.1)); // 4
*/
// console.log(25 ** (1 / 2));

// console.log(Math.PI * Number.parseFloat('2px') ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

/*
const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
 console.log(randomInt(10, 20));

console.log('----Round---');

console.log(Math.round('23.3')); // 23
console.log(Math.round(23.9)); // 24
console.log(Math.round(23.5)); // 24

console.log('----Ceil---');

console.log(Math.ceil('23.3')); // 24
console.log(Math.ceil(23.9)); // 24
console.log(Math.ceil(23.5)); // 24

console.log('----Floor---');

console.log(Math.floor('23.3')); // 23
console.log(Math.floor(23.9)); // 23
console.log(Math.floor(23.5)); // 23
*/

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));

// console.log(Math.trunc(23.3));
// console.log(Math.floor(23.3));

// const randomInt = (min, max) =>
//   Math.trunc(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(10, 20));
// const randomInt = (min, max) => {
//   const random = Math.random();
//   console.log(random);
//   return Math.floor(random * (max - min + 1)) + min;
// };
// console.log(randomInt(10, 20));
/*
console.log((2.4).toFixed(1));
console.log((2.346).toFixed(2)); // 2.35
console.log((2.45).toFixed(1));
console.log(+(2.5).toFixed(3));

console.log(5 % 2); // 5 = 2 * 2 + 1
console.log(8 % 3); // 8 = 2 * 3 + 2

const arr = [1, 2, 3, 4, 5, 6, 8, 10, 100];

for (const item of arr) {
  if (item % 2 === 0) console.log(`${item} day la so chan`);
  else if (item % 2 === 1) console.log(`${item} day la so le`);
}

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});

const diameter = 287_460_000_000;
console.log(diameter);

const price1 = 15_00;
const price2 = 1_500;
*/

/*
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

console.log(2 ** 53 + 5);
console.log(12312326287136876126381236871263n);
console.log(12312326287136876126381236871263n);
console.log(BigInt(12312326287136876126381236871263));

console.log(10000n + 10000n);

const huge = 212312312313123123n;
const num = 23;
console.log(huge * BigInt(num));

console.log(20n > 15); // true
console.log(20n === 20); // false

console.log(huge + '  is Really Big ');

// console.log(Math.sqrt(10n));

console.log(10n / 3n);
console.log();
*/
// const now1 = new Date('1991-08-08');
// const now2 = new Date();
// console.log(now1);
// console.log(now2);

// console.log(new Date(account1.movementsDates[0]));

// console.log(new Date(2037, 10, 19, 15, 23, 5));

// console.log(new Date(2037, 10, 31));
// console.log(new Date(2037, 10, 33));

// console.log(new Date(0));

// console.log(new Date(3 * 24 * 60 * 60 * 1000));
/*
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getMilliseconds());

console.log(future.toISOString());
console.log(new Date(0));
console.log(future.getTime());
console.log(new Date(2142231785000));

future.setFullYear(2040);
console.log(future);
*/
// const future = new Date();
// console.log(future);
// console.log(future.toISOString());
// console.log(new Date('2023-09-27T04:52:58.469Z'));

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
// const days = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
// console.log(days);

// const num = 1231231;

// const options = {
//   style: 'currency',
//   currency: 'USD',
// };

// const city1 = new Intl.NumberFormat('en-US', options).format(num);
// console.log(city1);

// const ingredients = ['olives', 'spinach'];
// const pizza = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1}, ${ing2}`),
//   3000,
//   ...ingredients
// );
// console.log('Waiting...');

// if (ingredients.includes('spinach')) clearTimeout(pizza);

// setInterval(function () {
//   const now = new Date();
//   const hour = now.getHours();
//   const min = `${now.getMinutes()}`.padStart(2, 0);
//   const sec = now.getSeconds();
//   console.log(`${hour}:${min}:${sec}`);
// }, 1000);

// setTimeout(() => console.log('Here is your pizza'), 1000);

// const ingredients = ['cheese', 'tomato'];
// const pizza = function (ing1, ing2) {
//   console.log(`Pizza include ${ing1} and ${ing2}`);
// };
// pizza(...ingredients);

// console.log((2.4).toFixed(0));

// console.log(120 % 60);

/*
const first = function () {
  const second = function () {
    console.log('hello');
  };

  // call function
  second();

  const timer = setTimeout(second, 3000);
  console.log(timer);
};
first();

const timestamp = Date.now();
console.log(timestamp.getTime());

console.log(timestamp);
console.log(new Date(timestamp));

new Date(2017, 3, 22, 5, 23, 50);

// Year: 2017
// Month: April (vì month là zero-indexed)
// Date: 22
// Hours: 5
// Minutes: 23
// Seconds: 50
*/
// const first = function (date1, date2) {
//   return (date2 - date1) / (1000 * 60 * 60 * 24);
// };
// console.log(first(new Date(2023, 4, 17), new Date(2023, 4, 27)));

// console.log('hello');

// console.log('hello');

let time;
time = function () {
  const timer = setInterval(function () {
    console.log('hello');
  }, 2000);
  return timer;
};
console.log(time());
