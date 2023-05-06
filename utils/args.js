const args = process.argv.slice(2);

const variables = {};

// Iterate through the arguments and parse key-value pairs
for (let arg of args) {
  const [key, value] = arg.split('=');
  variables[key] = value;
}

module.exports = variables;