.PHONY: dev install

NAME = phishin-discord
TAG = latest

dev:
	npm run dev

install:
	npm install

spec:
	npx vitest --reporter=dot

build:
	docker build -t $(NAME):$(TAG) .

up: down
	docker run --name $(NAME) \
		--network host \
		--env-file .env \
		$(NAME):$(TAG)

down:
	docker stop $(NAME) || true
	docker rm $(NAME) || true

restart: down build up

logs:
	docker logs -f $(NAME)

shell:
	docker exec -it $(NAME) /bin/bash

clean: down
	docker rmi $(NAME):$(TAG) || true
