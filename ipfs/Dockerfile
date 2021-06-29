FROM node:12

# アプリケーションディレクトリを作成する
WORKDIR /app
RUN mkdir /app/src
RUN mkdir /app/orbitdb


# アプリケーションの依存関係をインストールする
# ワイルドカードを使用して、package.json と package-lock.json の両方が確実にコピーされるようにします。
# 可能であれば (npm@5+)
COPY /ipfs/package.json /app

RUN npm install
# 本番用にコードを作成している場合
# RUN npm install --only=production

# アプリケーションのソースをバンドルする
# COPY . .

EXPOSE 8080
# CMD [ "npm", "start" ]
# CMD [ "node", "server.js" ]