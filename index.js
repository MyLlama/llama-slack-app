const { App } = require('@slack/bolt');
require('dotenv').config();
const axios = require('axios');
const mongoose = require("mongoose");
const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');

const expressApp = express();
expressApp.use(express.json());
const connection = mongoose.connect(process.env.MONGO_URL)

const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

expressApp.use(bodyParser.urlencoded({extended: true}));

expressApp.listen(3001, async () => {
    try {
        await connection;
        console.log("Connected to DB");
        } catch (e) {
        console.log("Not Connected to DB");
    }
})

expressApp.get("/", (req, res) => {
    res.send("Api is working fine");
});



const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: String,
    id: String,
    token: String,
    timestamp: Number,
  },
  {
    versionKey: false,
  }
);

const checkinSchema = new Schema(
    {
        id: String,
        resp: Array,
        timestamp: Number,
    },
    {
      versionKey: false,
    }
);

const userModel = mongoose.model("users", userSchema);
const checkinModel = mongoose.model("checkin", checkinSchema);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("The slack app is running");
})();

//Endpoint for storing daily checkin feedback
expressApp.post("/checkin", async (req, res) => {
    const { id, resp } = req.body;

    try {
        const data = new checkinModel({ id, resp, timestamp: Math.floor(Date.now() / 1000) });
        await data.save();
        res.status(200).json({ success: true, message: "Feedback added Successfully" });
    } catch(err) {
        console.error(err);
        res.status(500).json({
            success: false, message: "An error occurred while processing the feedback",
        });
    }
});

expressApp.get("/checkin", async (req,res) => {
    const data = await userModel.find();
    res.send(data);
});

//Endpoint for storing user token
expressApp.post("/users", async (req, res) => {
    const { name, id, token } = req.body;
    
    try {
      const data = new userModel({ name, id, token, timestamp: Math.floor(Date.now() / 1000), });
      await data.save();
      res.status(200).json({ success: true, message: "Login Successful" });
    }
  
    catch (err) {
      console.error(err);
      res.status(500).json({
        success: false, message: "An error occurred while processing the Login",
      });
    }
});

expressApp.get("/users", async (req,res) => {
    let data;
    if (req.query.id) data = await userModel.find({id: req.query.id});
    else data = await userModel.find();
    res.send(data);
});

app.event('app_home_opened', async ({event, say, client}) => {
    const days = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date();
    const currentDay = days[date.getDay()];

    const user = await axios.get(`http://localhost:3001/users?id=${event.user}`, {
        id: event.user
    });
    //Render home view
    let homeView;
    if(!user.data.length) {
        homeView = {
            type: 'home',
            callback_id: 'home_view',
            blocks: [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `Happy ${currentDay}!`,
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": ":wave: Hey, how do you feel today? Take a 30-sec check-in!",
                        "emoji": true
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": ":memo: Check-in",
                                "emoji": true
                            },
                            "value": "click_me_123",
                            "action_id": "openDailyCheckinModal"
                        }
                    ]
                },
                {
                    "type": "divider"
                },
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
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "Login",
                                "emoji": true
                            },
                            "value": "click_me_123",
                            "action_id": "openLoginModal"
                        }
                    ]
                }
            ]
        }
    } else {
        homeView = {
            type: 'home',
            callback_id: 'home_view',
            blocks: [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `Happy ${currentDay}!`,
                        "emoji": true
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": ":wave: Hey, how do you feel today? Take a 30-sec check-in!",
                        "emoji": true
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": ":memo: Check-in",
                                "emoji": true
                            },
                            "value": "click_me_123",
                            "action_id": "openDailyCheckinModal"
                        }
                    ]
                },
                {
                    "type": "divider"
                },
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
    }

    // slack app home is opened for the first time 
    if(event.tab === 'home' && !event.view) {
        // send welcome message
        say(`Hi <@${event.user}> \n Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ultrices dui sapien eget mi proin. Aliquet lectus proin nibh nisl condimentum. Vitae tempus quam pellentesque nec nam. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. Nunc sed augue lacus viverra vitae congue. Malesuada fames ac turpis egestas maecenas pharetra convallis posuere morbi. Duis ut diam quam nulla porttitor massa id neque aliquam. Amet facilisis magna etiam tempor. Egestas sed sed risus pretium quam vulputate dignissim suspendisse in. Senectus et netus et malesuada fames ac. Sit amet consectetur adipiscing elit duis. Sagittis aliquam malesuada bibendum arcu. Pellentesque nec nam aliquam sem et tortor consequat id porta.`);
    }
    if(event.tab === "home") {
        try {
            
            client.views.publish({
                user_id: event.user,
                view: homeView
            });

        } catch (error) {
            console.log(error);
        }
    }  
});

app.action('activity', async ({body, ack, client}) => {
    await ack();
    client.chat.postMessage({
        channel: body.user.id,
        text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
    })
});


// Daily checkin modal
app.action('openDailyCheckinModal', async({body, ack, client}) => {

    await ack();
    client.views.open({
        trigger_id: body.trigger_id,
        view: {
            "type": "modal",
            "callback_id": "dailyCheckinFeedback",
            "title": {
                "type": "plain_text",
                "text": "Workplace check-in",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit",
                "emoji": true
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `:wave: Hey ${body.user.name}!`,
                        "emoji": true
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "input",
                    "element": {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select an item",
                            "emoji": true
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":smile:",
                                    "emoji": true
                                },
                                "value": "5"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":grinning:",
                                    "emoji": true
                                },
                                "value": "4"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_smiling_face:",
                                    "emoji": true
                                },
                                "value": "3"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":confused:",
                                    "emoji": true
                                },
                                "value": "2"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_frowning_face:",
                                    "emoji": true
                                },
                                "value": "1"
                            }
                        ],
                        "action_id": "How are you feeling physically today?"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": ":muscle: How are you feeling physically today?",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    "element": {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select an item",
                            "emoji": true
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":smile:",
                                    "emoji": true
                                },
                                "value": "5"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":grinning:",
                                    "emoji": true
                                },
                                "value": "4"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_smiling_face:",
                                    "emoji": true
                                },
                                "value": "3"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":confused:",
                                    "emoji": true
                                },
                                "value": "2"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_frowning_face:",
                                    "emoji": true
                                },
                                "value": "1"
                            }
                        ],
                        "action_id": "How are you feeling mentally today?"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": ":zap: How are you feeling mentally today?",
                        "emoji": true
                    }
                },
                {
                    "type": "input",
                    "element": {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select an item",
                            "emoji": true
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":smile:",
                                    "emoji": true
                                },
                                "value": "5"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":grinning:",
                                    "emoji": true
                                },
                                "value": "4"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_smiling_face:",
                                    "emoji": true
                                },
                                "value": "3"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":confused:",
                                    "emoji": true
                                },
                                "value": "2"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": ":slightly_frowning_face:",
                                    "emoji": true
                                },
                                "value": "1"
                            }
                        ],
                        "action_id": "How socially connected do you feel today?"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": ":busts_in_silhouette: How socially connected do you feel today?",
                        "emoji": true
                    }
                }
            ]
        }
    })
})

//Slash command
app.command('/activity', async ({body, ack, client}) => {
    await ack();
    client.chat.postMessage({
        channel: body.user_id,
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Select an activity.",
                    "emoji": true
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Short break",
                            "emoji": true
                        },
                        "value": "click_me_123",
                        "action_id": "shortBreak"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Take a deep breath",
                            "emoji": true
                        },
                        "value": "click_me_13",
                        "action_id": "deepBreath"
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Desk yoga",
                            "emoji": true
                        },
                        "value": "click_me_13",
                        "action_id": "deskYoga"
                    }
                ]
            }
        ]
    });
});


//Actions to send video link in message
app.action('shortBreak', async ({body, ack, client}) => {
    await ack();
    client.chat.postMessage({
        channel: body.user.id,
        text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
    })
});

app.action('deepBreath', async ({body, ack, client}) => {
    await ack();
    client.chat.postMessage({
        channel: body.user.id,
        text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
    })
});

app.action('deskYoga', async ({body, ack, client}) => {
    await ack();
    client.chat.postMessage({
        channel: body.user.id,
        text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
    })
});

app.action('setUsername', async ({body, ack, client}) => {
    await ack();
});

app.action('setPassword', async ({body, ack, client}) => {
    await ack();   
});

//Render login modal.
app.action('openLoginModal', async({body, ack, client}) => {
    await ack();
    client.views.open({
        trigger_id: body.trigger_id,
        view: {
            "type": "modal",
            "callback_id": 'loginModal',
            "title": {
                "type": "plain_text",
                "text": "Login to Moodle",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit"
            },
            "blocks": [
                {
                    "dispatch_action": true,
                    "block_id": "username",
                    "type": "input",
                    "element": {
                        "type": "plain_text_input",
                        "dispatch_action_config": {
                            "trigger_actions_on": [
                                "on_character_entered"
                            ]
                        },
                        "action_id": "setUsername"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Username",
                        "emoji": true
                    }
                },
                {
                    "dispatch_action": true,
                    "block_id": "password",
                    "type": "input",
                    "element": {
                        "type": "plain_text_input",
                        "dispatch_action_config": {
                            "trigger_actions_on": [
                                "on_character_entered"
                            ]
                        },
                        "action_id": "setPassword"
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Password",
                        "emoji": true
                    }
                },  
            ]
        }       
        
    })
});

// Access user's mooodle credentials from login modal and store in DB.
app.view('loginModal', async ({body, ack, client}) => {
    await ack();
    const username = body.view.state.values['username']['setUsername'].value;
    const password = body.view.state.values['password']['setPassword'].value;
    const resp = await axios.get(`https://learn.myllama.co/login/token.php?username=${username}&password=${password}&service=moodle_mobile_app`);
    await axios.post(`http://localhost:3001/users`, {
        name: body.user.name,
        id: body.user.id,
        token: resp.data.token,
    });
});


// Access user's daily checkin feedback and store in DB.
app.view('dailyCheckinFeedback', async ({body, ack, client}) => {
    await ack();
    let resp = Object.values(body.view.state.values).map(value => {
        return {
            question: Object.keys(value)[0],
            answer: Object.values(value)[0].selected_option.value
        }
    });
    await axios.post(`http://localhost:3001/checkin`, {
        id: body.user.id,
        resp: resp,
    });
});


//Fetch moodle deadlines
async function getCalenderDayView(token) {
    try {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth()+1;
        const year = date.getFullYear();
        let resp = await axios.get(`https://learn.myllama.co/webservice/rest/server.php?wstoken=${token}`, {
            params: {
                'wsfunction': 'core_calendar_get_calendar_day_view',
                'moodlewsrestformat': 'json',
                'year': year,
                'month': month,
                'day': day
            }
        });

      return resp.data;
    } catch(error){
      console.error(error);
    }
}

// schedule moodle deadlines messages.
async function scheduleMoodleEventsMessages() {
    const users = await axios.get(`http://localhost:3001/users`);
    
    users.data.map(async (user) => {
       const resp = await getCalenderDayView(user.token);
       if(resp.events.length) {
            resp.events.map(async (event) => {
                await app.client.chat.postMessage({
                    channel: user.id,
                    blocks: [
                        {
                            "type": "header",
                            "text": {
                                "type": "plain_text",
                                "text": `${event.name}`,
                                "emoji": true
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": `${event.description.replace(/<[^>]+>/g, '')}` 
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": `<${event.viewurl}>`
                            }
                        }
                    ]
                })
            })
        }
    })
}

schedule.scheduleJob({hour: 10}, scheduleMoodleEventsMessages);