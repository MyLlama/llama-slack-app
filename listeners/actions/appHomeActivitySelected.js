const appHomeActivitySelectedCallback = async ({body, ack, client}) => {
    await ack();
    // access the value of the selected option 
    console.log(Object.values(body.view.state.values)[0].activity.selected_option.value);
    client.chat.postMessage({
        channel: body.user.id,
        text: "Text message https://youtu.be/EjO6qH9rCOg?si=PRiou71iFLugFbyZ"
    })
}

module.exports = { appHomeActivitySelectedCallback };