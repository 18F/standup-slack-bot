module.exports = {
  getStandupReportAttachment(standup, title) {
    if(!title) {
      title = standup.userRealName;
    }

    const color = '#000000'.replace(/0/g, function () {
      return (Math.floor(Math.random()*16)).toString(16);
    });

    const fields = [];
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
      title,
      fields,
      color,
      thumb_url: standup.thumbUrl
    };
  },

  getStandupReportPreviewMessage(standup, channel) {
    const message =
    message.text = `Thanks! Your standup for <#${standup.channel}> is recorded and will be reported at ${timeHelper.getDisplayFormat(channel.time)}. It will look like:`;
  }
};
