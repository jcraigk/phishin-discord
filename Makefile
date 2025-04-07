.PHONY: dev install

dev:
	npm run dev

install:
	npm install

spec:
	npx vitest --reporter=dot
