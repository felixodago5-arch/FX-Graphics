import pandas as pd

# Load both Excel files
my_list = pd.read_excel(r"C:\Users\Felix\CrossDevice\Anonymous (1)\system software\data compare\my_list.xlsx")
client_list = pd.read_excel(r"C:\Users\Felix\CrossDevice\Anonymous (1)\system software\data compare\client_list.xlsx")

# Compare by the name column (change "Name" if your Excel has a different title like "Full Name")
missing = client_list[~client_list["Name"].isin(my_list["Name"])]

# Save missing ones to a new Excel file
missing.to_excel(r"C:\Users\Felix\CrossDevice\Anonymous (1)\system software\data compare\missing_names.xlsx", index=False)

print("✅ Done! Missing names saved to missing_names.xlsx")