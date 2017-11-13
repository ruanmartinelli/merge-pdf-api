start:
	docker-compose up --build -d

list:
	docker ps -a

stop:
	docker-compose down --remove-orphans

wipe:
	docker-compose down --remove-orphans --rmi all

default: start