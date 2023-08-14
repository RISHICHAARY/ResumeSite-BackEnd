const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Base64 = require('Base64');
const pdfjsLib = require("pdfjs-dist");

const { Configuration, OpenAIApi } = require("openai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
    apiKey:process.env.OPENAI_API_KEY,
});


app.listen(process.env.port || 3001 , () => {
    console.log("Server On");
} );

app.put("/SaveFile" , async (req,res)=>{
    const base64Data = req.body.File.split('base64,')[1];
    const tmpFilePath = path.join(`./${Math.random().toString(36).substr(7)}.pdf`);
    var bin = Base64.atob(req.body.File);
    fs.writeFile(tmpFilePath, base64Data, 'base64', async (error) => {
        if (error) {
            throw error;
        } else {
            let doc = await pdfjsLib.getDocument(tmpFilePath).promise;
            let page1 = await doc.getPage(1);
            let content = await page1.getTextContent();
            let strings = content.items.map(function(item) {
                return item.str;
            });

            let i=0;
            let finalString = '';
            for(i=0;i<strings.length;i++){
                if(strings[i] == ''){
                    finalString = finalString+" ";
                }
                else{
                    finalString = finalString+strings[i]
                }
            }
            const openai = new OpenAIApi(configuration);

            const history = [];

            const user_input = finalString+" ANALYSE AND RUN A DIFFUCULT RATING OF CANDIDATE RATE OUT OF 10 WITH OVERALL RATING , MAKE THE EVALUVATION STRICT  ON EACH ASPECT BASED ON THIS INFO";

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
        }
        fs.unlinkSync(tmpFilePath);
        }

    });
})

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