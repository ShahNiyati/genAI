import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import {exec} from 'child_process';
import{promisify} from 'util';
import os from 'os';

const asyncExecute = promisify(exec);
const platform = os.platform();
const History=[];
const ai = new GoogleGenAI({ apiKey: "{Your_API_Key}"});

//create a tool that run or execute the command of terminal or shell
async function executeCommand({command}){
    try{
        //if command is right but output code is wrong then error goes to stderr 
        const {stdout,stderr} = await asyncExecute(command);
        if(stderr){
            return `Error : ${stderr}`
        }
        return `Success : ${stdout} || Task executed completely`
    }//if command is wrong then controle goes to catch block;
    catch(error){
        return `Error : ${error}`
    }
}

//declaration for LLM
const executeCommandDeclaration = {
    name:'executeCommand',
    description:'Execture a single terminal/shell command. A command can be create a folder or file, edit the file, read and write the file and delete the file.',
    parameters:{
        type:'OBJECT',
        properties:{
            command:{
                type:'STRING',
                description:'It will be a single terminal command example : mkdir calculator.'
            },
        },
        required:['command']
    }
}

//all list of functions
const availableTools={
    executeCommand
}
//Decide which function should execute according to user requirement
async function runAgent(userProblem){
    History.push({
        role:'user',
        parts:[{text:userProblem}]
    });
    while(true){
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents:History,
        config:{
            systemInstruction:`You are an website builder expert. You have to create the frontend of the website by analyzing from user input. 
                                You have access of tools which can run and execute any shell or terminal command.
                                Current user operating system is ${platform}
                                Give command to the user according to its operating system support. 
                                WHat is your job?
                                   1: Analyze the user query to see what type of website they want to build 
                                   2: Give them command step by step 
                                   3: Use available tool executeCommand 
                                   
                                Now you can give them answer in following below 
                                1: create a folder , ex: mkdir "calculator"
                                2: inside the folder , create index.html file. ex: touch "calculator/index.html"
                                3: then create style.css  ex: touch "calculator/style.css"
                                4: then create script.js  ex: touch "calculator/script.js"
                                5: write a code in html file
                             you have to provide the terminal command to user they will directly execture it   `,


            tools:[{
                functionDeclarations:[executeCommandDeclaration]
            }],
        }
    });
    if(response.functionCalls && response.functionCalls.length>0){
        const {name,args} = response.functionCalls[0];
        const funcCall= availableTools[name];
        if(!funcCall){
            console.log(`Function ${name} is not defined in availableTools.`);
        }
        else{
            const result= await funcCall(args);
            const functionResponsePart={
                name:name,
                response:{
                    result:result,
                },
            };
            History.push({
                role:"model",
                parts:[
                    {
                        functionCall: response.functionCalls[0],
                    },
                ],
            });
            History.push({
                role:'user',
                parts:[
                    {
                        functionResponse: functionResponsePart,
                    },
                ],
            });
        }
        
    }
    else if(response.candidates && response.candidates.length > 0){
        const parts = response.candidates[0].content.parts;
        if (parts) {
            parts.forEach(part => {
                if(part.text){
                    console.log(part.text);
                }
            });
        } else {
            console.log("No parts returned in candidate.");
        }
        break; // ✅ exit while loop after printing final text
    }
    else{
        console.log("⚠️ No candidates returned by AI. Full response:");
        // console.log(JSON.stringify(response, null, 2));
        break;
    }
    
}
}
async function main(){
    console.log("I am MagicPointer : Let's Create a Website. ");
    while(true){
        const userProblem = readlineSync.question("Ask me Anything (type 'exit' to quit): ");
        if(userProblem.toLowerCase() === 'exit'){
            console.log("Goodbye!");
            break;
        }
        await runAgent(userProblem);
    }
}
main();

