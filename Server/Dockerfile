# 사용할 Node.js 버전 지정
FROM node:16

# 애플리케이션 디렉토리 생성
WORKDIR /usr/src/app

# 애플리케이션 의존성 설치
# package.json과 package-lock.json을 복사
COPY package*.json ./

# npm을 통해 필요한 패키지 설치
RUN npm install

# 애플리케이션 소스 추가
COPY . .

# 앱이 3002 포트에서 실행되도록 설정
EXPOSE 3002

# 서버 실행
CMD [ "node", "server.js" ]
