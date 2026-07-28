import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
my_api_key = os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key nhi h veere !!")
    
client = Groq(api_key=my_api_key)
model = "llama-3.3-70b-versatile"

prompt = "Do you know KL Rahul"
message ={
        "role": "user",
        "content": prompt
    }
messages = [message]
response = client.chat.completions.create(model=model, messages=messages)
# print(response)
print(response.choices[0].message.content)
print("Script completed")
