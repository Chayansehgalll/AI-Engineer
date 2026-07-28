import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
my_api_key = os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key nhi h veere !!")
    
client = Groq(api_key=my_api_key)
model = "llama-3.3-70b-versatile"

prompt1 = "Hi!"
prompt2 = "Explain time travel in detail but under 100 words"
prompt3 = "Write a 150 word essay on Machine Learning"
prompts=[prompt1,prompt2,prompt3]
for prompt in prompts:
    message = {
        "role": "user",
        "content": prompt
    }
    messages = [message]
    response = client.chat.completions.create(
        model=model,
        messages=messages
    )
    usage = response.usage
    print(f"Prompt: {prompt} --> your tokens: {usage.prompt_tokens} completion_tokens: {usage.completion_tokens} --> total_tokens: {usage.total_tokens}")
# print(response)
# print(response.choices[0].message.content)
# print("Script completed")