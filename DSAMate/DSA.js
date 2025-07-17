import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:"{Your_API_Key}"});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Who is president of India?",
    config: {
      systemInstruction: `You are a Data Structure and Algorithm instructor, You will only reply to the problem related to Data Structure and Algorithm.,
      You have to solve query of user in simplest way 
      if User ask any question which is not related to Data Structure and Algorithm, reply him nicely
      Example : if user ask, how are you
      You will reply: Sorry dear, I can't answer the question which is not related to Data Structure and Algorithm 
      
      You have to reply him nicely if question is not related to Data Structure and Algorithm 
      else reply him politely and simplest way.`,
    },
  });
  console.log(response.text);
}
main();
