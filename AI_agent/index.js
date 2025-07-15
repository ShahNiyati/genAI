import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
const History=[];
const ai = new GoogleGenAI({ apiKey: "{YOUR_API_Key}"});

//Sum function
function sum({num1,num2}){
    return num1+num2;
}
//Sum function declaration
const sumDeclaration = {
    name:'sum',
    description:'Get the sum of two number.',
    parameters:{
        type:'OBJECT',
        properties:{
            num1:{
                type:'NUMBER',
                description:'it will be first number for addition ex:20'
            },
            num2:{
                type:'NUMBER',
                description:'it will be second number for addition ex:24'
            }
        },
        required:['num1','num2']
    }
}
//Prime function 
function prime({num}){
    if(num<2){
        return false;
    }
    for(let i=2;i<=Math.sqrt(num);i++){
        if(num%i==0){
            return false;
        }
    }
    return true;
}
//prime function declaration
const primeDeclaration = {
    name:'prime',
    description:'Get if number is prime or not',
    parameters:{
        type:'OBJECT',
        properties:{
            num:{
                type:'NUMBER',
                description:'it will be  number to find it is prime or not ex:30'
            },
        },
        required:['num']
    }
}
//crypto function
async function getCrytoPrice({coin}){
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
    const data = await response.json();
    return data;
}
//crypto function declaration
const cryptoDeclaration = {
    name:'getCrytoPrice',
    description:'Get the current price of any crypto Currency like bitcoin',
    parameters:{
        type:'OBJECT',
        properties:{
            coin:{
                type:'STRING',
                description:'It will be the crypto currency name like bitcoin'
            },
        },
        required:['coin']
    }
}
//all list of functions
const availableTools={
    sum:sum,
    prime:prime,
    getCrytoPrice:getCrytoPrice,
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
            systemInstruction:`You are an AI agent. You have access of 3 available tools likes to find
                                sum of two numbers and get crypto price of any currency or find number prime or not use this 
                                tools wherever required to confirm user querry. if user ask general questions you can answer it directly
                                if you dont need this 3 tools.`,
            tools:[{
                functionDeclarations:[sumDeclaration,primeDeclaration,cryptoDeclaration]
            }],
        }
    });
    if(response.functionCalls && response.functionCalls.length>0){
        const {name,args} = response.functionCalls[0];
        const funcCall= availableTools[name];
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
    else if(response.candidates){
        const parts = response.candidates[0].content.parts;
        parts.forEach(part => {
            if(part.text){
                console.log(part.text);
            }
        });
        break; // ✅ exit while loop after printing final text
    }
}
}
async function main(){
    const userProblem = readlineSync.question("Ask me Anything : " );
    await runAgent(userProblem);
    main();
}
main();

