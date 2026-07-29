import re

with open("app/services/agent.py", "r", encoding="utf-8") as f:
    content = f.read()

# Locate the blocks
b1_idx = content.find("    # 1. Intent: Download PDF")
b2_idx = content.find("    # 2. Intent: Run Audit")
b3_idx = content.find("    # 3. Intent: Profit & Loss")
b4_idx = content.find("    # 4. Intent: Balance Sheet")
b5_idx = content.find("    # 5. Intent: Add Transaction")
b6_idx = content.find("    # 6. Fallback:")

# Extract Intent 5
intent_5 = content[b5_idx:b6_idx]
# Modify tx_keywords in intent_5
intent_5 = intent_5.replace("\"khareeda\", \"laga\", \"diye\", \"mil gaye\"]", "\"khareeda\", \"laga\", \"diye\", \"mil gaye\", \"mile\", \"mila\", \"kama\", \"kharida\", \"becha\", \"kamai\", \"sales\"]")
# Modify income_keywords in intent_5
intent_5 = intent_5.replace("\"becha\", \"kamai\"", "\"becha\", \"kamai\", \"mile\", \"mila\"")

# Construct new content:
# Everything before Intent 1 (which includes setup)
part_start = content[:b1_idx]

# Everything between Intent 1 and Intent 5
part_middle = content[b1_idx:b5_idx]

# Everything from Fallback onwards
part_end = content[b6_idx:]

new_content = part_start + intent_5 + part_middle + part_end

with open("app/services/agent.py", "w", encoding="utf-8") as f:
    f.write(new_content)

print("success")
