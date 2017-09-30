

const assert = require('assert');
const generateFields = require('../../../../lib/helpers/reports/generateFields');

describe('generateFields', () => {
  const attachments = [
    {
      title: 'mo',
      fields: [{ title: 'Today', value: 'Out of Office' }],
      color: '#8a12d3',
      Today: 'we have some <#two> and <#threeStooges> here. Also <#two>'
    },
    {
      title: 'larry',
      fields: [{ title: 'Today', value: 'only <#two> :pager:' }],
      color: '#0fd249'
    },
    {
      title: 'shemp',
      fields: [{ title: 'Today', value: 'ooo' }],
      color: '#d541d1'
    }
  ];

  it('identifiers number of people who have been heard from', () => {
    const header = generateFields(attachments)[0];
    assert.equal(header.title, 'Heard from');
    assert.equal(header.value, '3 people');
  });

  it('remarks about common projects', () => {
    const header = generateFields(attachments)[1];
    assert.equal(header.title, 'Common projects');
    assert.equal(header.value, '- <#two> (2)\n');
  });

  it('remarks about availability of members', () => {
    const header = generateFields(attachments)[2];
    assert.equal(header.title, 'Available today :pager:');
    assert.equal(header.value, '- larry\n');
  });

  it('remarks about people out of office', () => {
    const header = generateFields(attachments)[3];
    assert.equal(header.title, 'Out today');
    assert.equal(header.value, '- mo\n- shemp\n');
  });
});
