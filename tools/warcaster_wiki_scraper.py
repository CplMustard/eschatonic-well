import requests

response = requests.get("https://privateerpress.wiki/index.php?title=Paladin_Commander&action=edit")
print(response.content)