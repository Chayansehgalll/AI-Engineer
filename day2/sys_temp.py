import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
my_api_key = os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key nhi h veere !!")
    
client = Groq(api_key=my_api_key)
model = "llama-3.3-70b-versatile"

prompt = "Suggest me a name for my food app"
message_system={
    "role":"system",
    "content":"You are a goated brand manager who suggests name for my food app in one word"
}
message={
        "role": "user",
        "content": prompt
    }
messages = [message_system,message]
# temperature is creativity by the model, higher temperature means more creativity, only[0,1,2]
response = client.chat.completions.create(model=model, messages=messages, temperature=2) 
# print(response)
print(response.choices[0].message.content)
print("Script completed")
