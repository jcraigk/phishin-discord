.PHONY: dev install

dev:
	npm run dev

install:
	npm install

start:
	npm start

spec:
	npx vitest --reporter=dot
