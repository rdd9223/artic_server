import pymysql
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import sys


# Connect to the database
conn = pymysql.connect(host='artic.cvvhkxkqobt2.ap-northeast-2.rds.amazonaws.com',
                             user='rdd9223',
                             password='artic1234',
                             db='artic',
                             charset='utf8')
# url입력 (나중엔 받아와야해)
res = requests.get('https://medium.com/@mklab.co/%EB%B9%84%EC%A6%88%EB%8B%88%EC%8A%A4-%EA%B8%B0%ED%9A%8D-%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B8%B0%ED%9A%8D%EC%9D%98-%EC%A0%95%EC%9D%98-27594a1f18ec')
soup = BeautifulSoup(res.content, 'html.parser')
title = soup.find('title')
thumnail = soup.find('meta', {'property':'og:image'})
output = thumnail['content']
date = datetime.today().strftime("%Y/%m/%d %H:%M:%S")  # YYYY/mm/dd HH:MM:SS 형태의 시간 출력

print(title.get_text())
print(output)

print(date) 

try:
    with conn.cursor() as cursor:
        sql = 'INSERT INTO article (article_title, thumnail, date) VALUES (%s, %s, %s)'
        cursor.execute(sql, (str(title.get_text()), str(output),str(date)))
    conn.commit()
    print(cursor.lastrowid)
finally:
    conn.close()
