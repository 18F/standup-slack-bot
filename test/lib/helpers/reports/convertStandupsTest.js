

const assert = require('assert');
const convertStandups = require('../../../../lib/helpers/reports/convertStandups');

describe('convertStandups', () => {
  const standups = [{
    id: 180,
    channel: 'channelName',
    date: new Date('2017-01-09T08:00:00.000Z'),
    user: null,
    userRealName: 'mo',
    thumbUrl: null,
    yesterday: null,
    today: null,
    blockers: null,
    goal: null,
    createdAt: new Date('2017-01-09T20:23:56.978Z'),
    updatedAt: new Date('2017-01-09T20:23:56.978Z')
  }, {
    id: 181,
    channel: 'channelName',
    date: new Date('2017-01-09T08:00:00.000Z'),
    user: null,
    userRealName: 'larry',
    thumbUrl: null,
    yesterday: null,
    today: null,
    blockers: null,
    goal: null,
    createdAt: new Date('2017-01-09T20:23:56.978Z'),
    updatedAt: new Date('2017-01-09T20:23:56.978Z')
  }, {
    id: 182,
    channel: 'channelName',
    date: new Date('2017-01-09T08:00:00.000Z'),
    user: null,
    userRealName: 'shemp',
    thumbUrl: null,
    yesterday: null,
    today: null,
    blockers: null,
    goal: null,
    createdAt: new Date('2017-01-09T20:23:56.978Z'),
    updatedAt: new Date('2017-01-09T20:23:56.978Z')
  }];

  function mapConversion(key) {
    return convertStandups(standups).map(attachment => attachment[key]);
  }

  it('includes an object for each user', () => {
    const data = mapConversion('title');
    assert.deepEqual(data, ['mo', 'larry', 'shemp']);
  });

  it('includes fields thumbnail info', () => {
    let data;
    data = mapConversion('fields');
    assert.deepEqual(data, [[], [], []]);
    data = mapConversion('thumbnail_info');
    assert.deepEqual(data, [null, null, null]);
  });

  it('generates random color information', () => {
    const data = mapConversion('color');
    assert(data[0].match(/#[0-9a-f]{6}/));
    assert(data[1].match(/#[0-9a-f]{6}/));
    assert(data[2].match(/#[0-9a-f]{6}/));
    assert(data[0] !== data[1]);
    assert(data[1] !== data[2]);
    assert(data[0] !== data[2]);
  });
});
