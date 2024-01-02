const generateAndBroadcastNumber = (io) => {
  let targetNumber = 0;
  let currentNumber = 0;
  let timeRemaining = 10; // Initial countdown time in seconds
  let intervalId = null;

  // Function to generate and broadcast the number
  const generateAndBroadcast = () => {
    targetNumber = Math.floor(Math.random() * 100);
    currentNumber = 0;
    timeRemaining = targetNumber + 30; // Use the generated number for countdown time

    const timestamp = new Date().toISOString();
    const data = { number: currentNumber, target: targetNumber, timestamp, time: timeRemaining * 1000 };

    io.emit('newNumber', data);

    clearInterval(intervalId);
    intervalId = setInterval(() => {
      timeRemaining--;

      currentNumber = Math.min(targetNumber, currentNumber + 1);

      io.emit('updateData', { number: currentNumber, target: targetNumber, time: timeRemaining });

      if (timeRemaining <= 0) {
        clearInterval(intervalId);
        generateAndBroadcast(); // Start a new round
      }
    }, 1000);
  };

  // Initial call to generateAndBroadcast
  generateAndBroadcast();
};

module.exports = {
  generateAndBroadcastNumber,
};
