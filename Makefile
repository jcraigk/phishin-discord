.PHONY: dev install

dev:
	npm run dev

install:
	npm install

spec:
	npx vitest --reporter=dot

# Docker image name and tag
IMAGE_NAME = phishin-discord
IMAGE_TAG = latest
CONTAINER_NAME = phishin-discord-container

build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

up: down
	docker run --name $(CONTAINER_NAME) \
		--network host \
		--env-file .env \
		$(IMAGE_NAME):$(IMAGE_TAG)

down:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

restart: down build up

logs:
	docker logs -f $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) /bin/bash

clean: down
	docker rmi $(IMAGE_NAME):$(IMAGE_TAG) || true
