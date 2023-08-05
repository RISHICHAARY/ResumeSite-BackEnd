const express = require('express');
const cors = require('cors');

const { Configuration, OpenAIApi } = require("openai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});


app.listen(process.env.port || 3001 , () => {
    console.log("Server On");
} );


app.put("/PutQuerry" , async (req,res)=>{

    const openai = new OpenAIApi(configuration);

    const history = [];

    const user_input = req.body.Question;

    const messages = [];
    for (const [input_text, completion_text] of history) {
    messages.push({ role: "user", content: input_text });
    messages.push({ role: "assistant", content: completion_text });
    }

    messages.push({ role: "user", content: user_input });

    try {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    const completion_text = completion.data.choices[0].message.content;
    res.send(completion_text)

    history.push([user_input, completion_text]);
    } catch (error) {
    if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
    } else {
        console.log(error.message);
    }
}})