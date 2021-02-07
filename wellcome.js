const CFonts = require('cfonts');

function wellcome() {
  CFonts.say('Wellcome to', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    space: true,
    env: 'node',
  });
  CFonts.say('Scalable Ws', {
    font: 'block',
    align: 'center',
    colors: ['cyan', 'magenta'],
    space: true,
    env: 'node',
  });
  CFonts.say('by: Felipe Gene', {
    font: 'tiny',
    align: 'center',
    colors: ['cyan'],
    space: true,
    env: 'node',
  });
  CFonts.say('Loading...', {
    font: 'tiny',
    align: 'center',
    colors: ['cyan', 'magenta'],
    space: true,
    env: 'node',
  });
}
module.exports = { wellcome };
