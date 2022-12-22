from bs4 import BeautifulSoup
import requests

response = requests.get("https://privateerpress.wiki/index.php?title=Paladin_Commander")
print(response.encoding)

soup = BeautifulSoup(response.content, 'html.parser')

print(soup.prettify())