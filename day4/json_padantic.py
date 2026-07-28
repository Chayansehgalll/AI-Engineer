import os
from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel

load_dotenv()
my_api_key = os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key nhi h veere !!")
    
client = Groq(api_key=my_api_key)
model = "llama-3.3-70b-versatile"

class Ticket(BaseModel):
    name:str
    email:str
    issue:str
schema = Ticket.model_json_schema()

response_format={
    "type": "json_object"
}

system_prompt=f"""
    Extract information from the ticket strictly based on this {schema} and give me a json output
"""
message_system={
    "role":"system",
    "content":system_prompt
}
text="Hi, my name is Chayan, I bought a DAC connector from you but after few weeks, it stopped working. My address is delhi and mail is abc@gmail.com and phone number is 8291929394"
prompt=f"""
    This is a customer ticket. Please extract the personal information from this {text}
"""

message={
        "role": "user",
        "content": prompt
    }
messages = [message_system, message]
response = client.chat.completions.create(model=model, messages=messages, response_format=response_format) 
answer = response.choices[0].message.content
print(answer)

# isko padhna kaise h lekin ?
import json
raw_json=answer
data_file=json.loads(raw_json) #json.loads-> converts json string to python dictionary
ticket=Ticket(**data_file) # **data_file -> unpacking the dictionary and passing the values to the Ticket class constructor
print(ticket.name)
print(ticket.email)
print(ticket.issue)