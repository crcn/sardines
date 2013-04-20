require('./helper');

var selfText = fs.readFileSync(__filename, 'utf8');

// This example tests passing async results and sync results to the next layer

expect('four');
expect('five');
expect('six');

var context = {};
Step(
  context,
  function readSelf(e, next) {
    fulfill("four");
    assert.strictEqual(this, context);
    fs.readFile(__filename, 'utf8', next);
  },
  function capitalize(err, text, next) {
    fulfill("five");
    assert.strictEqual(this, context);
    if (err) throw err;
    assert.equal(selfText, text, "Text Loaded");
    return text.toUpperCase();
  },
  function showIt(err, newText, next) {
    fulfill("six");
    assert.strictEqual(this, context);
    if (err) throw err;
    assert.equal(selfText.toUpperCase(), newText, "Text Uppercased");
  }
);
