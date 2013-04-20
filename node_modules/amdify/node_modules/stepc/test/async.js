require('./helper');

var selfText = fs.readFileSync(__filename, 'utf8');

// This example tests passing async results and sync results to the next layer

expect('one');
expect('two');
expect('three');
Step.async(
  function readSelf() {
    fulfill("one");
    fs.readFile(__filename, 'utf8', this);
    return 1;
  },
  function capitalize(err, text) {
    fulfill("two");
    if (err) throw err;
    assert.equal(selfText, text, "Text Loaded");

    setTimeout(
      function () {
        this(null, text.toUpperCase());

      // argument for "next" argument
      }.bind(this),
      500
    );
    return 1;
  },
  function showIt(err, newText, next) {
    fulfill("three");
    if (err) throw err;
    assert.equal(selfText.toUpperCase(), newText, "Text Uppercased");
  }
);
