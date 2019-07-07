import pymysql
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import sys

# url입력 (나중엔 받아와야해)
res = requests.get(sys.argv[1])
link = sys.argv[1]
soup = BeautifulSoup(res.content, 'html.parser')
title = str(soup.find('title').get_text()).strip()
thumnail = soup.find('meta', {'property': 'og:image'})
try:
    output = thumnail['content']
except TypeError:
    output = "https://hyeongbucket.s3.ap-northeast-2.amazonaws.com/kwon.jpg"

# YYYY/mm/dd HH:MM:SS 형태의 시간 출력
date = datetime.today().strftime("%Y/%m/%d %H:%M:%S")

print(title)
print(output)
print(link)
print(date)
# Connect to the database
conn = pymysql.connect(host='artic.cvvhkxkqobt2.ap-northeast-2.rds.amazonaws.com',
                       user='rdd9223',
                       password='artic1234',
                       db='artic',
                       charset='utf8')
try:
    with conn.cursor() as cursor:
        sql = 'INSERT INTO article (article_title, thumnail, link, date) VALUES (%s, %s, %s, %s)'
        cursor.execute(sql, (title, output, link, date))
    conn.commit()
    print(cursor.lastrowid)
finally:
    conn.close()
