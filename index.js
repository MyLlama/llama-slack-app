const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("The slack app is running");
})();

app.event('app_home_opened', ({event, say, client}) => {
    // slack app home is opened for the first time 
    // console.log(event)
    if(event.tab === 'home' && !event.view) {
        // send welcome message
        say(`Hi <@${event.user}> /n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ultrices dui sapien eget mi proin. Aliquet lectus proin nibh nisl condimentum. Vitae tempus quam pellentesque nec nam. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. Nunc sed augue lacus viverra vitae congue. Malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi. Duis ut diam quam nulla porttitor massa id neque aliquam. Amet facilisis magna etiam tempor. Egestas sed sed risus pretium quam vulputate dignissim suspendisse in. Senectus et netus et malesuada fames ac. Sit amet consectetur adipiscing elit duis. Sagittis aliquam malesuada bibendum arcu. Pellentesque nec nam aliquam sem et tortor consequat id porta.`);
        // console.log(event.user);
    }
    if(event.tab === "home") {
        try {
            client.views.publish({
                user_id: event.user,
                view: {
                    type: 'home',
                    callback_id: 'home_view',
                    blocks: [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": ":star: Recommended",
                                "emoji": true
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "actions",
                            "elements": [
                                {
                                    "type": "static_select",
                                    "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select an activity",
                                        "emoji": true
                                    },
                                    "options": [
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Short break",
                                                "emoji": true
                                            },
                                            "value": "value-0"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Take a deep breath",
                                                "emoji": true
                                            },
                                            "value": "value-1"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Desk yoga",
                                                "emoji": true
                                            },
                                            "value": "value-2"
                                        }
                                    ],
                                    "action_id": "activity"
                                }
                            ]
                        }
                    ]
                }
            });

            app.action('activity', async ({body, ack, client}) => {
                await ack();
                // access the value of the selected option 
                console.log(Object.values(body.view.state.values)[0].activity.selected_option.value);
                client.chat.postMessage({
                    channel: body.user.id,
                    text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
                })
            });
        } catch (error) {
            console.log(error);
        }
    }  
});