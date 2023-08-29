const { appHomeActivitySelectedCallback } = require('./appHomeActivitySelected');


module.exports.register = (app) => {
    app.action('app-home-activity-selected', appHomeActivitySelectedCallback);
};