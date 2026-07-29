import os
from pathlib import Path
from time import sleep
from dotenv import load_dotenv
from groq import Groq
import re

load_dotenv()
my_api_key=os.getenv("GROQ_API_KEY")

if not my_api_key:
    raise ValueError("API key kaha hai bhai")

client=Groq(api_key=my_api_key)
model="llama-3.3-70b-versatile"

def get_product_price(product):
    if product == 'iPhone 17':
        return 1000
    elif product == "iPhone 15":
        return 500
    else:
        return 0
    
def calculator(expression):
    try:
        return eval(expression)
    except:
        return "calc error!"

tools = {
    "get_product_price": get_product_price,
    "calculator": calculator
}
system_prompt = """
You are a shopping assistant.

You have these tools:

get_product_price(product)
calculator(expression)
IMPORTANT:
Call tools exactly like these examples:

Action: get_product_price("iPhone 17")
Action: calculator("5000 - 1000")

Never write:
get_product_price(product="iPhone 17")

Never write:
calculator(expression="5000 - 1000")
Follow these rules:

1. Decide what you need to do next.
2. Call ONLY ONE tool at a time.
3. After writing an Action, STOP immediately.
4. Never guess or invent a tool result.
5. Wait until you receive an Observation.
6. Then decide your next action.
7. When the task is complete, give the Final Answer.

Format:

Thought: what you need to do
Action: tool_name(argument)

When finished:

Final Answer: your answer
"""

def run_agent(question):

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": question
        }
    ]

    for step in range(5): # only run the loop for 5 steps only to avoid infinite looping

        print("\n------------------")
        print("STEP", step + 1)
        print("------------------")

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0
        )

        answer = response.choices[0].message.content

        print(answer)

        # Agent has finished
        if "Final Answer:" in answer:
            break


        # Find the Action
        match = re.search(
            r"Action:\s*(\w+)\((.*?)\)",
            answer
        )


        if match:

            tool_name = match.group(1) # split the tool name and the argument, this stores tool name that is get_product_price or calculator

            tool_input = match.group(2) # this gets the argument that is passed to the tool, for example "iPhone 17" or "5000 - 1000"

            tool_input = tool_input.strip() # this gets rid of any leading or trailing whitespace from the argument

            tool_input = tool_input.strip('"') # this gets rid of any leading or trailing double quotes from the argument


            # Run the tool
            if tool_name in tools:

                tool = tools[tool_name]

                observation = tool(tool_input)

            else:

                observation = "Tool not found"


            print(
                "Observation:",
                observation
            )


            # Add LLM response to memory
            messages.append({
                "role": "assistant", # assistant role is used to indicate that this message is from the AI assistant and remember the answer from the LLM
                "content": answer
            })


            # Give tool result back to LLM
            messages.append({
                "role": "user",
                "content":
                    "Observation: "
                    + str(observation) # added observation to the conversation history so that the LLM can use it to decide what to do next
            })
            sleep(5)



prompt="""
I have 5000 rupees. What is the price of an iphone 17?
and how much money will I have left?
"""
run_agent(prompt)

#                 User Question
#                       │
#                       ▼
#                run_agent()
#                       │
#                       ▼
#           Send messages to Groq
#                       │
#                       ▼
#         LLM writes an Action (TEXT)
#                       │
#                       ▼
#        Regex extracts tool + argument
#                       │
#                       ▼
#      Python executes the real function
#                       │
#                       ▼
#         Observation (tool result)
#                       │
#                       ▼
#  Add Observation to conversation history
#                       │
#                       ▼
#        Send updated conversation again
#                       │
#                       ▼
#      More tools needed?
#           │                     │
#          Yes                   No
#           │                     │
#           ▼                     ▼
#    Repeat the loop       Final Answer