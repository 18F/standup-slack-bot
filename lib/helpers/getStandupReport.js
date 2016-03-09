'use strict';

module.exports = function getStandupReport(standup) {
  var color = '#000000'.replace(/0/g, function () {
    return (~~(Math.random()*16)).toString(16);
  });
  var fields = [];
  if (standup.yesterday) {
    fields.push({
        title: 'Yesterday',
        value: standup.yesterday,
        short: false
    });
  }
  if (standup.today) {
    fields.push({
      title: 'Today',
      value: standup.today,
      short: false
    });
  }
  if (standup.blockers) {
    fields.push({
      title: 'Blockers',
      value: standup.blockers,
      short: false
    });
  }
  if (standup.goal) {
    fields.push({
      title: 'Goal',
      value: standup.goal,
      short: false
    });
  }

  return {
    title: standup.userRealName,
    fields: fields,
    color: color
  };
};
