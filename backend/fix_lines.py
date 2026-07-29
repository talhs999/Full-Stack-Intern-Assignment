import sys

with open("app/services/agent.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

tx_block = lines[105:174]

# Modify tx_keywords
tx_block[2] = tx_block[2].replace(
    '"khareeda", "laga", "diye", "mil gaye"]', 
    '"khareeda", "laga", "diye", "mil gaye", "mile", "mila", "kama", "kharida", "becha", "kamai", "sales"]'
)

# Modify income_keywords
tx_block[12] = tx_block[12].replace(
    '"becha", "kamai"', 
    '"becha", "kamai", "mile", "mila"'
)

# Build new file
new_lines = lines[:30] + tx_block + lines[30:105] + lines[174:]

with open("app/services/agent.py", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("SUCCESS")
